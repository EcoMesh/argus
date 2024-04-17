import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState, useRecoilValue } from 'recoil';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { MenuItem, TextField } from '@mui/material';

import {
  currentRegionSensorReadingsChartSelector,
  rawSensorReadingsAtom,
} from 'src/recoil/sensor-readings';

import { requestHeadersSelector } from 'src/recoil/current-user';
import * as sensorReadingsApi from 'src/api/sensor-readings';

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

const COLUMN_TO_TOOLTIP_DATATYPE = {
  temperature: 'F',
  humidity: '%',
  moisture: '%',
  groundDistance: 'm',
};

export default function AppRecentSensorReadings({ title, subheader, chart, ...other }) {
  const [column, setColumn] = useState(COLUMNS[3]);
  const [rawSensorReadings, setRawSensorReadings] = useRecoilState(rawSensorReadingsAtom);

  const authHeaders = useRecoilValue(requestHeadersSelector);
  const { labels, colors, series, options } = useRecoilValue(
    currentRegionSensorReadingsChartSelector({
      column: column.value,
      startTime: rawSensorReadings.latest
        ? new Date(new Date(rawSensorReadings.latest).getTime() - 1000 * 60 * 60 * 24)
        : new Date(Date.now() - 1000 * 60 * 60 * 24),
      resolution: 1000 * 60 * 15,
    })
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      console.log(rawSensorReadings);
      const newReadings = await sensorReadingsApi.getSensorReadings(authHeaders, {
        since: rawSensorReadings.latest,
      });

      if (newReadings.readings.length > 0) {
        setRawSensorReadings((old) => ({
          readings: [...old.readings, ...newReadings.readings],
          latest: newReadings.latest,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [rawSensorReadings, setRawSensorReadings, authHeaders]);

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
            return `${value.toFixed(0)} ${COLUMN_TO_TOOLTIP_DATATYPE[column.value]}`;
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
