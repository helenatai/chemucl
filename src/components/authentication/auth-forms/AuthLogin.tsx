import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Divider from '@mui/material/Divider';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import useScriptRef from 'hooks/useScriptRef';
import { DASHBOARD_PATH } from 'config';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT LOGIN ||=============================== //

const JWTLogin = ({ loginProp, ...others }: { loginProp?: number }) => {
  const theme = useTheme();
  const router = useRouter();
  const scriptedRef = useScriptRef();

  const [checked, setChecked] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault()!;
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {/* <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              onClick={async () => {
                const res = await signIn('uclapi', {
                  redirect: false,
                  callbackUrl: '/inventory-page'
                });
                if (res?.error) {
                  setError(res.error);
                }
              }}
            >
              Sign in with UCL SSO
            </Button> */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                const res = await signIn('uclapi', {
                  redirect: true,
                  callbackUrl: '/inventory-page'
                });

                console.log('SignIn response:', res);
                if (res?.error) {
                  setError(res.error);
                } else if (res?.url) {
                  router.push(res.url);
                }
              } catch (err) {
                console.error('UCL SSO error:', err);
                setError('An error occurred during UCL SSO login');
              }
            }}
          >
            Sign in with UCL SSO
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Divider>or</Divider>
        </Grid>

        <Grid item xs={12}>
          <Formik
            initialValues={{
              email: '',
              password: '',
              submit: null
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
              password: Yup.string().max(255).required('Password is required')
            })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
              try {
                setError(null);
                const result = await signIn('credentials', {
                  redirect: false,
                  email: values.email,
                  password: values.password
                });

                if (result?.error) {
                  setError(result.error);
                  setStatus({ success: false });
                  setSubmitting(false);
                } else {
                  setStatus({ success: true });
                  router.push(DASHBOARD_PATH);
                }
              } catch (err: any) {
                console.error(err);
                if (scriptedRef.current) {
                  setStatus({ success: false });
                  setError(err.message || 'An unexpected error occurred');
                  setSubmitting(false);
                }
              }
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit} {...others}>
                <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...theme.typography.customInput }}>
                  <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    inputProps={{}}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                      {errors.email}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...theme.typography.customInput }}>
                  <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    inputProps={{}}
                    label="Password"
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </FormControl>

                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />
                      }
                      label="Keep me logged in"
                    />
                  </Grid>
                </Grid>

                {error && (
                  <Box sx={{ mt: 3 }}>
                    <FormHelperText error>{error}</FormHelperText>
                  </Box>
                )}

                {errors.submit && (
                  <Box sx={{ mt: 3 }}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <AnimateButton>
                    <Button color="secondary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                      Sign In
                    </Button>
                  </AnimateButton>
                </Box>
              </form>
            )}
          </Formik>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JWTLogin;
