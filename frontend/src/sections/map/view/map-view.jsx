import { Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { Marker, Polygon, Rectangle } from 'react-leaflet';

import { currentRegionSelector } from 'src/recoil/regions';
import { currentRegionSensorsSelector } from 'src/recoil/sensors';

import { OpenTopoMapCurrentRegionContainer } from 'src/components/map';

export function MapContainerContent() {
  const selectedRegion = useRecoilValue(currentRegionSelector);
  const selectedRegionSensors = useRecoilValue(currentRegionSensorsSelector);
  console.log(selectedRegionSensors);

  return (
    <>
      {selectedRegion && (
        <Rectangle
          bounds={[
            [selectedRegion.bottomLeft.coordinates[1], selectedRegion.bottomLeft.coordinates[0]],
            [selectedRegion.topRight.coordinates[1], selectedRegion.topRight.coordinates[0]],
          ]}
        />
      )}
      {selectedRegionSensors &&
        selectedRegionSensors.map((sensor) => (
          <Fragment key={sensor.id}>
            {sensor.location && (
              <Marker position={[sensor.location.coordinates[1], sensor.location.coordinates[0]]} />
            )}
            {sensor.watershed && (
              <Polygon
                positions={sensor.watershed.coordinates[0].map((c) => [c[1], c[0]])}
                smoothFactor={1}
              />
            )}
          </Fragment>
        ))}
    </>
  );
}
export default function MapView() {
  return (
    <OpenTopoMapCurrentRegionContainer
      style={{ width: '100%', height: '100%' }}
      center={[30.3781, -103.17292662393481]}
      zoom={13}
    >
      <MapContainerContent />
    </OpenTopoMapCurrentRegionContainer>
  );
}
