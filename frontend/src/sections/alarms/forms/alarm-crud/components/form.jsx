import React from 'react';

import PropTypes from 'prop-types';
import { FieldArray, FormikProvider, Form } from 'formik';
import { alpha } from '@mui/material/styles';

import {
  Grid,
  Box,
  Button,
  MenuItem,
  FormControl,
  FormControlLabel,
  TextField,
  FormGroup,
  Typography,
  Switch,
  Stack,
} from '@mui/material';

import AstNode from './ast-node';
import { getFieldPropsWithHelpText } from 'src/utils/formik';

const AlertCrudForm = ({ formik }) => {
  return (
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
            <FieldArray name="conditions.tests">
              {(arrayTools) => (
                <AstNode
                  arrayTools={arrayTools}
                  formik={formik}
                  node={formik.values.conditions}
                  path="conditions"
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
                                ? { type: 'email', value: '' }
                                : { type: 'webhook', value: '', interactionRequired: false }
                            );
                          }}
                        >
                          <MenuItem value="email">Email</MenuItem>
                          <MenuItem value="webhook">Webhook</MenuItem>
                        </TextField>
                        <TextField
                          size="small"
                          fullWidth
                          label={
                            formik.values.subscribers[index].type === 'email' ? 'Email' : 'URL'
                          }
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
                      onClick={() =>
                        arrayHelpers.push({
                          type: 'email',
                          value: '',
                        })
                      }
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
};

AlertCrudForm.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default AlertCrudForm;
