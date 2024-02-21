// ----------------------------------------------------------------------
import useStateRef from 'react-usestateref';
import { EditControl } from 'react-leaflet-draw';
import { Marker, FeatureGroup } from 'react-leaflet';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import CircularProgress from '@mui/material/CircularProgress';
import {
  Box,
  Card,
  Stack,
  Switch,
  Button,
  Container,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { useInitSensor, sensorByIdSelector } from 'src/recoil/sensors';
import { regionByIdSelector, currentRegionIdAtom } from 'src/recoil/regions';

import { OpenTopoMapCurrentRegionContainer } from 'src/components/map';

import { MapContainerContent } from 'src/sections/map/view/map-view';

const geolocationAvailable = 'geolocation' in navigator;

export default function SensorInitPage() {
  const initSensor = useInitSensor();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [userLocation, setUserLocation] = useState(null);

  const [showMap, setShowMap, showMapRef] = useStateRef(false);
  const editableFeatureGroupRef = useRef(null);
  const markerRef = useRef(null);

  const setCurrentRegionId = useSetRecoilState(currentRegionIdAtom);
  const { jwt, sensorId } = useMemo(() => {
    const jwtPayload = params.get('sensor');
    if (!jwtPayload) return null;
    return {
      jwt: jwtPayload,
      sensorId: JSON.parse(atob(jwtPayload.split('.')[1])).id,
    };
  }, [params]);

  const sensor = useRecoilValue(sensorByIdSelector(sensorId));
  const sensorRegion = useRecoilValue(regionByIdSelector(sensor?.regionId));

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (showMapRef.current) return;
          const { latitude: lat, longitude: lon } = position.coords;
          setUserLocation({ lat, lon });
        },
        // if there was an error getting the users location
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const renderCardContents = () => {
    if (!sensor) {
      return (
        <>
          <Typography variant="body1" sx={{ p: 3 }}>
            Something is wrong with your link.
          </Typography>
          <Link to="/sensors">
            <Button variant="contained">Go to Sensors</Button>
          </Link>
        </>
      );
    }

    if (sensor.location) {
      return (
        <>
          <Typography variant="body1" sx={{ p: 3 }}>
            This sensor has already been initialized.
          </Typography>
          <Link
            to="/sensors"
            onClick={() => {
              setCurrentRegionId(sensorRegion?.id);
            }}
          >
            <Button variant="contained">Go to Sensors</Button>
          </Link>
        </>
      );
    }

    if (!geolocationAvailable) {
      return (
        <Typography variant="body1" sx={{ p: 3 }}>
          Geolocation is not supported by this browser. Please use a different browser or device.
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="body1">
          Sensor: <strong>{sensor?.nodeId}</strong>
        </Typography>
        <Typography variant="body1">
          Region: <strong>{sensorRegion?.name}</strong>
        </Typography>

        {!userLocation ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 2,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack direction="row" justifyContent="space-between">
            <Stack direction="column" spacing={2}>
              <Typography variant="body1">
                Latitude: <strong>{userLocation?.lat || 'N/A'}</strong>
              </Typography>
              <Typography variant="body1">
                Longitude: <strong>{userLocation?.lon || 'N/A'}</strong>
              </Typography>
            </Stack>
            <Box>
              <Button
                variant="contained"
                size="small"
                disabled={showMap}
                onClick={() => {
                  setUserLocation(null);
                  // keeps animation form flashing
                  setTimeout(() => {
                    getUserLocation();
                  }, 500);
                }}
              >
                Refresh
              </Button>
            </Box>
          </Stack>
        )}
        <Stack direction="row" justifyContent="space-between">
          <FormControl>
            <FormControlLabel
              control={<Switch />}
              label="Use my current location"
              checked={!showMap}
              onChange={(e) => {
                setShowMap((v) => !v);
                setCurrentRegionId(sensorRegion?.id);
              }}
            />
          </FormControl>
          {showMap && (
            <Button
              onClick={() => {
                setUserLocation({
                  lat:
                    (sensorRegion.bottomLeft.coordinates[1] +
                      sensorRegion.topRight.coordinates[1]) /
                    2,
                  lon:
                    (sensorRegion.bottomLeft.coordinates[0] +
                      sensorRegion.topRight.coordinates[0]) /
                    2,
                });
              }}
            >
              Center In Region
            </Button>
          )}
        </Stack>
        {showMap && (
          <OpenTopoMapCurrentRegionContainer
            zoom={13}
            center={[userLocation?.lat || 0, userLocation?.lon || 0]}
            style={{ height: '300px', width: '100%' }}
          >
            <MapContainerContent />
            <FeatureGroup ref={editableFeatureGroupRef}>
              <EditControl
                position="topright"
                onEditStop={() => {
                  requestAnimationFrame(() => {
                    setUserLocation({
                      lat: markerRef.current._latlng.lat,
                      lon: markerRef.current._latlng.lng,
                    });
                  });
                }}
                onEditMove={() => {
                  setUserLocation({
                    lat: markerRef.current._latlng.lat,
                    lon: markerRef.current._latlng.lng,
                  });
                }}
                edit={{
                  remove: false,
                }}
                draw={{
                  polyline: false,
                  polygon: false,
                  rectangle: false,
                  circle: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
              <Marker ref={markerRef} position={[userLocation?.lat || 0, userLocation?.lon || 0]} />
            </FeatureGroup>
          </OpenTopoMapCurrentRegionContainer>
        )}
        <Button
          variant="contained"
          onClick={async () => {
            await initSensor(jwt, userLocation);
            setCurrentRegionId(sensorRegion?.id);
            navigate('/sensors');
          }}
          disabled={!userLocation}
        >
          Initialize
        </Button>
      </>
    );
  };

  useEffect(getUserLocation, [showMapRef]);

  return (
    <Container
      sx={{
        maxWidth: '600px',
      }}
      maxWidth={false}
    >
      <Typography variant="h4" sx={{ my: 5 }}>
        Initialize Sensor
      </Typography>

      <Card>
        <Stack direction="column" spacing={2} sx={{ p: 3 }}>
          {renderCardContents()}
        </Stack>
      </Card>
    </Container>
  );
}
