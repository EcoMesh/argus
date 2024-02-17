import { useRecoilValue } from 'recoil';
import { useRef, Fragment, useEffect } from 'react';
import { Marker, Polygon, TileLayer, Rectangle, MapContainer } from 'react-leaflet';

import { selectedRegionAtom } from 'src/recoil/regions';
import { selectedRegionSensorsAtom } from 'src/recoil/sensors';

export default function BlogView() {
  const mapRef = useRef(null);
  const selectedRegion = useRecoilValue(selectedRegionAtom);
  const selectedRegionSensors = useRecoilValue(selectedRegionSensorsAtom);

  const centerMapOnRegion = () => {
    if (!selectedRegion) return;
    mapRef.current?.fitBounds([
      [selectedRegion.bottomLeft.coordinates[1], selectedRegion.bottomLeft.coordinates[0]],
      [selectedRegion.topRight.coordinates[1], selectedRegion.topRight.coordinates[0]],
    ]);
  };
  useEffect(centerMapOnRegion, [selectedRegion]);

  return (
    <MapContainer
      center={[30.3781, -103.17292662393481]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      ref={(ref) => {
        mapRef.current = ref;
        centerMapOnRegion();
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> contributors'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />
      {selectedRegion && (
        <Rectangle
          bounds={[
            [selectedRegion.bottomLeft.coordinates[1], selectedRegion.bottomLeft.coordinates[0]],
            [selectedRegion.topRight.coordinates[1], selectedRegion.topRight.coordinates[0]],
          ]}
        />
      )}
      {selectedRegionSensors.map((sensor) => (
        <Fragment key={sensor.id}>
          <Marker position={[sensor.location.coordinates[1], sensor.location.coordinates[0]]} />
          <Polygon
            positions={sensor.watershed.coordinates[0].map((c) => [c[1], c[0]])}
            smoothFactor={1}
          />
        </Fragment>
      ))}
    </MapContainer>
  );
}
