import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { MenuItem, TextField } from '@mui/material';

import { COLUMN_TO_TOOLTIP_DATATYPE } from 'src/utils/units';

import * as sensorReadingsApi from 'src/api/sensor-readings';
import { requestHeadersSelector } from 'src/recoil/current-user';
import {
  rawSensorReadingsAtom,
  currentRegionSensorReadingsChartSelector,
} from 'src/recoil/sensor-readings';

import Chart, { useChart } from 'src/components/chart';
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

const RESOLUTIONS = [
  {
    title: 'Raw',
    value: 'raw',
  },
  {
    title: '5 seconds',
    value: 1000 * 5,
  },
  {
    title: '1 minute',
    value: 1000 * 60 * 1,
  },
  {
    title: '5 minutes',
    value: 1000 * 60 * 5,
  },
  {
    title: '15 minutes',
    value: 1000 * 60 * 15,
  },
  {
    title: '30 minutes',
    value: 1000 * 60 * 30,
  },
  {
    title: '1 hour',
    value: 1000 * 60 * 60,
  },
  {
    title: '1 day',
    value: 1000 * 60 * 60 * 24,
  },
];


export default function AppRecentSensorReadings({ title, subheader, chart, ...other }) {
  const [column, setColumn] = useState(COLUMNS[3]);
  const [resolution, setResolution] = useState('raw');
  const [rawSensorReadings, setRawSensorReadings] = useRecoilState(rawSensorReadingsAtom);

  const authHeaders = useRecoilValue(requestHeadersSelector);
  const { labels, colors, series, options } = useRecoilValue(
    currentRegionSensorReadingsChartSelector({
      column: column.value,
      startTime: rawSensorReadings.latest
        ? new Date(new Date(rawSensorReadings.latest).getTime() - 1000 * 60 * 60 * 24)
        : new Date(Date.now() - 1000 * 60 * 60 * 24),
      resolution: resolution === 'raw' ? undefined : resolution,
    })
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const newReadings = await sensorReadingsApi.getSensorReadings(authHeaders, {
        since: rawSensorReadings.latest,
      });

      if (newReadings.readings.length > 0) {
        setRawSensorReadings((old) => ({
          readings: [...old.readings, ...newReadings.readings],
          latest: newReadings.latest,
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [rawSensorReadings, setRawSensorReadings, authHeaders]);

  /** @type {import('apexcharts').ApexOptions} */
  const chartOpts = {
    chart: {
      id: `basic-bar${Math.random()}`, // ensures re-render for y formatting to stay reactive
    },
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
      labels: {
        datetimeUTC: false,
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => {
          if (typeof value !== 'undefined') {
            return `${value.toFixed(0)}${COLUMN_TO_TOOLTIP_DATATYPE[column.value]}`;
          }
          return value;
        },
      },
      x: {
        format: 'dd MMM HH:mm'
      }
    },
    ...options,
  };

  const chartOptions = useChart(chartOpts);

  return (
    <Card>
      <CardHeader
        title={`${column.title} Readings`}
        subheader="Last Recorded 24 Hours"
        action={
          <>
            <TextField
              label="Resolution"
              select
              size="small"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              sx={{ mr: 2, minWidth: 150 }}
            >
              {RESOLUTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Column"
              select
              size="small"
              value={column.value}
              sx={{ minWidth: 180 }}
              onChange={(e) => setColumn(COLUMNS.find((c) => c.value === e.target.value))}
            >
              {COLUMNS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.title}
                </MenuItem>
              ))}
            </TextField>
          </>
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
