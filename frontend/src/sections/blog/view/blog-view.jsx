import { Popup, Marker, Polygon, TileLayer, MapContainer } from 'react-leaflet';

// ----------------------------------------------------------------------

export default function BlogView() {
  return (
    <MapContainer
      center={[30.3781, -103.17292662393481]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> contributors'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[30.3781, -103.17292662393481]}>
        <Polygon
          pathOptions={{ color: '#882233' }}
          positions={[
            [30.3502131, -103.2265828],
            [30.3490281, -103.134744],
            [30.4513375, -103.1368039],
            [30.4517814, -103.2246945],
            [30.3502131, -103.2265828],
          ]}
        />
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
