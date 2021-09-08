import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Divider } from "@material-ui/core";
import { ProductItemSummary } from "./SharedComponents";
import { WorkOrderContext } from "../DataServices/Contexts";
import { UiContext } from "../DataServices/Contexts";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  groupLabel: {
    paddingLeft: 12,
    color: theme.palette.text.secondary,
  },
}));

export default function ProductSummary() {
  const { workOrder } = useContext(WorkOrderContext);
  const { setUiState } = useContext(UiContext);
  const [t] = useTranslation("common");

  const classes = useStyles();
  const groupByProduct = workOrder?.groupByProduct;

  const onProductSelected = (item) => {
    const filterItems = (productItems) => {
      const items = productItems == null ? [] : productItems.filter((o) => o.productCode === item.productCode);

      return items.map((o) => {
        return {
          id: o.itemId,
          name: o.locationName,
          status: o.status,
        };
      });
    };

    const modalData = {
      title: t("ui.product_by_loc_dialog.title"),
      name: `${item.productName} (${item.productCode})`,
      filterItems: filterItems,
    };

    setUiState({
      modalData: modalData,
      showModal: true,
    });
  };

  if (!groupByProduct) return <></>;

  return (
    <>
      <Typography variant="subtitle1" className={classes.groupLabel}>
        {t("ui.summary_tab.label_prod_summary")}
      </Typography>
      <Divider />

      {groupByProduct.map((item) => {
        const handleClick = (e) => {
          onProductSelected(item);
          e.preventDefault();
        };

        return (
          <div key={item.productCode} onClick={handleClick}>
            {ProductItemSummary(item)}
          </div>
        );
      })}
    </>
  );
}
