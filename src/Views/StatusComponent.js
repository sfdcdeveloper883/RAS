import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { CannotCompleteReasonList, SharedStatusEnums } from "../DataServices/FslService";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  content: {
    margin: 8,
    padding: 8,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  space: {
    padding: 16,
  },
}));

export default function StatusComponent(props) {
  const { statusList, disabledStatuses, itemValue, setItemValue, saveCallback } = props;
  const classes = useStyles();
  const [t] = useTranslation("common");

  const handleStatusChange = (event) => {
    setItemValue({ ...itemValue, status: event.target.value });
  };

  const handleReasonCodeChange = (event) => {
    setItemValue({ ...itemValue, reasonCode: event.target.value });
  };

  const handleReasonChange = (event) => {
    setItemValue({ ...itemValue, reasonDetail: event.target.value });
  };

  const handleSave = async () => {
    await saveCallback();
  };

  return (
    <>
      <FormControl component="fieldset" className={classes.formControl}>
        <Paper className={classes.content}>
          <FormLabel component="legend"></FormLabel>
          <RadioGroup value={itemValue.status} onChange={handleStatusChange}>
            {statusList.map((o) => (
              <FormControlLabel value={o} control={<Radio />} label={t(`data.status_enums.${o.replace(' ', '')}`)} disabled={ disabledStatuses.includes(o) } />
            ))}
          </RadioGroup>
        </Paper>
      </FormControl>

      {itemValue.status === SharedStatusEnums.CANNOTCOMPLETE && (
        <Paper className={classes.content}>
          <div style={{ paddingRight: 16 }}>
            <FormControl component="fieldset" className={classes.formControl} fullWidth>
              <InputLabel id="reason-code-label">{t("ui.shared.label_cannot_complete_reason")}</InputLabel>
              <Select
                labelId="reason-code-label"
                id="reason-code"
                value={itemValue.reasonCode}
                onChange={handleReasonCodeChange}
                autoWidth
              >
                <MenuItem value=""></MenuItem>
                {CannotCompleteReasonList.sort().map((o) => {
                  return (
                    <MenuItem key={o} value={o}>
                      {t(`data.reason_enums.${o.replace(/ /gi, '').replace('.', '')}`)}
                    </MenuItem>
                  );
                })}
              </Select>

              <br />
              <TextField
                id="outlined-multiline-flexible"
                label={t("ui.shared.label_cannot_complete_detail")}
                multiline
                rows={5}
                value={itemValue.reasonDetail}
                onChange={handleReasonChange}
                variant="outlined"
              />
            </FormControl>
          </div>
        </Paper>
      )}

      <Grid justify="flex-end" container className={classes.space}>
        {
        (!disabledStatuses.includes(itemValue.status)) &&
        (itemValue.status !== SharedStatusEnums.CANNOTCOMPLETE || itemValue.reasonCode !== "") && (
          <Button variant="contained" color="secondary" onClick={handleSave}>
            {t("ui.shared.btn.btn_save")}
          </Button>
        )}
      </Grid>
    </>
  );
}
