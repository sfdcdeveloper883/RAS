import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import GTranslateIcon from '@material-ui/icons/GTranslate';
import Summary from "./Summary";
import BarcodeScanned from "./BarcodeScanned";
import ProductSummary from "./ProductSummary";
import LocationPanel from "./LocationPanel";
import SiteSurvey from "./SiteSurvey";
import { WorkOrderContext } from "../DataServices/Contexts";

import { useTranslation } from "react-i18next";
import i18n from 'i18next';

const useStyles = makeStyles((theme) => ({
  emptySpace: {
    height: 56, // same as appBar - any better way?
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function SwitchLanguage() {
  // const [i18n] = useTranslation('common');  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }; 

  const switchToEnglish = () => {
    i18n.changeLanguage('en');
    setAnchorEl(null);
  }

  const switchToFrench = () => {
    i18n.changeLanguage('fr');
    setAnchorEl(null);
  }

  const ITEM_HEIGHT = 48;

  return (
    <>
          <IconButton
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <GTranslateIcon />
          </IconButton>
          <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
          <MenuItem onClick={switchToEnglish}>
            English
          </MenuItem>
          <MenuItem onClick={switchToFrench}>
            Français
          </MenuItem>
      </Menu>
    </>
  );
}

export default function MyTabs() {
  const { workOrder } = useContext(WorkOrderContext);
  const [value, setValue] = React.useState(0);
  const classes = useStyles();
  const [t] = useTranslation("common");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="fixed" style={{flexGrow: 1}}>
        <Tabs value={value} onChange={handleChange} aria-label="main tabs" variant="fullWidth">
          <Tab label={t("ui.top_nav_tabs.label_summary")} />
          <Tab label={t("ui.top_nav_tabs.label_location")} />
          {workOrder?.hdr?.siteSurveyId && <Tab label={t("ui.top_nav_tabs.label_notes")} />}
          <SwitchLanguage style={{marginLeft: 'auto'}} />
        </Tabs>
      </AppBar>
      
      <div className={classes.emptySpace}></div>
      <TabPanel value={value} index={0}>
        <>
          <Summary />
          <br />
            <BarcodeScanned />
          <br />
          <ProductSummary />
        </>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <>
          <LocationPanel />
        </>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <>{workOrder?.hdr?.siteSurveyId && <SiteSurvey siteSurveyId={workOrder?.hdr?.siteSurveyId} />}</>
      </TabPanel>
    </>
  );
}
