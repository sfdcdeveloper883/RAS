import React, { useState, useEffect, useContext } from "react";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import { updateWoStatus, WoStatusEnums } from "../DataServices/FslService";
import { WorkOrderContext, UiContext } from "../DataServices/Contexts";
import StatusComponent from "./StatusComponent";
import { useDialogStyle } from "./ChgStatusDialog.Shared";
import { useTranslation } from "react-i18next";

export default function ChangeWoStatusDialog(props) {
  const { showModal, setShowModal } = props;
  const { fetchWorkOrder, workOrder } = useContext(WorkOrderContext);
  const { loading, setLoading } = useContext(UiContext);
  const classes = useDialogStyle();
  const [t] = useTranslation("common");

  const [itemValue, setItemValue] = useState(null);

  useEffect(() => {
    if (workOrder === undefined || workOrder === null) return;
    if (itemValue !== null && showModal) return;

    const ret = {
      status: workOrder?.hdr?.status,
      reasonCode: workOrder?.hdr?.cannotCompleteReason || "",
      reasonDetail: workOrder?.hdr?.cannotCompleteDetail || "",
    };

    if (JSON.stringify(ret) === JSON.stringify(itemValue)) return;
    setItemValue(ret);
  });

  const handleClose = () => {
    if (loading) {
      setLoading(false);
    }

    setItemValue(null); // reset it back to null
    setShowModal(false);
  };

  const saveCallback = async () => {
    try {
      setLoading(true);

      await updateWoStatus(
        itemValue.status,
        itemValue.status === WoStatusEnums.CANNOTCOMPLETE ? itemValue.reasonCode : "",
        itemValue.status === WoStatusEnums.CANNOTCOMPLETE ? itemValue.reasonDetail : ""
      );

      await fetchWorkOrder();
      handleClose();
    } catch (ex) {
      alert(ex);
    } finally {
      setLoading(false);
    }
  };

  if (workOrder === null || itemValue === null) return <></>;
  return (
    <div>
      <Dialog fullScreen open={showModal} onClose={handleClose}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {t("ui.change_wo_status_dialog.title")}
            </Typography>
            <IconButton color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <div className={classes.emptySpace}></div>

        <StatusComponent
          statusList={[WoStatusEnums.ONSITE, WoStatusEnums.COMPLETED, WoStatusEnums.CANNOTCOMPLETE]}
          disabledStatuses={[WoStatusEnums.ONSITE, WoStatusEnums.COMPLETED]}
          itemValue={itemValue}
          setItemValue={setItemValue}
          saveCallback={saveCallback}
        />
      </Dialog>
    </div>
  );
}
