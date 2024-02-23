import PropTypes from 'prop-types';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import Chart, { useChart } from 'src/components/chart';
import {
  currentRegionSensorReadingsSelector,
  currentRegionSensorReadingsChartSelector,
} from 'src/recoil/sensor-readings';
import { useRecoilValue } from 'recoil';
import { MenuItem, TextField } from '@mui/material';
// ----------------------------------------------------------------------

const COLUMNS = [
  {
    title: 'Temperature',
    value: 'temperature',
  },
  {
    title: 'Humidity',
    value: 'humidity',
  },
  {
    title: 'Soil Moisture',
    value: 'moisture',
  },
  {
    title: 'Ground Distance',
    value: 'groundDistance',
  },
];

export default function AppRecentSensorReadings({ title, subheader, chart, ...other }) {
  const [column, setColumn] = useState(COLUMNS[0]);
  const { labels, colors, series, options } = useRecoilValue(
    currentRegionSensorReadingsChartSelector({
      column: column.value,
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      resolution: 1000 * 60 * 15,
    })
  );

  const chartOptions = useChart({
    colors,
    plotOptions: {
      bar: {
        columnWidth: '16%',
      },
    },
    fill: {
      type: series.map((i) => i.fill),
    },
    labels,
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => {
          if (typeof value !== 'undefined') {
            return `${value.toFixed(0)} F`;
          }
          return value;
        },
      },
    },
    ...options,
  });

  return (
    <Card>
      <CardHeader
        title={`${column.title} Readings`}
        subheader="Last 24 Hours"
        action={
          <TextField
            label="Column"
            select
            size="small"
            value={column.value}
            onChange={(e) => setColumn(COLUMNS.find((c) => c.value === e.target.value))}
          >
            {COLUMNS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.title}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      <Box sx={{ p: 3, pb: 1 }}>
        <Chart
          dir="ltr"
          type="line"
          series={series}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}

AppRecentSensorReadings.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
