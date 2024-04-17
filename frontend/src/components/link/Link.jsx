import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import { Link as MuiLink } from '@mui/material';

const Link = ({ to, children, ...props }) => (
  <MuiLink component={RouterLink} to={to} {...props}>
    {children}
  </MuiLink>
);

Link.propTypes = {
  to: PropTypes.any,
  children: PropTypes.node,
};

export default Link;
