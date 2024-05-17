import { divIcon } from 'leaflet';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Link } from 'react-router-dom';
import { Fragment, useState, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { Popup, Polygon, Tooltip, Rectangle, Marker as MapMarker } from 'react-leaflet';

import { styled, useTheme } from '@mui/material/styles';
import {
  Room,
  Check,
  Water,
  Layers,
  Opacity,
  WaterDrop,
  ExpandMore,
  Thermostat,
} from '@mui/icons-material';
import {
  List,
  ListItem,
  Accordion,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { currentRegionSelector } from 'src/recoil/regions';
import { currentRegionSensorsSelector } from 'src/recoil/sensors';
import { currentRegionSensorReadingsSelector } from 'src/recoil/sensor-readings';

import Iconify from 'src/components/iconify';
import { useChart } from 'src/components/chart';
import { OpenTopoMapCurrentRegionContainer } from 'src/components/map';

import { SensorStatusLabel } from 'src/sections/sensors/sensor-table-row';

import { MapMode, buildHeatmap } from './map-heatmap';

const DefaultGradient = {
  0.4: 'blue',
  0.6: 'cyan',
  0.7: 'lime',
  0.8: 'yellow',
  1.0: 'red',
};

const WaterGradient = {
  0.4: 'rgb(0, 127, 255)',
  0.8: 'rgb(0, 63, 255)',
  1.0: 'rgb(0, 0, 127)',
};

//-----------------------------------------------------------------------------

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

//-----------------------------------------------------------------------------

const fmtSensorName = (sensor) => {
  if (sensor.nickname) {
    return `${sensor.nickname} (${sensor.nodeId})`;
  }

  return sensor.nodeId;
};

export function Marker({ index, active, setActive, sensor, ...props }) {
  const chart = useChart();
  const color = chart.colors[clamp(index, 0, chart.colors.length - 1)];

  const markup = renderToStaticMarkup(
    <Room
      style={{
        marginLeft: -16,
        marginTop: -10,
        width: 41,
        height: 41,
        color,
        filter: active ? 'drop-shadow(3px 3px 1px rgb(0, 0, 0, 0.6))' : null,
      }}
    />
  );
  const icon = divIcon({
    html: markup,
  });
  return (
    <MapMarker
      {...props}
      icon={icon}
      eventHandlers={{
        popupclose() {
          setActive(null);
        },
        click() {
          setActive(sensor.id);
          // map.setView(props.position, 13);
        },
      }}
    >
      <Tooltip>{fmtSensorName(sensor)}</Tooltip>
      <Popup>
        <Typography variant="subtitle1">
          <Link to={`/sensors#${sensor.nodeId}`}>{fmtSensorName(sensor)}</Link>{' '}
          <SensorStatusLabel style={{ marginLeft: 4 }} sensor={sensor} />
        </Typography>
        <Typography variant="body2" style={{ marginTop: 4, marginBottom: 0 }}>
          Latitude: {sensor.location.coordinates[0]}
        </Typography>
        <Typography variant="body2" style={{ margin: 0 }}>
          Longitude: {sensor.location.coordinates[1]}
        </Typography>
      </Popup>
    </MapMarker>
  );
}

Marker.propTypes = {
  index: PropTypes.number,
  sensor: PropTypes.object,
  active: PropTypes.bool,
  setActive: PropTypes.func,
};

//-----------------------------------------------------------------------------

export function MapContainerContent({ mapMode }) {
  const selectedRegion = useRecoilValue(currentRegionSelector);
  const selectedRegionSensors = useRecoilValue(currentRegionSensorsSelector);
  const [activeMapSensor, setActiveMapSensor] = useState(null);
  const sensorReadings = useRecoilValue(currentRegionSensorReadingsSelector);

  const [heatPoints, setHeatPoints] = useState([]);

  useEffect(() => {
    buildHeatmap(mapMode, sensorReadings, selectedRegionSensors).then((pts) => {
      setHeatPoints(pts ?? []);
    });
  }, [mapMode, selectedRegionSensors, sensorReadings]);

  return (
    <>
      <HeatmapLayer
        fitBoundsOnLoad
        fitBoundsOnUpdate
        points={heatPoints}
        longitudeExtractor={(m) => m[1]}
        latitudeExtractor={(m) => m[0]}
        intensityExtractor={(m) => m[2]}
        blur={20}
        gradient={mapMode === MapMode.Temperature ? DefaultGradient : WaterGradient}
      />
      {selectedRegion && (
        <Rectangle
          fillOpacity={0.1}
          bounds={[
            [selectedRegion.bottomLeft.coordinates[1], selectedRegion.bottomLeft.coordinates[0]],
            [selectedRegion.topRight.coordinates[1], selectedRegion.topRight.coordinates[0]],
          ]}
        />
      )}
      {selectedRegionSensors &&
        selectedRegionSensors.map((sensor, idx) => (
          <Fragment key={sensor.id}>
            {sensor.location && (
              <Marker
                sensor={sensor}
                index={idx}
                active={activeMapSensor === sensor.id}
                setActive={setActiveMapSensor}
                position={[sensor.location.coordinates[1], sensor.location.coordinates[0]]}
              />
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

MapContainerContent.propTypes = {
  mapMode: PropTypes.number,
};

const MapLayerItem = ({ children, icon, layer, mode, setMode }) => {
  const selected = mode === layer;
  const selectedBorder = selected || mode === layer - 1;
  return (
    <ListItem
      sx={{ p: 0, borderTop: `1px solid rgba(${selectedBorder ? '0, 0, 255' : '0, 0, 0'}, .1)` }}
    >
      <ListItemButton selected={selected} onClick={() => setMode(selected ? MapMode.None : layer)}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText>{children}</ListItemText>
        <Check sx={{ marginLeft: 4, opacity: selected ? 1 : 0 }} color="primary" />
      </ListItemButton>
    </ListItem>
  );
};

MapLayerItem.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.node,
  layer: PropTypes.number,
  mode: PropTypes.number,
  setMode: PropTypes.func,
};

const AccordionSummaryEx = styled((props) => (
  <AccordionSummary expandIcon={<ExpandMore />} {...props} />
))(({ theme }) => ({
  '& .MuiAccordionSummary-content': {
    marginTop: 4,
    marginBottom: 4,
  },
  '&.Mui-expanded': {
    minHeight: 48,
  },
}));

function MapUI() {
  const [mode, setMode] = useState(MapMode.None);
  const theme = useTheme();

  return (
    <>
      <MapContainerContent mapMode={mode} />
      <div
        style={{
          position: 'absolute',
          minWidth: 200,
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <div style={{ pointerEvents: 'auto', position: 'relative', top: 85, marginLeft: 10 }}>
          <Accordion sx={{ overflow: 'hidden', boxShadow: 5 }} defaultExpanded>
            <AccordionSummaryEx>
              <Typography variant="h5">
                <Layers sx={{ marginRight: 2, verticalAlign: 'text-top' }} /> Layers
              </Typography>
            </AccordionSummaryEx>
            <AccordionDetails sx={{ p: 0 }}>
              <List sx={{ p: 0, borderTop: '1px solid rgba(0, 0, 0, .2)' }}>
                <MapLayerItem
                    icon={<Iconify size={32} sx={{m: 0.5}} icon="mdi:water-flow" color={theme.palette.primary.main} />}
                    layer={MapMode.Watershed}
                    mode={mode}
                    setMode={setMode}
                  >
                  Watershed
                </MapLayerItem>
                <MapLayerItem
                  icon={<Water color="primary" />}
                  layer={MapMode.WaterLevel}
                  mode={mode}
                  setMode={setMode}
                >
                  Water Level
                </MapLayerItem>
                <MapLayerItem
                  icon={<WaterDrop color="info" />}
                  layer={MapMode.Humidity}
                  mode={mode}
                  setMode={setMode}
                >
                  Humidity
                </MapLayerItem>
                <MapLayerItem
                  icon={<Opacity color="primary" />}
                  layer={MapMode.Moisture}
                  mode={mode}
                  setMode={setMode}
                >
                  Moisture
                </MapLayerItem>
                <MapLayerItem
                  icon={<Thermostat color="error" />}
                  layer={MapMode.Temperature}
                  mode={mode}
                  setMode={setMode}
                >
                  Temperature
                </MapLayerItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
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
      <MapUI />
    </OpenTopoMapCurrentRegionContainer>
  );
}
