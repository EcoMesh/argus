import * as React from 'react';
import PropTypes from 'prop-types';

import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function DialogFullscreen({ children, open, handleClose, ...props }) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      {...props}
    >
      {children}
    </Dialog>
  );
}

DialogFullscreen.propTypes = {
  children: PropTypes.node,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
