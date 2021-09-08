import React, { useState, useRef, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Divider } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { WorkOrderContext, UiContext } from "../DataServices/Contexts";
import {
  updateWoliMatchedBarcode,
  appendUnkownBarcodes,
  captureBarcodeWithCameraAsync,
  SharedStatusEnums,
} from "../DataServices/FslService";

import { beep } from "../utils";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "fixed",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  description: {
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  emptySpace: {
    paddingTop: 112,
  },
  bottomAppBar: {
    top: "auto",
    bottom: 0,
  },
  txtBarcode: {
    backgroundColor: theme.palette.common.white,
  },
  barcodeTextBox: {
    paddingTop: 60,
    padding: 4,
    paddingRight: 12,
    position: "fixed",
    zIndex: 10,
  },
  space: {
    padding: 4,
  },
}));

export default function ScanBarcodesDialog(props) {
  const { workOrder, fetchWorkOrder } = useContext(WorkOrderContext);
  const { loading, setLoading } = useContext(UiContext);
  const { showModal, setShowModal } = props;

  const [barcodes, setBarcodes] = useState([]);
  const inputBarcode = useRef(null);

  const classes = useStyles();
  const [t] = useTranslation("common");

  const handleClose = () => {
    setBarcodes([]);
    if (loading) {
      setLoading(false);
    }
    setShowModal(false);
  };

  function findProductItemByBarcode(barcode) {
    if (!workOrder || !workOrder.productItems) return null;

    const matches = workOrder.productItems.filter((o) => o.expectedBarcode === barcode);
    if (matches.length === 0) return null;

    return matches[0];
  }

  const handleCamera = async () => {
    try {
      const res = await captureBarcodeWithCameraAsync();

      if (res && res.result) {
        processBarcode(res.result);
        inputBarcode.current.focus();
      }
    } catch (e) {
      alert(e);
    }
  };

  const handleKeyup = (event) => {
    if (event.key !== "Enter") return;

    const newBarcode = inputBarcode.current.value.trim().replace(/ /gi, "");
    if (newBarcode === "") return;

    inputBarcode.current.value = "";

    processBarcode(newBarcode);
  };

  function checkLocationStatus(woli) {
    const arr = workOrder.locations.filter((loc) => loc.id === woli.locationId);
    // valid means: we find the location AND location is not marked as cannot-complete
    return arr.length === 1 && arr[0].status !== SharedStatusEnums.CANNOTCOMPLETE;
  }

  const processBarcode = (newBarcode) => {
    if (!newBarcode) return;

    if (barcodes.filter((b) => b.value === newBarcode).length > 0) {
      beep(2); // if it's in the list
      return;
    }

    let expectedProductItem = findProductItemByBarcode(newBarcode);
    if (expectedProductItem != null) {
      if (expectedProductItem.matchedBarcode === newBarcode) {
        beep(2);
        return; // if it's already scanned
      }

      if (!checkLocationStatus(expectedProductItem)) {
        expectedProductItem = null; // if location is cannot-complete, we treat is as unknown
      }
    }

    setBarcodes((o) => [
      ...o,
      {
        value: newBarcode,
        selected: true,
        productItem: expectedProductItem,
      },
    ]);
    beep(1);
  };

  function getBarcodeDescription(woli) {
    if (!woli) return `(${t("ui.summary_tab.label_unmatched")})`;

    return `${woli.locationName} - ${woli.productName}`;
  }

  const handleToggle = (b) => {
    const newArray = barcodes.map((o) => {
      return o === b ? { ...b, selected: !b.selected } : o;
    });
    setBarcodes((o) => newArray);
  };

  const handleSave = async () => {
    let savedBarcodes = [];
    let faildBarcodes = [];

    try {
      setLoading(true);

      const matched = barcodes.filter((o) => o.selected && o.productItem !== null);

      for (const item of matched) {
        try {
          await updateWoliMatchedBarcode(item.productItem.itemId, item.value);
          savedBarcodes.push(item.value);
        } catch (ex) {
          faildBarcodes.push(item.value);
          alert(ex);
        }
      }

      const unknown = barcodes.filter((o) => o.selected && o.productItem === null).map((o) => o.value);
      if (unknown.length > 0) {
        try {
          await appendUnkownBarcodes(unknown);
          savedBarcodes = [...savedBarcodes, ...unknown];
        } catch (ex) {
          alert(ex);
          faildBarcodes = [...faildBarcodes, ...unknown];
        }
      }
    } catch (e) {
      alert(e);
      return;
    } finally {
      setLoading(false);
    }

    if (faildBarcodes.length === 0) {
      handleClose();
      fetchWorkOrder();
      return;
    }

    alert(`${faildBarcodes.length} ${faildBarcodes.length === 1 ? "item" : "items"} not saved, please try again`);
    const remaining = barcodes.filter((o) => !savedBarcodes.includes(o.value));
    setBarcodes((o) => remaining);
  };

  function getSaveButtonLabel() {
    const numOfSelectedItems = barcodes.filter((o) => o.selected).length;
    if (numOfSelectedItems <= 1) return t("ui.shared.btn.btn_save");

    return `${t("ui.shared.btn.btn_save")} ${numOfSelectedItems} ${t("ui.shared.btn.btn_barcodes")}`;
  }

  return (
    <div>
      <Dialog fullScreen open={showModal} onClose={handleClose}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {t("ui.scan_barcode_dialog.title")}
            </Typography>
            <IconButton color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

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

        <div className={classes.emptySpace}></div>
        <Divider />

        <List className={classes.root}>
          {barcodes.map((b) => {
            return (
              <div key={b.value}>
                <ListItem role={undefined} dense button>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={b.selected}
                      onChange={() => handleToggle(b)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={b.value} secondary={getBarcodeDescription(b.productItem)} />
                </ListItem>
                <Divider />
              </div>
            );
          })}
        </List>

        {barcodes.filter((o) => o.selected).length > 0 && (
          <Grid justify="flex-end" container className={classes.space}>
            <Button variant="contained" color="secondary" onClick={handleSave}>
              {getSaveButtonLabel()}
            </Button>
          </Grid>
        )}
      </Dialog>
    </div>
  );
}
