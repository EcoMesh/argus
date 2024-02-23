import React from 'react';
import PropTypes from 'prop-types';
import { Form, FieldArray, FormikProvider } from 'formik';

import { alpha } from '@mui/material/styles';
import {
  Grid,
  Stack,
  Button,
  Switch,
  MenuItem,
  TextField,
  FormGroup,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import { getFieldPropsWithHelpText } from 'src/utils/formik';
import { getDefaultEmailNotificationForm, getDefaultWebhookNotificationForm } from '../constants';

import AstNode from './ast-node';

const AlertCrudForm = ({ formik }) => (
  <FormikProvider value={formik}>
    <Form>
      <Grid container spacing={2} sx={{ p: 3 }}>
        <Grid item xs={12}>
          <TextField
            size="small"
            fullWidth
            label="Name"
            {...getFieldPropsWithHelpText(formik, 'name')}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
            Conditions
          </Typography>
          <FieldArray name="condition.tests">
            {(arrayTools) => (
              <AstNode
                arrayTools={arrayTools}
                formik={formik}
                node={formik.values.condition}
                path="condition"
                root
              />
            )}
          </FieldArray>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormGroup>
            <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
              Notifications
            </Typography>
            <FieldArray
              name="subscribers"
              render={(arrayHelpers) => (
                <Stack spacing={3}>
                  {formik.values.subscribers.map((subscriber, index) => (
                    <Stack
                      key={index}
                      spacing={2}
                      sx={{
                        py: 2,
                        px: 1,
                        border: (theme) => alpha(theme.palette.grey[500], 0.2),
                        borderRadius: 1,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Type"
                        select
                        size="small"
                        {...getFieldPropsWithHelpText(formik, `subscribers.${index}.type`)}
                        onChange={(e) => {
                          arrayHelpers.replace(
                            index,
                            e.target.value === 'email'
                              ? getDefaultEmailNotificationForm()
                              : getDefaultWebhookNotificationForm()
                          );
                        }}
                      >
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="webhook">Webhook</MenuItem>
                      </TextField>
                      <TextField
                        size="small"
                        fullWidth
                        label={formik.values.subscribers[index].type === 'email' ? 'Email' : 'URL'}
                        {...getFieldPropsWithHelpText(formik, `subscribers.${index}.value`)}
                      />
                      {subscriber.type === 'webhook' && (
                        <FormControl>
                          <FormControlLabel
                            control={
                              <Switch
                                {...formik.getFieldProps(
                                  `subscribers.${index}.interactionRequired`
                                )}
                                checked={formik.values.subscribers[index].interactionRequired}
                                onChange={formik.handleChange}
                              />
                            }
                            label="Interaction Required"
                          />
                        </FormControl>
                      )}
                      <FormGroup>
                        <Typography variant="caption" sx={{ mb: 1 }}>
                          Notify on
                        </Typography>
                        <Stack direction="row" justifyContent={'center'}>
                          <FormControlLabel
                            labelPlacement="before"
                            componentsProps={{
                              typography: { variant: 'caption' },
                            }}
                            control={
                              <Checkbox
                                size="small"
                                {...formik.getFieldProps(
                                  `subscribers.${index}.notifyOn.eventStart`
                                )}
                                checked={formik.values.subscribers[index].notifyOn.eventStart}
                                onChange={formik.handleChange}
                              />
                            }
                            label="Event Start"
                          />
                          <FormControlLabel
                            labelPlacement="before"
                            componentsProps={{
                              typography: { variant: 'caption' },
                            }}
                            control={
                              <Checkbox
                                size="small"
                                {...formik.getFieldProps(`subscribers.${index}.notifyOn.eventEnd`)}
                                checked={formik.values.subscribers[index].notifyOn.eventEnd}
                                onChange={formik.handleChange}
                              />
                            }
                            label="Event End"
                          />
                          <FormControlLabel
                            labelPlacement="before"
                            componentsProps={{
                              typography: { variant: 'caption' },
                            }}
                            control={
                              <Checkbox
                                size="small"
                                {...formik.getFieldProps(
                                  `subscribers.${index}.notifyOn.sensorStateChange`
                                )}
                                checked={
                                  formik.values.subscribers[index].notifyOn.sensorStateChange
                                }
                                onChange={formik.handleChange}
                              />
                            }
                            label="Sensor State Change"
                          />
                        </Stack>
                      </FormGroup>
                      {formik.values.subscribers.length > 1 && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => arrayHelpers.remove(index)}
                          color="error"
                        >
                          Remove
                        </Button>
                      )}
                    </Stack>
                  ))}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => arrayHelpers.push(getDefaultEmailNotificationForm())}
                  >
                    Add
                  </Button>
                </Stack>
              )}
            />
          </FormGroup>
        </Grid>
      </Grid>
    </Form>
  </FormikProvider>
);

AlertCrudForm.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default AlertCrudForm;
