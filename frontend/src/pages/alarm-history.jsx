import { Helmet } from 'react-helmet-async';

import AlarmHistoryView from 'src/sections/alarms/view/alarm-history-view';

// ----------------------------------------------------------------------

export default function AlarmHistoryPage() {
  return (
    <>
      <Helmet>
        <title> Alarm History | EcoMech </title>
      </Helmet>

      <AlarmHistoryView />
    </>
  );
}
