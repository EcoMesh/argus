import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: <Iconify icon="lets-icons:home-duotone" width={24}/>,
  },
  {
    title: 'alarms',
    path: '/alarms',
    icon: <Iconify icon="solar:bell-bold-duotone" width={24}/>,
  },
  {
    title: 'sensors',
    path: '/sensors',
    icon: <Iconify icon="ic:baseline-sensors" width={24}/>,
  },
  {
    title: 'map',
    path: '/map',
    icon: <Iconify icon="solar:point-on-map-bold-duotone" width={24}/>,
  },
];

export default navConfig;
