import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Divider } from "@material-ui/core";
import { WorkOrderContext } from "../DataServices/Contexts";
import { StatusEnums } from "../DataServices/FslService";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  space: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(1),
  },
  barcode: {
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  completed: {
    backgroundColor: "#81c784",
  },
  cannotComplete: {
    backgroundColor: "#f8bbd0",
  },
  count: {
    textAlign: "center",
    color: "#01579b",
  },
  groupLabel: {
    paddingLeft: 12,
    color: theme.palette.text.secondary,
  },
}));

export default function BarcodeScanned() {
  const { workOrder } = useContext(WorkOrderContext);
  const classes = useStyles();
  const [t] = useTranslation("common");

  function getClassNames(woliStatus) {
    let ret = classes.barcode;

    if (woliStatus === StatusEnums.COMPLETED) {
      ret += " " + classes.completed;
    }

    if (woliStatus === StatusEnums.CANNOTCOMPLETE) {
      ret += " " + classes.cannotComplete;
    }

    return ret;
  }

  function renderExpected() {
    if (!workOrder || !workOrder.productItems) return <></>;

    const expectedBarcodes = workOrder.productItems
      .filter((o) => o.expectedBarcode !== undefined)
      .sort((a, b) => (a.locationServiceOrder > b.locationServiceOrder ? 1 : -1))
      .map((o) => {
        return {
          barcode: o.expectedBarcode,
          scanned: o.matchedBarcode === o.expectedBarcode,
          classNames: getClassNames(o.status),
        };
      });

    return (
      <>
        <div className={classes.space}>
          <Grid container alignItems="center">
            <Grid item xs={2}>
              <div className={classes.count}>
                <Typography variant="h4">{expectedBarcodes.length}</Typography>
              </div>
            </Grid>
            <Grid item xs={10}>
              <div>
                <Typography variant="subtitle1">{t("ui.summary_tab.label_expected")}</Typography>
                <Grid container>
                  {expectedBarcodes.map((b) => (
                    <Grid item xs={4} key={b.barcode}>
                      <span className={b.classNames}>{b.barcode}</span>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </Grid>
          </Grid>
        </div>
        <Divider />
      </>
    );
  }

  function renderUnmatched() {
    if (!workOrder || !workOrder.unmatchedBarcodes) return <></>;

    return (
      <>
        <div className={classes.space}>
          <Grid container alignItems="center">
            <Grid item xs={2}>
              <div className={classes.count}>
                <Typography variant="h4">
                  {workOrder.unmatchedBarcodes.length}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={10}>
              <div>
                <Typography variant="subtitle1">{t("ui.summary_tab.label_unmatched")}</Typography>
                <Grid container>
                  {workOrder.unmatchedBarcodes.map((b) => (
                    <Grid item xs={4} key={b}>
                      <div className={classes.barcode}>{b}</div>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </Grid>
          </Grid>
        </div>
        <Divider />
      </>
    );
  }

  if (workOrder == null) return <></>;

  return (
    <>
      <Typography variant="subtitle1" className={classes.groupLabel}>
        {t("ui.summary_tab.label_barcode_canned")}
      </Typography>
      <Divider />
      {renderExpected()}
      {renderUnmatched()}
    </>
  );
}
