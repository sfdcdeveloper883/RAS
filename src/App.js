import React, { useEffect, useState, Suspense } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

import AppTabs from "./Views/AppTabs";
import BottomPanel from "./Views/BottomPanel";
import ProdItemListDialog from "./Views/ProdItemListDialog";
import { fetchData, fetchSiteSurveyAsync } from "./DataServices/WoService";
import { WoTypeEnums, WoStatusEnums } from "./DataServices/FslService";
import { WorkOrderContext } from "./DataServices/Contexts";
import { UiContext } from "./DataServices/Contexts";
import { useTranslation } from "react-i18next";
import { getUserLanguage } from "./DataServices/FslService";
import i18n from "i18next";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 999,
    color: "#fff",
  },
}));

function getDefaultUiState() {
  return {
    modalData: null,
    showModal: false,
  };
}

function App() {
  const classes = useStyles();
  const [workOrder, setWorkOrder] = useState(null);
  const [siteSurvey, setSiteSurvey] = useState(null);
  const [uiState, setUiState] = useState(getDefaultUiState());
  const [popupMsg, setPopupMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockAppMsg, setBlockAppMsg] = useState(null);
  const { t } = useTranslation("common");

  const clearPopupMsg = () => {
    setPopupMsg("");
  };

  const allowedLobs = ["Hygiene", "Life Safety"];

  const validateWorkOrder = (wo) => {
    if (!wo || !wo.hdr) return "Work Order is empty";

    if (wo.hdr.type !== WoTypeEnums.SERVICE || wo.hdr.isEmergency || !allowedLobs.includes(wo.hdr.lob)) {
      return t("msg.wo_service_type_error");
    }

    if (wo.hdr.serviceDetailReportRequired) {
      return t("msg.wo_detail_report_error");
    }

    if (wo.hdr.status === WoStatusEnums.DISPATCHED || wo.hdr.status === WoStatusEnums.ONROUTE) {
      return t("msg.wo_status_error");
    }

    return null;
  };

  const fetchSiteSurvey = async (siteSurveyId) => {
    try {
      setLoading(true);
      const ret = await fetchSiteSurveyAsync(siteSurveyId);
      setSiteSurvey(ret ?? {});
    } catch (error) {
      setPopupMsg(typeof error === "string" ? error : JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);

      const userLang = getUserLanguage();
      i18n.changeLanguage(userLang);

      const wo = await fetchData();

      const validationMsg = validateWorkOrder(wo);
      if (validationMsg != null) {
        setBlockAppMsg(validationMsg);
        return;
      }

      setWorkOrder({ ...wo });
    } catch (error) {
      setPopupMsg(typeof error === "string" ? error : JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.addEventListener("fsl-ready", fetchWorkOrder);
    return () => {
      document.removeEventListener("fsl-ready", fetchWorkOrder);
    };
  }, []);

  function PopupMsgDialog() {
    return (
      <Dialog
        open={popupMsg !== null && popupMsg.length > 0}
        onClose={clearPopupMsg}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Message</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{popupMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearPopupMsg} color="primary" autoFocus>
            {t("ui.shared.btn.btn_dismiss")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Suspense fallback="loading">
      <div>
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Backdrop className={classes.backdrop} open={blockAppMsg !== null}>
          <div style={{ padding: 16, textAlign: "center" }}>{blockAppMsg}</div>
        </Backdrop>

        {!blockAppMsg && (
          <WorkOrderContext.Provider value={{ workOrder, fetchWorkOrder, siteSurvey, fetchSiteSurvey }}>
            <UiContext.Provider value={{ uiState, setUiState, setPopupMsg, loading, setLoading }}>
              <AppTabs />

              <ProdItemListDialog />

              <BottomPanel />
            </UiContext.Provider>
          </WorkOrderContext.Provider>
        )}

        <PopupMsgDialog />
      </div>
    </Suspense>
  );
}

export default App;
