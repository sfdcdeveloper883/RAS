import React, { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import { Grid } from "@material-ui/core";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ScanBarcodesDialog from "./ScanBarcodesDialog";
import CompleteWorkOrderDialog from "./CompleteWoDialog";
import ChangeWoStatusDialog from "./ChgWoStatusDialog";
import { createFslMock } from "../DataServices/DemoData";
import { useTranslation } from "react-i18next";

import { WorkOrderContext } from "../DataServices/Contexts";
import { WoStatusEnums } from "../DataServices/FslService";

const useStyles = makeStyles((theme) => ({
  appBar: {
    top: "auto",
    bottom: 0,
  },
  emptySpace: {
    height: 56, // same as appBar - any better way?
  },
}));

export default function BottomPanel() {
  const [showScanBarcodeModal, setShowScanBarcodeModal] = useState(false);
  const [showCompleteWoModal, setShowCompleteWoModal] = useState(false);
  const [showCannotCompleteWoModal, setShowCannotCompleteWoModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [t] = useTranslation("common");
  const { workOrder } = useContext(WorkOrderContext);

  const classes = useStyles();

  const completeWorkOrder = () => {
    if (window.fsl === undefined) {
      alert("fsl is undefined");
      return;
    }
    setShowCompleteWoModal(true);
  };

  const cannotCompleteWorkOrder = () => {
    setDropdownOpen(false);

    if (window.fsl === undefined) {
      alert("fsl is undefined");
      return;
    }

    setShowCannotCompleteWoModal(true);
  };

  const handleScanBarcode = () => {
    if (window.fsl === undefined) {
      alert("fsl is undefined");
      return;
    }

    setShowScanBarcodeModal(true);
  };

  function bottonPanelClicked(event, value) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (window.fsl === undefined) {
        alert("use mock fsl with demo data");
        window.fsl = createFslMock();
        const event = new Event("fsl-ready", { bubbles: true });
        document.dispatchEvent(event);
      }
    }
  }

  const handleToggle = () => {
    setDropdownOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setDropdownOpen(false);
  };

  function isScanDisabled() {
    return !(workOrder?.hdr?.status === WoStatusEnums.ONSITE);
  }

  return (
    <>
      <ScanBarcodesDialog showModal={showScanBarcodeModal} setShowModal={setShowScanBarcodeModal} />
      <CompleteWorkOrderDialog showModal={showCompleteWoModal} setShowModal={setShowCompleteWoModal} />
      <ChangeWoStatusDialog showModal={showCannotCompleteWoModal} setShowModal={setShowCannotCompleteWoModal} />

      <div className={classes.emptySpace}></div>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <Grid justify="space-between" container onClick={bottonPanelClicked}>
            <Grid item>
              <ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="split button">
                <Button onClick={completeWorkOrder}>{t("ui.shared.btn.btn_complete")}</Button>
                <Button
                  color="primary"
                  size="small"
                  aria-controls={dropdownOpen ? "split-button-menu" : undefined}
                  aria-expanded={dropdownOpen ? "true" : undefined}
                  aria-label="select merge strategy"
                  aria-haspopup="menu"
                  onClick={handleToggle}
                >
                  <ArrowDropDownIcon />
                </Button>
              </ButtonGroup>
              <Popper open={dropdownOpen} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === "bottom" ? "center top" : "center bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <Button color="secondary" onClick={cannotCompleteWorkOrder}>
                          {t("ui.shared.btn.btn_cannot_complete")}
                        </Button>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" disabled={isScanDisabled()} onClick={handleScanBarcode}>
                {t("ui.shared.btn.btn_scan")}
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );
}
