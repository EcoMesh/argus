import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Stack, Button, MenuItem } from '@mui/material';

import { getFieldPropsWithHelpText } from 'src/utils/formik';
import { getDefaultGroundDistanceRule, sensorReadingColumns, timeIntervals } from '../constants';

const RuleNode = ({ formik, node, path, replace, remove }) => {
  //
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField
          size="small"
          select
          fullWidth
          label="Rule"
          {...formik.getFieldProps(`${path}.type`)}
          onChange={(event) => {
            if (event.target.value === 'rolling_deviation') {
              replace(getDefaultGroundDistanceRule());
            }
          }}
        >
          <MenuItem value="rolling_deviation">Rolling Deviation</MenuItem>
        </TextField>
        <Button color="error" variant="contained" onClick={() => remove()}>
          Remove
        </Button>
      </Stack>
      {node?.type === 'rolling_deviation' && (
        <>
          <Typography variant="h6">Control Window</Typography>
          <TextField
            size="small"
            fullWidth
            select
            label="Column"
            {...formik.getFieldProps(`${path}.controlWindow.column`)}
          >
            {sensorReadingColumns.map((column) => (
              <MenuItem key={column.label} value={column.value}>
                {column.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            fullWidth
            select
            label="Timeframe"
            {...formik.getFieldProps(`${path}.controlWindow.timeframe`)}
          >
            {timeIntervals.map((interval) => (
              <MenuItem key={interval.label} value={interval.value}>
                {interval.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="h6">Test Window</Typography>
          <TextField
            size="small"
            fullWidth
            select
            label="Column"
            {...formik.getFieldProps(`${path}.testWindow.column`)}
          >
            {sensorReadingColumns.map((column) => (
              <MenuItem key={column.label} value={column.value}>
                {column.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            fullWidth
            select
            label="Timeframe"
            {...formik.getFieldProps(`${path}.testWindow.timeframe`)}
          >
            {timeIntervals.map((interval) => (
              <MenuItem key={interval.label} value={interval.value}>
                {interval.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="number"
            fullWidth
            label="Threshold"
            {...getFieldPropsWithHelpText(formik, `${path}.threshold`)}
          />
        </>
      )}
    </Stack>
  );
};

RuleNode.propTypes = {
  formik: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  replace: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

export default RuleNode;
