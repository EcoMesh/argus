import PropTypes from 'prop-types';

import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

export default function ButtonPopover({ children, open, onClick, onClose }) {
  return (
    <>
      <IconButton onClick={onClick}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        {children}
      </Popover>
    </>
  );
}

ButtonPopover.propTypes = {
  children: PropTypes.node,
  open: PropTypes.instanceOf(Element),
  onClick: PropTypes.func,
  onClose: PropTypes.func,
};
