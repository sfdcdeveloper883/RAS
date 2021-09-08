import React, { useState, useEffect, useContext } from "react";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Divider } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import { updateWoliStatus, StatusEnums } from "../DataServices/FslService";
import { WorkOrderContext, UiContext } from "../DataServices/Contexts";
import StatusComponent from "./StatusComponent";
import { useDialogStyle } from "./ChgStatusDialog.Shared";
import { useTranslation } from "react-i18next";

export default function ChangeWoliStatusDialog(props) {
  const { fetchWorkOrder, workOrder } = useContext(WorkOrderContext);
  const { loading, setLoading } = useContext(UiContext);
  const classes = useDialogStyle();
  const { showEditModal, setShowEditModal, selectedWoliItem, setSelectedWoliItem } = props;
  const [itemValue, setItemValue] = useState({});
  const [t] = useTranslation("common");

  useEffect(() => {
    if (selectedWoliItem) {
      setItemValue(buildItemValue(selectedWoliItem));
    }
  }, [selectedWoliItem]);

  function buildItemValue(woliItem) {
    if (woliItem === null) {
      throw new Error("woli item is null");
    }

    let ret = {
      status: woliItem.status,
      reasonCode: "",
      reasonDetail: "",
    };

    if (ret.status === StatusEnums.CANNOTCOMPLETE) {
      // get cannot complete reason and detail from WO, they are not pushed into woli item
      const woli = workOrder.productItems.filter((pi) => pi.itemId === selectedWoliItem.id)[0];
      ret.reasonCode = woli.cannotCompleteReason;
      ret.reasonDetail = woli.cannotCompleteDetail;
    }

    return ret;
  }

  const handleClose = () => {
    if (loading) {
      setLoading(false);
    }
    setSelectedWoliItem(null);
    setShowEditModal(false);
  };

  const saveCallback = async () => {
    try {
      setLoading(true);

      await updateWoliStatus(
        selectedWoliItem.id,
        itemValue.status,
        itemValue.status === StatusEnums.CANNOTCOMPLETE ? itemValue.reasonCode : "",
        itemValue.status === StatusEnums.CANNOTCOMPLETE ? itemValue.reasonDetail : ""
      );

      await fetchWorkOrder();
      handleClose();
    } catch (ex) {
      alert(ex);
    } finally {
      setLoading(false);
    }
  };

  if (selectedWoliItem === null) return <></>;
  return (
    <div>
      <Dialog fullScreen open={showEditModal} onClose={handleClose}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {t("ui.change_woli_status_dialog.title")}
            </Typography>
            <IconButton color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <div className={classes.emptySpace}></div>

        <Typography variant="h6" className={classes.content}>
          {selectedWoliItem?.name}
        </Typography>
        <Divider />

        <StatusComponent
          statusList={[StatusEnums.NEW, StatusEnums.COMPLETED, StatusEnums.CANNOTCOMPLETE]}
          disabledStatuses={[StatusEnums.NEW, StatusEnums.COMPLETED]}
          itemValue={itemValue}
          setItemValue={setItemValue}
          saveCallback={saveCallback}
        />
      </Dialog>
    </div>
  );
}
