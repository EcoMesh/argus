import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import List from '@mui/material/List';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { bgBlur } from 'src/theme/css';
import { isMac, isMobileOrTablet } from 'src/constants';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const HEADER_MOBILE = 64;
const HEADER_DESKTOP = 92;

const keyboardShortcut = isMac ? '⌘ + /' : 'Ctrl + /';

const StyledSearchbarContainer = styled('div')(({ theme }) => ({
  ...bgBlur({
    color: theme.palette.background.default,
    opacity: 0.9,
  }),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  boxShadow: theme.customShadows.z8,
}));

const StyledSearchbar = styled('div')(({ theme }) => ({
  height: HEADER_MOBILE,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 3),

  my: theme.spacing(0, 3),
  [theme.breakpoints.up('md')]: {
    height: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
    my: theme.spacing(0, 5),
  },
}));

const StyledKeyboardShortcutBox = styled('div')(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  fontWeight: 'bold',
  lineHeight: theme.typography.pxToRem(20),
  marginLeft: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  padding: `${theme.spacing(0)} ${theme.spacing(0.5)}`,
  borderRadius: '7px',
}));

const SEARCH_ITEMS = [
  {
    title: 'Dashboard',
    icon: 'ic:outline-home',
    to: '/',
  },
  {
    title: 'Alarms',
    icon: 'ic:outline-notifications',
    to: '/alarms',
  },
  {
    title: 'Sensors',
    icon: 'ic:baseline-sensors',
    to: '/sensors',
  },
  {
    title: 'Map',
    icon: 'solar:point-on-map-linear',
    to: '/map',
  },
];

// ----------------------------------------------------------------------

export default function Searchbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const queryResults = useMemo(() => {
    if (!query) {
      return [];
    }

    return SEARCH_ITEMS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleSearchResultClick = useCallback(
    (itemIndex) => {
      const item = queryResults[itemIndex];
      if (item?.to) {
        navigate(item.to);
      }

      setOpen(false);
      setQuery('');
      setSelectedIndex(0);
    },
    [queryResults, navigate]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [queryResults]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;

      if (event.key === 'Enter') {
        handleSearchResultClick(selectedIndex);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, selectedIndex, queryResults, handleSearchResultClick]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;

      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev < queryResults.length - 1 ? prev + 1 : 0));
      }
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : queryResults.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setSelectedIndex, queryResults]);

  useEffect(() => {
    // on cmd+/ - open search bar
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        setOpen((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setOpen]);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!open && (
          <Stack direction="row" alignItems="center">
            <IconButton onClick={handleOpen}>
              <Iconify icon="eva:search-fill" />
            </IconButton>
            {!isMobileOrTablet && (
              <StyledKeyboardShortcutBox>{keyboardShortcut}</StyledKeyboardShortcutBox>
            )}
          </Stack>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <StyledSearchbarContainer>
            <StyledSearchbar>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                fullWidth
                disableUnderline
                placeholder="Search…"
                startAdornment={
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ color: 'text.disabled', width: 20, height: 20 }}
                    />
                  </InputAdornment>
                }
                sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
              />
              <Button variant="contained" onClick={handleClose}>
                Search
              </Button>
            </StyledSearchbar>
            <List sx={{ p: 0 }}>
              {queryResults.map((item, index) => (
                <ListItemButton
                  key={item.title}
                  onClick={() => handleSearchResultClick(index)}
                  selected={index === selectedIndex}
                >
                  <ListItemIcon>
                    <Iconify icon={item.icon} />
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              ))}
            </List>
          </StyledSearchbarContainer>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
