import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { TileLayer, MapContainer } from 'react-leaflet';
import { useRef, Suspense, useEffect, forwardRef } from 'react';

import Box from '@mui/material/Box';
import { IconButton } from '@mui/material';

import { useRefreshSensors } from 'src/recoil/sensors';
import { regionByIdSelector, currentRegionSelector } from 'src/recoil/regions';

import Iconify from 'src/components/iconify';

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

function WrappedOpenTopoMapRegionContainer({ children, region, style, ...mapContainerProps }, ref) {
  const refreshSensors = useRefreshSensors();
  const innerMapRef = useRef(null);

  const centerMapOnRegion = () => {
    if (!region) return;
    innerMapRef.current?.fitBounds([
      [region.bottomLeft.coordinates[1], region.bottomLeft.coordinates[0]],
      [region.topRight.coordinates[1], region.topRight.coordinates[0]],
    ]);
  };

  const handleRef = (instance) => {
    innerMapRef.current = instance;
    if (ref) {
      ref.current = instance;
    }
    if (instance) // disable ukraine
      instance.attributionControl.setPrefix('')
    centerMapOnRegion();
  };

  const handleRefresh = () => {
    refreshSensors();
  };

  // useEffect(centerMapOnRegion, [region]);

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

export const OpenTopoMapRegionContainer = forwardRef(WrappedOpenTopoMapRegionContainer);

function WrappedOpenTopoMapCurrentRegionContainer({ ...mapContainerProps }, ref) {
  const region = useRecoilValue(currentRegionSelector);

  return <OpenTopoMapRegionContainer ref={ref} region={region} {...mapContainerProps} />;
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

WrappedOpenTopoMapRegionContainer.propTypes = {
  region: PropTypes.object,
  children: PropTypes.node,
  zoom: PropTypes.number,
  center: PropTypes.array,
  style: PropTypes.object,
};
