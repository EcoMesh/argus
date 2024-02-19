const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

export const timeIntervals = [
  { label: '1H', value: ONE_HOUR },
  { label: '6H', value: ONE_HOUR * 6 },
  { label: '12H', value: ONE_HOUR * 12 },
  { label: '1D', value: ONE_DAY },
  { label: '2D', value: ONE_DAY * 2 },
];

export const sensorReadingColumns = [
  { value: 'temperature', label: 'Temperature' },
  { value: 'humidity', label: 'Humidity' },
  { value: 'moisture', label: 'Moisture' },
  { value: 'ground_distance', label: 'Ground Distance' },
];

export const getDefaultGroundDistanceRule = () => ({
  type: 'rolling_deviation',
  controlWindow: {
    column: 'ground_distance',
    timeframe: ONE_DAY,
  },
  testWindow: {
    column: 'ground_distance',
    timeframe: ONE_HOUR,
  },
  threshold: 0,
});

export const initialValues = {
  name: '',
  conditions: {
    type: 'and',
    tests: [],
  },
  subscribers: [
    {
      type: 'email',
      value: '',
    },
  ],
};
