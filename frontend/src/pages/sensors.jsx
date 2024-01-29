import { Helmet } from 'react-helmet-async';

import { SensorsView } from 'src/sections/sensors/view';

// ----------------------------------------------------------------------

export default function SensorsPage() {
  return (
    <>
      <Helmet>
        <title> Sensor | EcoMech </title>
      </Helmet>

      <SensorsView />
    </>
  );
}
