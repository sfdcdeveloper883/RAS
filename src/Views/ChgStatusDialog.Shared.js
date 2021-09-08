import { makeStyles } from "@material-ui/core/styles";

export const useDialogStyle = makeStyles((theme) => ({
    appBar: {
      position: "fixed",
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    description: {
      paddingTop: 12,
      paddingLeft: 12,
      paddingRight: 12,
    },
    emptySpace: {
      paddingTop: 56,
    },
    bottomAppBar: {
      top: "auto",
      bottom: 0,
    },
    txtBarcode: {
      backgroundColor: theme.palette.common.white,
    },
    barcodeTextBox: {
      padding: 4,
      paddingRight: 12,
      zIndex: 10,
    },    
    space: {
      padding: 16,
    },
    content: {
      margin: 8,
      padding: 8,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));
  