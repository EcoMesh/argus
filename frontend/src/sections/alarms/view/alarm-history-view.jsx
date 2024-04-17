import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import RecentNotifications from 'src/sections/overview/app-recent-notifications';
import AppRecentAlarmEvents from 'src/sections/overview/app-recent-alarm-events';

export default function AlarmHistoryView() {
  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Alarm History
      </Typography>
      <Stack direction="row" justifyContent="space-between" spacing={3}>
        <AppRecentAlarmEvents showViewAll={false} sx={{ flex: 1 }} />
        <RecentNotifications showViewAll={false} sx={{ flex: 1 }} />
      </Stack>
    </Container>
  );
}
