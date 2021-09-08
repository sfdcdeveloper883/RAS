import { StatusEnums, getRawDataAsync, getRaw_SiteSurveyAsync } from "./FslService";

async function fetchData() {
  const rawData = await getRawDataAsync();

  const firstKey = Object.keys(rawData.rawWo)[0];
  const woFields = rawData.rawWo[firstKey]?.fields;

  const mapSignature_Required = (fields) => {
    let signatureRequired = fields?.Signature_Required__c?.value;
    if (signatureRequired) {
      signatureRequired = signatureRequired.split(":")[1].trim();
      return signatureRequired;
    }

    return "?";
  };

  const hdr = {
    number: woFields?.WorkOrderNumber?.value,
    status: woFields?.Status?.value,
    cannotCompleteReason: woFields?.Cannot_Complete_Reason__c?.value,
    cannotCompleteDetail: woFields?.Cannot_Complete_Details__c?.value,
    signatureRequired: mapSignature_Required(woFields),
    type: woFields?.Type__c?.value,
    isEmergency: woFields?.Emergency__c?.value,
    serviceDetailReportRequired: woFields?.Account_Reporting_Details__c?.value,
    lob: woFields?.Line_of_Business__c?.value,
    siteSurveyId: woFields?.Site_Survey__c?.value,
    completed: 0,
    cannotComplete: 0,
    newAdded: 0,
  };

  const unmatchedBarcodes = woFields?.Scanned_In__c?.value ? woFields.Scanned_In__c.value.split(" ") : [];

  const rawWoLocations = rawData.rawWoLocations;
  const locations = Object.keys(rawWoLocations).map((k) => {
    const locationFields = rawWoLocations[k].fields;

    return {
      id: locationFields?.Id?.value,
      name: locationFields?.Name?.value,
      serviceOrder: locationFields?.Service_Order__c?.value,
      status: locationFields?.Status__c?.value,
      notes: locationFields?.Location_Notes__c?.value,
      cannotCompleteReason: locationFields?.Cannot_Complete_Reason__c?.value,
      cannotCompleteDetail: locationFields?.Cannot_Complete_Details__c?.value,
    };
  });

  const rawWoLineItems = rawData.rawWoLineItems;

  const getLocation = (locId) => {
    const arr = locations.filter((loc) => loc.id === locId);
    return arr.length > 0 ? arr[0] : null;
  };

  const productItems = Object.keys(rawWoLineItems).map((k) => {
    const lineItemFields = rawWoLineItems[k].fields;
    const productLocationId = lineItemFields?.Work_Order_Location__c?.value;
    const productLocation = getLocation(productLocationId);

    return {
      itemId: lineItemFields?.Id?.value,
      status: lineItemFields?.Status?.value,
      productCode: lineItemFields?.Product_Code__c?.value,
      productName: lineItemFields?.Product_Name__c?.value,
      locationId: productLocationId,
      locationName: productLocation?.name,
      locationServiceOrder: productLocation?.serviceOrder,
      expectedBarcode: lineItemFields?.Bar_Code__c?.value,
      matchedBarcode: lineItemFields?.Barcode_Matched__c?.value,
      cannotCompleteReason: lineItemFields?.Cannot_Complete_Reason__c?.value, // TODO: verify the field name
      cannotCompleteDetail: lineItemFields?.Cannot_Complete_Details__c?.value, // TODO: verify the field name
    };
  });

  const ret = woDataAggregate({
    hdr: hdr,
    // barcodes: barcodes,
    unmatchedBarcodes: unmatchedBarcodes,
    locations: locations,
    productItems: productItems,
  });

  return ret;
}

function woDataAggregate(wo) {
  const { hdr, locations, productItems } = wo;

  hdr.completed = productItems.filter((o) => o.status === StatusEnums.COMPLETED).length;
  hdr.cannotComplete = productItems.filter((o) => o.status === StatusEnums.CANNOTCOMPLETE).length;
  hdr.newAdded = productItems.filter((o) => o.status === StatusEnums.NEW).length;

  const groupByLocation = locations.map((loc) => {
    const locationProductItems = productItems.filter((p) => p.locationName === loc.name);

    return {
      locationId: loc.id,
      locationName: loc.name,
      locationServiceOrder: loc.serviceOrder,
      locationStatus: loc.status,
      locationNotes: loc.notes,
      totalCount: locationProductItems.length,
      processedCount: locationProductItems.filter((o) => o.status !== "New").length,
      productSummary: groupByProduct(locationProductItems),
    };
  });

  if (window.fsl?.isMock) {
    console.table(groupByLocation);
  }

  const ret = {
    ...wo,
    groupByProduct: groupByProduct(productItems),
    groupByLocation: groupByLocation,
  };

  if (window.fsl?.isMock) {
    console.table(ret.hdr);
    console.table(ret.locations);
    console.table(ret.productItems);
    console.table(ret.groupByProduct);
    console.table(ret.groupByLocation);
  }

  return ret;
}

function groupByProduct(productItems) {
  var groupByProduct = [];
  productItems.reduce(function (res, value) {
    if (!res[value.productCode]) {
      res[value.productCode] = {
        productCode: value.productCode,
        productName: value.productName,
        completed: 0,
        cannotComplete: 0,
        newAdded: 0,
      };
      groupByProduct.push(res[value.productCode]);
    }

    switch (value.status) {
      case StatusEnums.COMPLETED:
        res[value.productCode].completed++;
        break;
      case StatusEnums.CANNOTCOMPLETE:
        res[value.productCode].cannotComplete++;
        break;
      case StatusEnums.NEW:
        res[value.productCode].newAdded++;
        break;

      default:
        console.log("unhandled product item status: " + value.status);
        break;
    }

    return res;
  }, {});

  return groupByProduct;
}

async function fetchSiteSurveyAsync(siteSurveyId) {
  const rawData = await getRaw_SiteSurveyAsync(siteSurveyId);
  if (rawData == null) return null;
  if (!rawData[siteSurveyId]) return null;

  const fields = rawData[siteSurveyId]?.fields;

  return {
    securitySignInOut: fields?.Security_Sign_in_out__c?.value,
    keyCardRequired: fields?.Key_Card_Required__c?.value,
    escortRequired: fields?.Escort_Required__c?.value,
    meetPriorToWork: fields?.Meet_with_Contact_Prior_to_Work__c?.value,
    designatedParkingLocation: fields?.Designated_Parking_Location__c?.value,
    specialInternalInstructions: fields?.Special_Internal_Instructions__c?.value,
    notes: fields?.Notes__c?.value,
  };
}

export { fetchData, fetchSiteSurveyAsync };
