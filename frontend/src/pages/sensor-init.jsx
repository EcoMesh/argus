import { Helmet } from 'react-helmet-async';

import { SensorInitView } from 'src/sections/sensors/view';

// ----------------------------------------------------------------------

export default function SensorsPage() {
  return (
    <>
      <Helmet>
        <title> Init Sensor | EcoMech </title>
      </Helmet>

      <SensorInitView />
    </>
  );
}
