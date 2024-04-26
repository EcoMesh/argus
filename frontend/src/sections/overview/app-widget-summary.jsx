import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { CardActionArea } from '@mui/material';
import Typography from '@mui/material/Typography';

import { fShortenNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function AppWidgetSummary({ title, total, icon, path, color = 'primary', sx, ...other }) {
  const navigate = useNavigate()
  const ActionArea = path ? CardActionArea : 'div';
  return (
    <Card      
      {...other}
    >
      <ActionArea
        onClick={() => navigate(path)}
      >
        <Stack
          spacing={3}
          direction="row"
          sx={{
            px: 3,
            py: 5,
            borderRadius: 2,
            ...sx,
          }}
        >
          {icon && <Box sx={{ width: 64, height: 64 }}>{icon}</Box>}

          <Stack spacing={0.5}>
            <Typography variant="h4">{fShortenNumber(total)}</Typography>

            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
              {title}
            </Typography>
          </Stack>
        </Stack>
      </ActionArea>
    </Card>
  );
}

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  path: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.string,
  total: PropTypes.number,
};
