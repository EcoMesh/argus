import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fToNow, fDateTime } from 'src/utils/format-time';

import { currentRegionAlarmEventsSelector } from 'src/recoil/alarms';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// ----------------------------------------------------------------------

export default function AppRecentAlarmEvents({ showViewAll = true, sx }) {
  const recentAlarms = useRecoilValue(currentRegionAlarmEventsSelector);
  return (
    <Card sx={sx}>
      <CardHeader title="Recent Alarm Events" subheader="Last 24 Hours" />
      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {recentAlarms.map((event) => (
            <NewsItem key={event.id} event={event} />
          ))}
        </Stack>
      </Scrollbar>

      {showViewAll && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              component={RouterLink}
              to="/alarms"
              type="text"
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
            >
              View all
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
}

AppRecentAlarmEvents.propTypes = {
  showViewAll: PropTypes.bool,
  sx: PropTypes.object,
};

// ----------------------------------------------------------------------

function NewsItem({ event }) {
  const recordsAsTimelineEvents = useMemo(() => {
    const events = [];
    event.records.forEach((record) => {
      events.push({
        id: `${record.id}-start`,
        color: 'error',
        nodeId: record.nodeId,
        timestamp: new Date(record.start),
      });
      if (record.end) {
        events.push({
          id: `${record.id}-end`,
          color: 'success',
          nodeId: record.nodeId,
          timestamp: new Date(record.end),
        });
      }
    });
    events.sort((a, b) => a.timestamp - b.timestamp);
    return events;
  }, [event.records]);
  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box sx={{ minWidth: 240, flexGrow: 1 }}>
          <Link color="inherit" variant="subtitle2" underline="hover" noWrap>
            {event.alarmName} ({event.records.length})
          </Link>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            Started {fToNow(new Date(event.start))} {'\u2022'}{' '}
            {event.end ? `Ended ${fToNow(new Date(event.end))}` : 'Ongoing'}
          </Typography>
        </Box>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          component={RouterLink}
          to={`/alarms/${event.alarmId}/event/${event.id}`}
        >
          View
        </Button>
      </Stack>
      <Timeline
        sx={{
          mt: 1,
          p: 0,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {recordsAsTimelineEvents.map((record, index) => (
          // <OrderItem key={item.id} item={item} lastTimeline={index === list.length - 1} />
          <TimelineItem key={record.id}>
            <TimelineSeparator>
              <TimelineDot color={record.color} />
              {index === recordsAsTimelineEvents.length - 1 ? null : <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Typography variant="subtitle2">{record.nodeId}</Typography>

              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {fDateTime(record.timestamp)}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </>
  );
}

NewsItem.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    alarmId: PropTypes.string,
    alarmName: PropTypes.string,
    records: PropTypes.array,
    start: PropTypes.string,
    end: PropTypes.string,
  }),
};
