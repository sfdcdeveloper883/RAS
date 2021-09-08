import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import Typography from "@material-ui/core/Typography";
import { ProductItemSummary } from "./SharedComponents";
import EditIcon from "@material-ui/icons/Edit";
import NoteIcon from "@material-ui/icons/Note";
import { WorkOrderContext } from "../DataServices/Contexts";
import { UiContext } from "../DataServices/Contexts";
import ChangeLocationStatusDialog from "./ChgLocStatusDialog";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
  },
  space: {
    paddingRight: 4,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  locationSpacing: {
    paddingTop: theme.spacing(3),
  },
  groupLabel: {
    paddingLeft: 12,
    color: theme.palette.text.secondary,
  },
}));

function LocationNotes(props) {
  const { notes, setNotes } = props;
  const [t] = useTranslation("common");

  const handleClose = () => {
    setNotes(null);
  };

  function createMarkup() {
    return { __html: notes };
  }

  if (!notes) {
    return <></>;
  }

  return (
    <Dialog
      open={notes !== null}
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">{t("msg.location_notes")}</DialogTitle>
      <DialogContent dividers={true}>
        <DialogContentText id="scroll-dialog" tabIndex={-1}>
          <div dangerouslySetInnerHTML={createMarkup()} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
        {t("ui.shared.btn.btn_dismiss")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LocationPanel() {
  const { workOrder } = useContext(WorkOrderContext);
  const { setUiState } = useContext(UiContext);
  const locations = workOrder?.groupByLocation ?? [];
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locationNotes, setLocationNotes] = useState(null);
  const [t] = useTranslation("common");
  const classes = useStyles();

  const getFontScale = (a, b) => {
    // TODO: I don't know css
    const s = `${a}/${b}`;
    const l = s.length; // 3 to 7?
    const scale = `${100 - Math.max(l-3, 0) * 10}%`; // from 60% to 100%?
    return scale;
  };  

  const handleKeyword = (e) => {
    setKeyword((o) => e.target.value);
  };

  const onLocationSelected = (loc) => {
    const filterItems = (productItems) => {
      const items = productItems == null ? [] : productItems.filter((o) => o.locationId === loc.locationId);
      return items.map((o) => {
        return {
          id: o.itemId,
          name: `${o.productName} (${o.productCode})`,
          status: o.status,
        };
      });
    };

    const modalData = {
      title: t("ui.product_in_a_loc_dialog.title"),
      name: loc.locationName,
      filterItems: filterItems,
    };

    setUiState({
      modalData: modalData,
      showModal: true,
    });
  };

  return (
    <>
      <ChangeLocationStatusDialog
        showModal={showModal}
        setShowModal={setShowModal}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      <LocationNotes notes={locationNotes} setNotes={setLocationNotes} />

      <Paper component="form" className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder={t("ui.location_tab.search_textbox_placeholder")}
          value={keyword}
          onChange={handleKeyword}
          inputProps={{ "aria-label": "search location" }}
        />
        {keyword && keyword.length > 0 ? (
          <IconButton className={classes.iconButton} aria-label="clear" onClick={(o) => setKeyword("")}>
            <ClearIcon />
          </IconButton>
        ) : (
          <IconButton className={classes.iconButton} aria-label="search">
            <SearchIcon />
          </IconButton>
        )}
      </Paper>

      {locations
        .filter((loc) => loc.locationName.toLowerCase().includes(keyword.toLowerCase()))
        .sort((a, b) => (a.locationServiceOrder > b.locationServiceOrder ? 1 : -1))
        .map((loc) => {
          const handleClick = (e) => {
            onLocationSelected(loc);
            e.preventDefault();
          };

          const editLocation = (e) => {
            setSelectedLocation({ ...loc });
            setShowModal(true);
            e.preventDefault();
          };

          const showNotes = (e) => {
            setLocationNotes(loc.locationNotes);
            e.preventDefault();
          };

          return (
            <div key={loc.locationName} className={classes.locationSpacing}>
              <div className={classes.space}>
                <Grid container alignItems="center" style={{ paddingRight: 8 }}>
                  <Grid item xs={9}>
                    <Typography variant="subtitle1" className={classes.groupLabel}>
                      <span onClick={handleClick}>{loc.locationName}</span>
                    </Typography>
                  </Grid>
                  <Grid item xs={1} style={{ textAlign: "left", backgroundColor: "" }}>
                    {loc.locationNotes && <NoteIcon color="secondary" onClick={showNotes} />}
                  </Grid>
                  <Grid item xs={1} style={{ backgroundColor: "" }}>
                    <Typography variant="h6" style={{ backgroundColor: "" }} >
                      <div style={{fontSize: getFontScale(loc.processedCount, loc.totalCount)}}>
                        {loc.processedCount}/{loc.totalCount}
                      </div>
                    </Typography>
                  </Grid>
                  <Grid item xs={1} style={{ textAlign: "right", backgroundColor: "" }}>
                    <EditIcon onClick={editLocation} />
                  </Grid>
                </Grid>
              </div>
              <Divider />
              {loc.productSummary.map((item) => ProductItemSummary(item))}
            </div>
          );
        })}

      <br />
    </>
  );
}
