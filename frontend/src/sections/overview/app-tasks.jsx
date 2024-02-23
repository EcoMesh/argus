import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import { Button, Typography, ButtonGroup } from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import { currentRegionNotificationHistorySelector } from 'src/recoil/alarms';

export default function RecentNotifications() {
  const currentRegionNotifications = useRecoilValue(currentRegionNotificationHistorySelector);

  return (
    <Card>
      <CardHeader title="Recent Notifications" subheader="Last 24 Hours" />

      {currentRegionNotifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </Card>
  );
}

RecentNotifications.propTypes = {};

// ----------------------------------------------------------------------

function NotificationItem({ notification }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        px: 2,
        py: 1,
        '&:not(:last-of-type)': {
          borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
        },
      }}
    >
      <Stack>
        <Typography variant="subtitle2">{notification.value}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fDateTime(new Date(notification.timestamp))} {'\u2022'} {notification.reason}
        </Typography>
      </Stack>
      {notification.awaitingInteraction ? (
        <ButtonGroup size="small">
          <Button color="success">Send</Button>
          <Button color="error">Dismiss</Button>
        </ButtonGroup>
      ) : (
        notification.sent ?? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sent
          </Typography>
        )
      )}
    </Stack>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.object,
};
