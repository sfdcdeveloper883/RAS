import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { WorkOrderContext } from "../DataServices/Contexts";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 2,
    paddingTop: 2,
  },
  topSummary: {
    textAlign: "center",
  },
  SummaryCaption: {
    fontSize: 9,
    color: theme.palette.text.secondary,
  },
  completedColor: {
    backgroundColor: "#81c784",
  },
  cannotCompleteColor: {
    backgroundColor: "#f8bbd0",
  },
  newAddedColor: {
    backgroundColor: "#bdbdbd",
  },
}));

function SummarySection(props) {
  const { label, content } = props;
  const classes = useStyles();
  return (
    <div>
      <Typography variant="button" display="block" gutterBottom>
        <div className={classes.SummaryCaption}>{label}</div>
      </Typography>
      <Typography variant="h5">{content}</Typography>
    </div>
  );
}

function SummaryProgressBar(props) {
  const { hdr } = props;
  const classes = useStyles();

  const total = hdr.completed + hdr.cannotComplete + hdr.newAdded;

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={10}>
          <div style={{ display: "flex" }}>
            <div style={{ width: 4 }}></div> {/* left padding - for now */}
            {/* for color, check https://material-ui.com/customization/color/#color */}
            <div className={classes.completedColor} style={{ width: `${(hdr.completed * 100) / total}%` }}>
              <Typography variant="h6" color="textSecondary">
                {hdr.completed}
              </Typography>
            </div>
            <div className={classes.cannotCompleteColor} style={{ width: `${(hdr.cannotComplete * 100) / total}%` }}>
              <Typography variant="h6" color="textSecondary">
                {hdr.cannotComplete}
              </Typography>
            </div>
            <div className={classes.newAddedColor} style={{ width: `${(hdr.newAdded * 100) / total}%` }}>
              <Typography variant="h6" color="textSecondary">
                {hdr.newAdded}
              </Typography>
            </div>
          </div>
        </Grid>
        <Grid item xs={2}>
          <div style={{ background: "white", width: `100%` }}>
            <Typography variant="h4">{total}</Typography>
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default function Summary() {
  const { workOrder } = useContext(WorkOrderContext);
  const classes = useStyles();
  const [t] = useTranslation("common");

  const hdr = workOrder?.hdr;

  if (!hdr) return <></>;

  return (
    <div className={classes.root}>
      <Paper className={classes.topSummary}>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <SummarySection label={t("ui.summary_tab.label_wo_number")} content={hdr.number} />
          </Grid>
          <Grid item xs={4}>
            <SummarySection label={t("ui.summary_tab.label_sig_required")} content={hdr.signatureRequired} />
          </Grid>
          <Grid item xs={4}>
            <SummarySection label={t("ui.summary_tab.label_status")} content={hdr.status} />
          </Grid>
          <Grid item xs={12}>
            <SummaryProgressBar hdr={hdr} />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
