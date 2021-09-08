import React, { useContext, useState, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { WorkOrderContext } from "../DataServices/Contexts";
import { StatusEnums, isDeviceConnected, completeWorkOrder } from "../DataServices/FslService";
import { useTranslation } from "react-i18next";

export default function CompleteWorkOrderDialog(props) {
  const { workOrder, fetchWorkOrder } = useContext(WorkOrderContext);
  const { showModal, setShowModal } = props;
  const [isOffline, setIsOffline] = useState(false);
  const [t] = useTranslation("common");

  useEffect(
    (o) => {
      (async () => {
        if (showModal) {
          try {
            await initLoading();
          } catch (err) {
            alert(err);
          }
        }
      })();
    },
    [showModal]
  );

  const initLoading = async () => {
    const isOffline = await isDeviceOffline();
    setIsOffline(isOffline);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  function isSignatureRequired() {
    return workOrder.hdr.signatureRequired === "YES";
  }

  function newWoliExists() {
    return workOrder.productItems.filter((o) => o.status === StatusEnums.NEW).length > 0;
  }

  async function isDeviceOffline() {
    const flag = await isDeviceConnected();
    return !flag;
  }

  async function handleOkButton() {
    try {
      await completeWorkOrder();

      setShowModal(false);
      fetchWorkOrder();
    } catch (err) {
      alert(err);
    }
  }

  function OfflineSection() {
    if (isSignatureRequired()) {
      return <></>;
    }

    //return isOffline && <div>Device is offline.</div>;
    return isOffline && <div>{t("msg.complete_network_error")}</div>;
  }

  function AllWoliCompletedSection() {
    return newWoliExists() && <div>{t("msg.complete_product_error")}</div>;
  }

  function SigRequiredSection() {
    const msg = isSignatureRequired() ? t("msg.complete_signature_error") : t("msg.complete_confirmation_question");

    return <div>{msg}</div>;
  }

  if (workOrder === null) return <></>;
  return (
    <Dialog
      open={showModal}
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">{t("ui.complete_wo_popup.title")}</DialogTitle>
      <DialogContent dividers={true}>
        <DialogContentText id="scroll-dialog" tabIndex={-1}>
          <OfflineSection />
          <AllWoliCompletedSection />
          <br />
          <SigRequiredSection />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {t("ui.shared.btn.btn_cancel")}
        </Button>
        <Button onClick={handleOkButton} color="primary" disabled={isSignatureRequired()}>
          {t("ui.shared.btn.btn_complete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
