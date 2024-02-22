import PropTypes from 'prop-types';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { useRef, useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import {
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import { regionsAtom, useCreateRegion, currentRegionIdAtom } from 'src/recoil/regions';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { OpenTopoMapContainer } from 'src/components/map';
import { DialogAppBar, DialogFullscreen } from 'src/components/dialog';

import { NAV } from './config-layout';
import navConfig from './config-navigation';

const NewRegionModal = ({ open, handleClose }) => {
  const editableFeatureGroupRef = useRef(null);
  const [layerId, setLayerId] = useState(null);
  const [regionName, setRegionName] = useState('');

  const getBounds = () => {
    const layer = editableFeatureGroupRef.current._layers[layerId];
    if (layer) {
      return {
        bottomLeft: [layer.getBounds().getSouthWest().lng, layer.getBounds().getSouthWest().lat],
        topRight: [layer.getBounds().getNorthEast().lng, layer.getBounds().getNorthEast().lat],
      };
    }
    return null;
  };

  const onRegionCreated = (event) => {
    setLayerId(event.layer._leaflet_id);
  };

  const onRegionDeleted = () => {
    setLayerId(null);
  };

  return (
    <DialogFullscreen open={open} onClose={handleClose}>
      <DialogAppBar
        onClose={handleClose}
        title="New Region"
        actionButton={
          <Button
            autoFocus
            color="inherit"
            disabled={!layerId || !regionName}
            onClick={async () => {
              handleClose({
                type: 'create',
                region: {
                  name: regionName,
                  ...getBounds(),
                },
              });
            }}
          >
            Create
          </Button>
        }
      />
      <DialogContent>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <TextField
            label="Region Name"
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
          />
          <DialogContentText>
            Use the map below to draw the region. Once you&apos;ve closed the polygon, click the
            &quot;Create&quot;.
          </DialogContentText>
          <OpenTopoMapContainer
            center={[30.3781, -103.17292662393481]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
          >
            <FeatureGroup ref={editableFeatureGroupRef}>
              <EditControl
                position="topright"
                onCreated={onRegionCreated}
                onDeleted={onRegionDeleted}
                draw={{
                  polyline: false,
                  polygon: false,
                  rectangle:
                    layerId == null
                      ? {
                          shapeOptions: {
                            showArea: true,
                            repeatMode: false,
                          },
                        }
                      : false,
                  circle: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>
          </OpenTopoMapContainer>
        </Stack>
      </DialogContent>
    </DialogFullscreen>
  );
};

NewRegionModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();

  const upLg = useResponsive('up', 'lg');
  const regions = useRecoilValue(regionsAtom);
  const createRegion = useCreateRegion();
  const [selectedRegion, setSelectedRegion] = useRecoilState(currentRegionIdAtom);
  const [showNewSensorModal, setShowNewSensorModal] = useState(false);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderAccount = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <FormControl sx={{ width: '100%' }}>
        <InputLabel>Region</InputLabel>
        <Select
          value={selectedRegion}
          label="Region"
          sx={{ width: '100%' }}
          size="small"
          onChange={(event) => {
            if (event.target.value === 'new') {
              setShowNewSensorModal(true);
            } else {
              setSelectedRegion(event.target.value);
            }
          }}
        >
          {regions.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
            </MenuItem>
          ))}
          <MenuItem value="new">+ New</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
      {navConfig.map((item) => (
        <NavItem key={item.title} item={item} />
      ))}
    </Stack>
  );

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo sx={{ mt: 3, ml: 4 }} />

      {renderAccount}

      {renderMenu}

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      key="navigation"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.WIDTH },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
      <NewRegionModal
        open={showNewSensorModal}
        handleClose={async (event) => {
          if (event.type !== 'create') {
            setShowNewSensorModal(false);
          } else {
            const newRegion = await createRegion(event.region);
            setShowNewSensorModal(false);
            setSelectedRegion(newRegion.id);
          }
        }}
      />
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item }) {
  const pathname = usePathname();

  const active = item.path === pathname;

  return (
    <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        fontWeight: 'fontWeightMedium',
        ...(active && {
          color: 'primary.main',
          fontWeight: 'fontWeightSemiBold',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }),
      }}
    >
      <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
        {item.icon}
      </Box>

      <Box component="span">{item.title} </Box>
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
};
