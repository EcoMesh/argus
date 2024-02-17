import { Helmet } from 'react-helmet-async';

import { AlarmsView } from 'src/sections/alarms/view';

// ----------------------------------------------------------------------

export default function SensorsPage() {
  return (
    <>
      <Helmet>
        <title> Alarms | EcoMech </title>
      </Helmet>

      <AlarmsView />
    </>
  );
}
