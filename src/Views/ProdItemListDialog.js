import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Divider } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import { SingleItem } from "./SharedComponents";
import { UiContext, WorkOrderContext } from "../DataServices/Contexts";
import ChangeWoliStatusDialog from "./ChgWoliStatusDialog";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  productName: {
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
}));

export default function ProdItemListDialog() {
  const { workOrder } = useContext(WorkOrderContext);
  const { uiState, setUiState } = useContext(UiContext);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWoliItem, setSelectedWoliItem] = useState(null);

  const classes = useStyles();

  const handleClose = () => {
    setUiState((o) => {
      return {
        ...o,
        showModal: false,
      };
    });
  };

  function getItems() {
    if (!(uiState?.showModal)) return []; // don't render

    const items = uiState?.modalData?.filterItems(workOrder?.productItems) ?? [];
    return items.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  function fnEditItem(woli) {
    setSelectedWoliItem(woli);
    setShowEditModal(true);
  }

  return (
    <div>
      <Dialog fullScreen open={uiState?.showModal} onClose={handleClose}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {uiState?.modalData?.title}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Typography variant="body1" className={classes.productName}>
          {uiState?.modalData?.name}
        </Typography>

        <Divider />

        {getItems().map((o) => SingleItem(o, fnEditItem))}
      </Dialog>

      <ChangeWoliStatusDialog
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        selectedWoliItem={selectedWoliItem}
        setSelectedWoliItem={setSelectedWoliItem}
      />      
    </div>
  );
}
