import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  // {
  //   title: 'users',
  //   path: '/users',
  //   icon: icon('ic_user'),
  // },
  {
    title: 'alarms',
    path: '/alarms',
    icon: <Iconify icon="ic:round-notifications" width={24}/>,
  },
  // {
  //   title: 'product',
  //   path: '/products',
  //   icon: icon('ic_cart'),
  // },
  {
    title: 'sensors',
    path: '/sensors',
    icon: <Iconify icon="ic:round-sensors" width={24}/>,
  },
  {
    title: 'map',
    path: '/map',
    icon: <Iconify icon="mdi:map" width={24}/>,
  },
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: icon('ic_lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
