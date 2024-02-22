import { useState } from 'react';
import { useRecoilState } from 'recoil';

import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';

import { databaseAtom } from 'src/recoil/database';

// ----------------------------------------------------------------------

const DATABASES = [
  {
    value: 'test',
    label: 'Test',
  },
  {
    value: 'prod',
    label: 'Production',
  },
];

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const [database, setDatabase] = useRecoilState(databaseAtom);
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      {/* <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          ...(open && {
            bgcolor: 'action.selected',
          }),
        }}
      >
        
      </IconButton> */}
      <Button
        onClick={handleOpen}
        variant="text"
        sx={{ typography: 'body2', color: 'text.primary' }}
      >
        {DATABASES.find((db) => db.value === database).label}
      </Button>
      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1,
            ml: 0.75,
            width: 180,
          },
        }}
      >
        {DATABASES.map((db) => (
          <MenuItem
            key={db.value}
            selected={db.value === database}
            onClick={() => {
              setDatabase(db.value);
              handleClose();
            }}
            sx={{ typography: 'body2', py: 1 }}
          >
            {db.label}
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}
