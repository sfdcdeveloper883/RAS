import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  emptySpace: {
    height: 56, // same as appBar
  },
}));

const AppNavBar = () => {
  const classes = useStyles();
  return (
    <>
      <div>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="inherit" color="inherit">
              Room Agnostic Scan
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.emptySpace}></div>
    </>
  );
};
export default AppNavBar;
