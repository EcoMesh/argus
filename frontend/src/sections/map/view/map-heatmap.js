import { buildWatershedHeatmap } from "./map-watershed";


export const MapMode = {
  None: 0,
  WaterLevel: 1,
  Humidity: 2,
  Moisture: 3,
  Temperature: 4,
  Watershed: 5,
};

const DataKeys = [
  null,
  'groundDistance',
  'humidity',
  'moisture',
  'temperature',
  'watershed' // placeholder
]

//-----------------------------------------------------------------------------

function lerp(a, b, alpha) {
  return a + alpha * (b - a)
}

function maxValue(array, key) {
  return array.reduce((max, item) => Math.max(max, item[key]), Number.NEGATIVE_INFINITY);
}

function minValue(array, key) {
  return array.reduce((max, item) => Math.min(max, item[key]), Number.POSITIVE_INFINITY);
}

//-----------------------------------------------------------------------------

export async function buildHeatmap(mode, sensorReadings, selectedRegionSensors) {

  const key = DataKeys[mode];
  if (!key)
    return null;
  let points = []

  console.log("Building heatmap")
  const sorted = sensorReadings.toSorted((a, b) => b.timestamp - a.timestamp);

  // This is far from ideal. We should also look at the historic data too, not just one data point
  function getValue(sensor) {
    const readings = sorted.filter(reading => reading.nodeId === sensor.nodeId);
    if (!readings.length)
      return null;
    return readings[0][key];
  }


  if (mode === MapMode.Watershed) {
    if (!selectedRegionSensors || !selectedRegionSensors.length)
      return null;

    selectedRegionSensors.forEach(sensor => {
      if (!sensor?.watershed?.coordinates?.length)
        return;
      points = points.concat(buildWatershedHeatmap(
        sensor.watershed.coordinates[0], // watershed polygon
        sensor.location?.coordinates ?? sensor.watershed.coordinates[0][0], // sensor pos
        getValue(sensor) ?? 1 // recorded value
      ));
    });

    return points;
  }

  // O(n^2) :|
  for (let i = 0; i < selectedRegionSensors.length; i += 1) {
    const sensor = selectedRegionSensors[i];
    if (!sensor?.location?.coordinates) continue;

    const value = getValue(sensor);
    if (value === null) continue;

    // Inflate near-sensor point
    const [lat, lon] = sensor.location.coordinates;
    points.push([lat, lon, value * 1.2]);

    // For every neighbor sensor
    for (let j = i + 1; j < selectedRegionSensors.length; j += 1) {
      const s1 = selectedRegionSensors[j];
      if (sensor === s1 || !s1?.location?.coordinates) continue;

      const value1 = getValue(s1);
      if (value1 === null) continue;

      const [lat1, lon1] = s1.location.coordinates;

      // Fill in rectangle between sensors
      for (let y = 0; y < 1; y += 0.1) {
        for (let x = 0; x < 1; x += 0.1) {
          const [avgLat, avgLon] = [lerp(lat, lat1, x), lerp(lon, lon1, y)]
          const avgValue = lerp(value, value1, (x + y) / 2);
          points.push([avgLat, avgLon, avgValue]);
        }
      }
    }

  }

  const max = maxValue(points, 2);
  const min = minValue(points, 2);

  if (max === min && max === 0)
    return null;

  // Swap lat, lon -> lon, lat; scale values from [min, max] to [0, 1]
  const scaled = points.map(p => [p[1], p[0], (p[2] - min) / (max - min)]);

  if (mode === MapMode.WaterLevel) // Invert water level
    return scaled.map(p => [p[0], p[1], 1 - p[2]])

  return scaled;
}
