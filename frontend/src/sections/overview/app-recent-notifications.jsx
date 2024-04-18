import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import { Button, Typography, ButtonGroup } from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import {
  useSendNotification,
  useDismissNotification,
  currentRegionNotificationHistorySelector,
} from 'src/recoil/alarms';

export default function RecentNotifications({ sx }) {
  const currentRegionNotifications = useRecoilValue(currentRegionNotificationHistorySelector);

  return (
    <Card sx={sx}>
      <CardHeader title="Recent Notifications" subheader="Last 24 Hours" />

      {currentRegionNotifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </Card>
  );
}

RecentNotifications.propTypes = {
  sx: PropTypes.object,
};

// ----------------------------------------------------------------------

function NotificationItem({ notification }) {
  const sendNotification = useSendNotification();
  const dismissNotification = useDismissNotification();

  const handleSendNotification = async () => {
    console.log('--', await sendNotification(notification.id));
  };

  const handleDismissNotification = async () => {
    console.log('--', await dismissNotification(notification.id));
  };

  const renderRightAside = () => {
    if (notification.awaitingInteraction === undefined) {
      return (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Sent
        </Typography>
      );
    }

    if (notification.awaitingInteraction) {
      return (
        <ButtonGroup size="small">
          <Button color="success" onClick={handleSendNotification}>
            Send
          </Button>
          <Button color="error" onClick={handleDismissNotification}>
            Dismiss
          </Button>
        </ButtonGroup>
      );
    }

    return (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {notification.sent ? 'Sent' : 'Dismissed'}
      </Typography>
    );
  };

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
      {renderRightAside()}
    </Stack>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.object,
};
