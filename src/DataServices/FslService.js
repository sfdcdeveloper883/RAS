// import { getDemoData } from "./DemoData";
import { beep } from "../utils";

function getRecordId() {
  if (window.fsl == null || window.fsl === undefined) {
    throw new Error("fsl is undefined");
  }

  if (window.fsl.context === undefined) throw new Error("fsl context is undefined");

  return window.fsl.context.record.id;
}

function getUserLanguage() {
  if (window.fsl == null || window.fsl === undefined) {
    throw new Error("fsl is undefined");
  }

  if (window.fsl.context === undefined || window.fsl.context?.user?.language === null) {
    return "en";
  } else {
    return window.fsl.context.user.language.substring(0, 2);
  }
}

function executeSoqlQueryAsync(fieldName, equalsString, objectType, query) {
  return new Promise((resolve, reject) => {
    let idFilter = window.fsl.query.createDataFilter(
      fieldName,
      window.fsl.filterOperators.Equals,
      window.fsl.filterTypes.TypeString,
      equalsString
    );

    let filters = [idFilter];

    window.fsl.query.executeSoqlQuery(objectType, filters, query, (res, err) => {
      if (err != null) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function updateRecordFieldsAsync(entityName, entityId, updatedFields) {
  if (window.fsl == null || window.fsl === undefined) {
    throw new Error("fsl is undefined");
  }

  const p1 = window.fsl.record.updateRecord(entityId, {
    apiName: entityName,
    fields: updatedFields,
  });

  // TODO: this is a workaround for fsl bug
  const p2 = new Promise((_r, rej) => setTimeout(() => rej(`updateRecord timeout`), 3000));

  return Promise.race([p1, p2]);
}

function _isDeviceConnected() {
  if (window.fsl == null || window.fsl === undefined) {
    throw new Error("fsl is undefined");
  }

  const p1 = window.fsl.native.isNetworkConnected();

  // TODO: this is a workaround for fsl bug
  const p2 = new Promise((_r, rej) => setTimeout(() => rej(`isNetworkConnected timeout`), 3000));

  return Promise.race([p1, p2]);
}

async function isDeviceConnected() {
  const ret = await _isDeviceConnected();

  return ret && ret.state === "NETWORK_STATE_CONNECTED"; // NETWORK_STATE_CONNECTED, NETWORK_STATE_DISCONNECTED
}

async function updateWoliMatchedBarcode(woliId, barcode) {
  if (barcode == null) return;

  // should we double check if woli has been changed?
  await updateRecordFieldsAsync("WorkOrderLineItem", woliId, {
    Barcode_Matched__c: barcode,
    Status: StatusEnums.COMPLETED,
  });
}

async function updateWoStatus(status, reasonCode, reason) {
  if (status === WoStatusEnums.CANNOTCOMPLETE) {
    if (!reasonCode) throw new Error("Cannot Complete reason should not be empty");
  }

  if (status !== WoStatusEnums.CANNOTCOMPLETE) {
    reasonCode = "";
    reason = "";
  }

  const woId = getRecordId();

  await updateRecordFieldsAsync("WorkOrder", woId, {
    Status: status,
    Cannot_Complete_Reason__c: reasonCode,
    Cannot_Complete_Details__c: reason,
  });

  await updateServiceAppointmentStatus(woId, status);
}

async function updateServiceAppointmentStatus(woId, status) {
  const woFields = await getWoFields(woId);
  const saRecordId = woFields?.Service_Appointment__c?.value;
  if (saRecordId === null) return;

  await updateRecordFieldsAsync("ServiceAppointment", saRecordId, {
    Status: status,
  });
}

async function updateWoliStatus(woliId, status, reasonCode, reason) {
  if (status === StatusEnums.CANNOTCOMPLETE) {
    if (!reasonCode) throw new Error("Cannot Complete reason should not be empty");
  }

  if (status !== StatusEnums.CANNOTCOMPLETE) {
    reasonCode = "";
    reason = "";
  }

  await updateRecordFieldsAsync("WorkOrderLineItem", woliId, {
    Status: status,
    Cannot_Complete_Reason__c: reasonCode,
    Cannot_Complete_Details__c: reason,
  });
}

async function updateLocationStatus(locId, status, reasonCode, reason, barcode) {
  // TODO: save barcode when barcode is not empty and status is complete

  await updateRecordFieldsAsync("Work_Order_Room__c", locId, {
    Status__c: status,
    Cannot_Complete_Reason__c: reasonCode,
    Cannot_Complete_Details__c: reason,
    Location_Barcode__c: barcode,
  });
}

async function completeWorkOrder() {
  const woId = getRecordId();

  await updateRecordFieldsAsync("WorkOrder", woId, {
    Status: WoStatusEnums.COMPLETED,
  });

  await updateServiceAppointmentStatus(woId, WoStatusEnums.COMPLETED);
}

async function getWoFields(woId) {
  const res = await getRaw_WorkOrder(woId);
  const woFields = res?.records[woId].fields;

  return woFields;
}

async function appendUnkownBarcodes(barcodes) {
  if (barcodes == null) return;

  const woId = getRecordId();
  const woFields = await getWoFields(woId);
  let scannedBarcodes = woFields?.Scanned_In__c?.value ? woFields.Scanned_In__c.value.split(" ") : [];

  const mergedArray = [...scannedBarcodes, ...barcodes];

  const mergedString = Array.from(new Set(mergedArray)).join(" ");

  await updateRecordFieldsAsync("WorkOrder", woId, {
    Scanned_In__c: mergedString.trim(),
  });
}

function captureBarcodeWithCameraAsync() {
  if (window.fsl == null || window.fsl === undefined) {
    throw new Error("fsl is undefined");
  }

  return new Promise((resolve, reject) => {
    try {
      window.fsl.ui.captureBarcode((res, err) => {
        if (err != null) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function getRaw_WorkOrder(workOrderId) {
  const fields = [
    "Id",
    "WorkOrderNumber",
    "Signature_Required__c",
    "Status",
    "Scanned_In__c",
    "Processed_Barcodes__c",
    "Excess_Barcodes__c",
    "Unknown_Barcodes__c",
    "Site_Survey__c",
    "Service_Appointment__c",
  ];

  const ret = await executeSoqlQueryAsync(
    "Id",
    workOrderId,
    "WorkOrder",
    `select ${fields.join(",")} from WorkOrder where Id = '' ` // ${workOrderId}
  );
  return ret;
}

async function getRaw_WorkOrderLocations(workOrderId) {
  const fields = [
    "Id",
    "Name",
    "Status__c",
    "Cannot_Complete_Reason__c",
    "Cannot_Complete_Details__c",
    "Location_Notes__c",
  ];

  const ret = await executeSoqlQueryAsync(
    "Work_Order__c",
    workOrderId,
    "Work_Order_Room__c",
    `select ${fields.join(",")} from Work_Order_Room__c where Work_Order__c = '' ` // ${workOrderId}
  );
  return ret;
}

async function getRaw_WorkOrderLineItems(workOrderId) {
  const fields = [
    "Id",
    "Work_Order_Location__c",
    "Status",
    "Bar_Code__c",
    "Product_Code__c",
    "Product_Name__c",
    "Cannot_Complete_Reason__c",
    "Cannot_Complete_Details__c",
  ];

  const ret = await executeSoqlQueryAsync(
    "WorkOrderId",
    workOrderId,
    "WorkOrderLineItem",
    `select ${fields.join(",")} from WorkOrderLineItem where WorkOrderId = '' ` // ${workOrderId}
  );
  return ret;
}

async function getRaw_SiteSurveyAsync(siteSurveyId) {
  const fields = [
    "Id",
    "Security_Sign_in_out__c",
    "Key_Card_Required__c",
    "Escort_Required__c",
    "Meet_with_Contact_Prior_to_Work__c",
    "Designated_Parking_Location__c",
    "Special_Internal_Instructions__c",
    "Notes__c",
  ];

  let ret = await executeSoqlQueryAsync(
    "Id",
    siteSurveyId,
    "Site_survey__c",
    `select ${fields.join(",")} from Site_survey__c where Id = '${siteSurveyId}' `
  );

  // TODO: this is a workaround !!!
  if (!ret?.records) {
    ret = await executeSoqlQueryAsync(
      "Id",
      siteSurveyId,
      "Site_survey__c",
      `select ${fields.join(",")} from Site_survey__c where Id = '${siteSurveyId}' `
    );

    if (ret?.records) beep(1, "ERROR");
  }

  return ret?.records;
}

async function getRawDataAsync() {
  if (window.fsl == null || window.fsl === undefined) {
    throw new Error("fsl is undefined");
  }

  const workOrderId = getRecordId();
  if (!workOrderId) throw new Error("workOrderId is " + workOrderId);

  const rawWo = await getRaw_WorkOrder(workOrderId);
  if (!rawWo || !rawWo.records) throw new Error("WO header is empty");

  let rawWoLocations = await getRaw_WorkOrderLocations(workOrderId);
  if (!rawWoLocations) throw new Error("rawWoLocations is " + rawWoLocations);

  // TODO: this is a workaround !!!
  if (!rawWoLocations.records) {
    rawWoLocations = await getRaw_WorkOrderLocations(workOrderId);
    if (rawWoLocations.records) beep(1, "ERROR");
  }

  let rawWoLineItems = await getRaw_WorkOrderLineItems(workOrderId);
  if (!rawWoLineItems) throw new Error("rawWoLineItems is " + rawWoLineItems);

  // TODO: this is a workaround !!!
  if (!rawWoLineItems.records) {
    rawWoLineItems = await getRaw_WorkOrderLineItems(workOrderId);
    if (rawWoLineItems.records) beep(1, "ERROR");
  }

  return {
    rawWo: rawWo.records,
    rawWoLocations: rawWoLocations.records || {},
    rawWoLineItems: rawWoLineItems.records || {},
  };
}

const SharedStatusEnums = {
  CANNOTCOMPLETE: "Cannot Complete",
};

const StatusEnums = {
  NEW: "New",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANNOTCOMPLETE: "Cannot Complete",
};

const LocationStatusEnums = {
  INPROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANNOTCOMPLETE: "Cannot Complete",
};

const WoTypeEnums = {
  SERVICE: "Service",
};

const WoStatusEnums = {
  COMPLETED: "Completed",
  ONSITE: "On Site",
  DISPATCHED: "Dispatched",
  ONROUTE: "On Route",
  CANNOTCOMPLETE: "Cannot Complete",
};

const CannotCompleteReasonList = [
  "Broken Unit",
  "Closed",
  "Construction / Renovation",
  "Misc. / Other",
  "Missing Unit",
  "No Access",
  "No Bar Code",
  "Not ready",
  "Refused Service",
  "Scanner Malfunction",
  "Stall Locked",
  "Vacant",
  "Could not find unit",
  "Back Order",
  "Cancelled",
  "Locked from Inside",
  "Pet in Unit",
  "COVID 19 Related",
];

export {
  SharedStatusEnums,
  WoStatusEnums,
  StatusEnums,
  LocationStatusEnums,
  WoTypeEnums,
  CannotCompleteReasonList,
  getRawDataAsync,
  getRaw_SiteSurveyAsync,
  updateWoliMatchedBarcode,
  updateWoStatus,
  updateWoliStatus,
  appendUnkownBarcodes,
  updateLocationStatus,
  isDeviceConnected,
  completeWorkOrder,
  captureBarcodeWithCameraAsync,
  getUserLanguage,
};
