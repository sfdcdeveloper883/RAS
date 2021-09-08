import React, { useState, useEffect, useContext, useRef } from "react";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Divider } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { updateLocationStatus } from "../DataServices/FslService";
import { WorkOrderContext, UiContext } from "../DataServices/Contexts";
import { beep } from "../utils";
import StatusComponent from "./StatusComponent";
import { useDialogStyle } from "./ChgStatusDialog.Shared";
import { captureBarcodeWithCameraAsync, LocationStatusEnums } from "../DataServices/FslService";
import { useTranslation } from "react-i18next";

export default function ChangeLocationStatusDialog(props) {
  const { fetchWorkOrder, workOrder } = useContext(WorkOrderContext);
  const { loading, setLoading } = useContext(UiContext);
  const classes = useDialogStyle();
  const { showModal, setShowModal, selectedLocation, setSelectedLocation } = props;
  const [itemValue, setItemValue] = useState({});

  const inputBarcode = useRef(null);
  const [t] = useTranslation("common");

  useEffect(() => {
    if (selectedLocation) {
      setItemValue(buildItemValue(selectedLocation));
    }
  }, [selectedLocation]);

  function buildItemValue(location) {
    if (location === null) {
      throw new Error("Location item is null");
    }

    let ret = {
      status: location.locationStatus,
      reasonCode: "",
      reasonDetail: "",
    };

    if (ret.status === LocationStatusEnums.CANNOTCOMPLETE) {
      // get cannot complete reason and detail from WO, they are not pushed into location item
      const woLocation = workOrder.locations.filter((loc) => loc.id === selectedLocation.locationId)[0];
      ret.reasonCode = woLocation.cannotCompleteReason;
      ret.reasonDetail = woLocation.cannotCompleteDetail;
    }

    return ret;
  }

  const handleClose = () => {
    if (loading) {
      setLoading(false);
    }
    setSelectedLocation(null);
    setShowModal(false);
  };

  const saveCallback = async () => {
    try {
      setLoading(true);

      const barcode = inputBarcode.current.value.trim();

      await updateLocationStatus(
        selectedLocation.locationId,
        itemValue.status,
        itemValue.status === LocationStatusEnums.CANNOTCOMPLETE ? itemValue.reasonCode : "",
        itemValue.status === LocationStatusEnums.CANNOTCOMPLETE ? itemValue.reasonDetail : "",
        barcode
      );

      await fetchWorkOrder();
      handleClose();
    } catch (ex) {
      alert(ex);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyup = (event) => {
    if (event.key !== "Enter") return;

    const newBarcode = inputBarcode.current.value.trim();
    if (newBarcode === "") return;

    processBarcode(newBarcode);
  };

  function processBarcode(newBarcode) {
    setItemValue({
      status: "Completed",
      reasonCode: "",
      reasonDetail: "",
    });

    beep(1);
  }

  const handleCamera = async () => {
    try {
      const res = await captureBarcodeWithCameraAsync();

      if (res && res.result) {
        inputBarcode.current.value = res.result;
        processBarcode(res.result);
        inputBarcode.current.focus();
      }
    } catch (e) {
      alert(e);
    }
  };

  if (selectedLocation === null) return <></>;
  return (
    <div>
      <Dialog fullScreen open={showModal} onClose={handleClose}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {t("ui.change_location_status_dialog.title")}
            </Typography>
            <IconButton color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <div className={classes.emptySpace}></div>

        <Typography variant="h6" className={classes.content}>
          {selectedLocation?.locationName}
        </Typography>
        <Divider />
        <Grid justify="center" justifyContent="center" alignItems="center" container className={classes.barcodeTextBox}>
          <Grid item xs={11}>
            <TextField
              id="txtBarcode"
              variant="outlined"
              size="small"
              autoComplete="off"
              placeholder={t("ui.shared.bluetooth_scanner_textbox_placeholder")}
              inputRef={inputBarcode}
              onKeyUp={handleKeyup}
              autoFocus={true}
              fullWidth
              className={classes.txtBarcode}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton type="submit" aria-label="camera" onClick={handleCamera}>
              <CameraAltIcon />
            </IconButton>
          </Grid>
        </Grid>
        <StatusComponent
          statusList={[
            LocationStatusEnums.INPROGRESS,
            LocationStatusEnums.COMPLETED,
            LocationStatusEnums.CANNOTCOMPLETE,
          ]}
          disabledStatuses={[LocationStatusEnums.INPROGRESS]}
          itemValue={itemValue}
          setItemValue={setItemValue}
          saveCallback={saveCallback}
        />
      </Dialog>
    </div>
  );
}
