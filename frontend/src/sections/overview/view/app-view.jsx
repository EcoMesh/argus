import { useRecoilValue } from 'recoil';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { currentRegionAlarmsAtom } from 'src/recoil/alarms';
import { currentRegionSensorsSelector } from 'src/recoil/sensors';
import { currentRegionSensorReadingsSelector } from 'src/recoil/sensor-readings';

import AppCurrentVisits from '../app-current-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppRecentSensorReadings from '../app-website-visits';
import RecentNotifications from '../app-recent-notifications';
import AppRecentAlarmEvents from '../app-recent-alarm-events';

// ----------------------------------------------------------------------

export default function AppView() {
  const currentRegionSensors = useRecoilValue(currentRegionSensorsSelector);
  const currentRegionAlarms = useRecoilValue(currentRegionAlarmsAtom);
  const sensorReadings = useRecoilValue(currentRegionSensorReadingsSelector);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Sensors"
            total={currentRegionSensors.length}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Alarms"
            total={currentRegionAlarms.length}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Readings"
            total={sensorReadings.length}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Alarm Events"
            total={3}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppRecentSensorReadings />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppRecentAlarmEvents />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <RecentNotifications />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Sensor Status"
            chart={{
              series: [
                { label: 'Online', value: 5 },
                { label: 'Offline', value: 1 },
                { label: 'In Alarm', value: 2 },
              ],
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
