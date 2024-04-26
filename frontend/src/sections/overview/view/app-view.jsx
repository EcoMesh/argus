import { useRecoilValue } from 'recoil';

import { colors } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { currentRegionSensorsSelector } from 'src/recoil/sensors';
import { currentRegionSensorReadingsSelector } from 'src/recoil/sensor-readings';
import { currentRegionAlarmsAtom, currentRegionAlarmEventsSelector } from 'src/recoil/alarms';

import Iconify from 'src/components/iconify/iconify';

import AppCurrentVisits from '../app-current-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppRecentSensorReadings from '../app-website-visits';
import RecentNotifications from '../app-recent-notifications';
import AppRecentAlarmEvents from '../app-recent-alarm-events';

// ----------------------------------------------------------------------

export default function AppView() {
  const currentRegionSensors = useRecoilValue(currentRegionSensorsSelector);
  const currentRegionAlarms = useRecoilValue(currentRegionAlarmsAtom);
  const currentRegionAlarmEvents = useRecoilValue(currentRegionAlarmEventsSelector);
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
            total={currentRegionSensors.length || 0}
            color="success"
            path='/sensors'
            icon={<Iconify color={colors.teal.A700} icon="ic:round-sensors" width={64} height={64} /> || <img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Alarms"
            total={currentRegionAlarms.length || 0}
            color="info"
            path='/alarms'
            icon={<Iconify color={colors.indigo.A200} icon="ic:round-notifications" width={64} height={64} /> || <img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Readings"
            total={sensorReadings.length}
            color="warning"
            icon={<Iconify color={colors.amber[500]} icon="gis:measure-line" width={64} height={64} /> || <img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Alarm Events"
            total={currentRegionAlarmEvents.length}
            color="error"
            path='/alarms'
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
          <RecentNotifications sx={{ pb: 3 }} />
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
