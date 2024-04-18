import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSetRecoilState } from 'recoil';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { getFieldPropsWithHelpText } from 'src/utils/formik';

import * as userApi from 'src/api/users';
import { bgGradient } from 'src/theme/css';
import { currentUserAtom } from 'src/recoil/current-user';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const validationSchema = Yup.object().shape({
  email: Yup.string().required('Email is a required field').email('Invalid email format'),
  password: Yup.string()
    .required('Password is a required field')
    .min(8, 'Password must be at least 8 characters'),
});

export default function LoginView() {
  const [params] = useSearchParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const setCurrentUser = useSetRecoilState(currentUserAtom);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const formik = useFormik({
    validationSchema,
    initialValues: {
      email: 'noahcardoza@gmail.com',
      password: '12345678',
    },
  });

  const handleClick = async () => {
    try {
      const user = await userApi.login(formik.values);
      setCurrentUser(user);
      const redirect = params.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.data.detail);
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField label="Email address" {...getFieldPropsWithHelpText(formik, 'email')} />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          {...getFieldPropsWithHelpText(formik, 'password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton
        sx={{ my: 3 }}
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        // disabled={!formik.dirty || !formik.isValid}
        onClick={handleClick}
      >
        Login
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Sign In to EcoMesh</Typography>

          {errorMessage && (
            <Typography variant="subtitle2" sx={{ mt: 2, color: 'error.main' }}>
              {errorMessage}
            </Typography>
          )}

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 2, mb: 3 }}
          >
            <Typography variant="body2">Don’t have an account?</Typography>
            <Link to="/signup">
              <Button type="link">Get started</Button>
            </Link>
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
