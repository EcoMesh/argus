import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { useResponsive } from 'src/hooks/use-responsive';

import { NAV, HEADER } from './config-layout';

// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, noPadding, ...other }) {
  const lgUp = useResponsive('up', 'lg');

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          width: `calc(100% - ${NAV.WIDTH}px)`,
          px: 2,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
        }),
        ...(noPadding && { px: 0, pb: 0 }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  noPadding: PropTypes.bool,
  sx: PropTypes.object,
};
