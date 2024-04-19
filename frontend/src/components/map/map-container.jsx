import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { TileLayer, MapContainer } from 'react-leaflet';
import { useRef, Suspense, useEffect, forwardRef } from 'react';

import Box from '@mui/material/Box';
import { IconButton } from '@mui/material';

import { useRefreshSensors } from 'src/recoil/sensors';
import { currentRegionSelector } from 'src/recoil/regions';

import Iconify from 'src/components/iconify';

// const selectedRegion = useRecoilValue(currentRegionSelector);
//     const sensorsRefresher = useRecoilRefresher_UNSTABLE(sensorsAtom);

//     const centerMapOnRegion = () => {
//         if (!selectedRegion) return;
//         mapRef.current?.fitBounds([
//         [selectedRegion.bottomLeft.coordinates[1], selectedRegion.bottomLeft.coordinates[0]],
//         [selectedRegion.topRight.coordinates[1], selectedRegion.topRight.coordinates[0]],
//         ]);
//     };

//     useEffect(centerMapOnRegion, [selectedRegion]);

function WrappedOpenTopoMapContainer({ children, ...mapContainerProps }, ref) {
  return (
    <MapContainer {...mapContainerProps} ref={ref}>
      <TileLayer
        attribution='&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> contributors'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />
      <Suspense>{children}</Suspense>
    </MapContainer>
  );
}

export const OpenTopoMapContainer = forwardRef(WrappedOpenTopoMapContainer);

WrappedOpenTopoMapContainer.propTypes = {
  children: PropTypes.node,
  zoom: PropTypes.number,
  center: PropTypes.array,
  style: PropTypes.object,
};

function WrappedOpenTopoMapCurrentRegionContainer({ children, style, ...mapContainerProps }, ref) {
  const selectedRegion = useRecoilValue(currentRegionSelector);
  const refreshSensors = useRefreshSensors();
  const innerMapRef = useRef(null);

  const centerMapOnRegion = () => {
    if (!selectedRegion) return;
    innerMapRef.current?.fitBounds([
      [selectedRegion.bottomLeft.coordinates[1], selectedRegion.bottomLeft.coordinates[0]],
      [selectedRegion.topRight.coordinates[1], selectedRegion.topRight.coordinates[0]],
    ]);
  };

  const handleRef = (instance) => {
    innerMapRef.current = instance;
    if (ref) {
      ref.current = instance;
    }
    centerMapOnRegion();
  };

  const handleRefresh = () => {
    refreshSensors();
  };

  useEffect(centerMapOnRegion, [selectedRegion]);

  return (
    <Box sx={{ position: 'relative' }} style={style}>
      <IconButton
        onClick={handleRefresh}
        size="small"
        sx={{
          shadow: 2,
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'white',
        }}
      >
        <Iconify icon="mdi:refresh" />
      </IconButton>
      <OpenTopoMapContainer
        ref={handleRef}
        style={{ width: '100%', height: '100%' }}
        {...mapContainerProps}
      >
        {children}
      </OpenTopoMapContainer>
    </Box>
  );
}

export const OpenTopoMapCurrentRegionContainer = forwardRef(
  WrappedOpenTopoMapCurrentRegionContainer
);

WrappedOpenTopoMapCurrentRegionContainer.propTypes = {
  children: PropTypes.node,
  zoom: PropTypes.number,
  center: PropTypes.array,
  style: PropTypes.object,
};
