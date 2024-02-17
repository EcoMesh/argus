import PropTypes from 'prop-types';
import { EditControl } from 'react-leaflet-draw';
import { useRef, useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { TileLayer, FeatureGroup, MapContainer } from 'react-leaflet';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import { Select, MenuItem, TextField, InputLabel, FormControl } from '@mui/material';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import { regionsAtom, useCreateRegion, selectedRegionIdAtom } from 'src/recoil/regions';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
import navConfig from './config-navigation';

// ----------------------------------------------------------------------
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  height: '100%',
  maxWidth: 1200,
  maxHeight: 800,
  bgcolor: 'background.paper',
  p: 4,
};

const NewRegionModal = ({ open, handleClose }) => {
  const editableFeatureGroupRef = useRef(null);
  const [layerId, setLayerId] = useState(null);
  const [regionName, setRegionName] = useState(null);

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
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            New Region
          </Typography>
          <TextField
            label="Region Name"
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
          />
          <Typography id="modal-modal-description" variant="body1" component="p">
            Use the map below to draw the region. Once you&apos;ve closed the polygon, click the
            &quot;Create&quot;.
          </Typography>
          <MapContainer
            center={[30.3781, -103.17292662393481]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
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
          </MapContainer>
          <Button
            variant="contained"
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
        </Stack>
      </Box>
    </Modal>
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
  const [selectedRegion, setSelectedRegion] = useRecoilState(selectedRegionIdAtom);
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
      <NewRegionModal
        open={showNewSensorModal}
        handleClose={async (event) => {
          console.log(event);
          if (event.type !== 'create') {
            setShowNewSensorModal(false);
          } else {
            createRegion(event.region);
          }
        }}
      />
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

  const renderUpgrade = (
    <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
      <Stack alignItems="center" spacing={3} sx={{ pt: 5, borderRadius: 2, position: 'relative' }}>
        <Box
          component="img"
          src="/assets/illustrations/illustration_avatar.png"
          sx={{ width: 100, position: 'absolute', top: -50 }}
        />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Get more?</Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            From only $69
          </Typography>
        </Box>

        <Button
          href="https://material-ui.com/store/items/minimal-dashboard/"
          target="_blank"
          variant="contained"
          color="inherit"
        >
          Upgrade to Pro
        </Button>
      </Stack>
    </Box>
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

      {renderUpgrade}
    </Scrollbar>
  );

  return (
    <Box
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
