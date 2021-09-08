import React, { useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox";
import Paper from "@material-ui/core/Paper";
import { WorkOrderContext } from "../DataServices/Contexts";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  space: {
    padding: 4,
    backgroundColor: "#f5f5f5",
  },
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function SiteSurvey(props) {
  const { siteSurvey, fetchSiteSurvey } = useContext(WorkOrderContext);
  const { siteSurveyId } = props;
  const classes = useStyles();
  const [t] = useTranslation("common");

  useEffect(() => {
    if (siteSurveyId === null) return;

    if (siteSurvey === null) {
      fetchSiteSurvey(siteSurveyId);
    }
  }, [siteSurveyId]);

  function createMarkup(notes) {
    return { __html: notes };
  }

  return (
    siteSurvey &&
    siteSurvey !== {} && (
      <div>
        <List className={classes.root}>
          <ListItem>
            <ListItemText primary={t("ui.notes_tab.label_sign_in_out")} />
            <ListItemSecondaryAction>
              <Checkbox edge="end" color="primary" checked={siteSurvey.securitySignInOut} />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={t("ui.notes_tab.label_Key_card_required")} />
            <ListItemSecondaryAction>
              <Checkbox edge="end" color="primary" checked={siteSurvey.keyCardRequired} />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={t("ui.notes_tab.label_escort_required")} />
            <ListItemSecondaryAction>
              <Checkbox edge="end" color="primary" checked={siteSurvey.escortRequired} />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={t("ui.notes_tab.label_meet_with_contact")} />
            <ListItemSecondaryAction>
              <Checkbox edge="end" color="primary" checked={siteSurvey.meetPriorToWork} />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={t("ui.notes_tab.label_designated_parking")}
              secondary={siteSurvey.designatedParkingLocation}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={t("ui.notes_tab.label_special_instructions")}
              secondary={siteSurvey.specialInternalInstructions}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={t("ui.notes_tab.label_notes")} />
          </ListItem>
          <ListItem>
            <Paper className={classes.space}>
              <div dangerouslySetInnerHTML={createMarkup(siteSurvey.notes)} />
            </Paper>
          </ListItem>
        </List>
      </div>
    )
  );
}
