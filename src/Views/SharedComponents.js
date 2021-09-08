import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Divider } from "@material-ui/core";
import { StatusEnums } from "../DataServices/FslService";

const sharedStyles = {
  colors: {
    Completed: {
      backgroundColor: "#81c784",
    },
    "Cannot Complete": {
      backgroundColor: "#f8bbd0",
    },
    New: {
      backgroundColor: "#bdbdbd",
    },
  },
}

function SingleItem(item, fnEditItem) {
  const my_styles = {
    center: {
      textAlign: "center",
    },
    space: {
      paddingLeft: 8,
      paddingTop: 8,
      paddingBottom: 8,
      paddingRight: 4,
    },
    square: {
      margin: 8,
    },
  };

  const getColor = () => {
    const colorStyle = sharedStyles.colors[item.status];
    return {...colorStyle, ...my_styles.square};
  };

  const handleClick = () => {
    fnEditItem(item);
  };

  return (
    <div key={item.id}>
      <div style={my_styles.space}>
        <Grid container alignItems="center">
          <Grid item xs={1}>
            <div onClick={handleClick} style={getColor() }>&nbsp; &nbsp;</div>
          </Grid>
          <Grid item xs={11}>
            <Typography variant="subtitle2">{item.name}</Typography>
          </Grid>
        </Grid>
      </div>
      <Divider />
    </div>
  );
}

function ProductItemSummary(item) {
  const my_styles = {
    root: {
      flexGrow: 1,
    },
    space: {
      paddingTop: 8,
      paddingBottom: 8,
      paddingRight: 4,
    },
    count: {
      textAlign: "center",
      color: "#01579b",
    },
    centerText: {
      textAlign: "center",
    },
  };

  return (
    <div key={item.productCode}>
      <div style={my_styles.space}>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <div style={my_styles.count}>
              <Typography variant="h4">
                {item.completed + item.cannotComplete + item.newAdded}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={7}>
            <Typography variant="subtitle2">{item.productName}</Typography>
          </Grid>
          <Grid item xs={1}>
            <div>
              <div style={sharedStyles.colors[StatusEnums.COMPLETED]}>
                <Typography variant="subtitle2" style={my_styles.centerText}>
                  {item.completed}
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={1}>
            <div style={sharedStyles.colors[StatusEnums.CANNOTCOMPLETE]}>
              <Typography variant="subtitle2" style={my_styles.centerText}>
                {item.cannotComplete}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={1}>
            <div style={sharedStyles.colors[StatusEnums.NEW]}>
              <Typography variant="subtitle2" style={my_styles.centerText}>
                {item.newAdded}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </div>
      <Divider />
    </div>
  );
}

export { ProductItemSummary, SingleItem, sharedStyles};
