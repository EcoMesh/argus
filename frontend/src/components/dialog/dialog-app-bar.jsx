import * as React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Close as CloseIcon } from '@mui/icons-material';

export default function DialogAppBar({ title, onClose, actionButton }) {
  return (
    <AppBar color="default" position="sticky">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
        <Typography sx={{ ml: 2, flex: 1 }} variant="h4" component="h1">
          {title}
        </Typography>
        {actionButton}
      </Toolbar>
    </AppBar>
  );
}

DialogAppBar.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
  actionButton: PropTypes.node,
};
