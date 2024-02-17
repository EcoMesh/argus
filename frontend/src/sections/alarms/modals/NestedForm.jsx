import React, { Fragment } from 'react';
import { Formik, Form } from 'formik';
import { Grid } from '@mui/material';

import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { useFormik, FieldArray, FormikProvider, getIn } from 'formik';
import { alpha } from '@mui/material/styles';

import Modal from '@mui/material/Modal';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import {
  FormControlLabel,
  Switch,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';

import { selectedRegionAtom } from 'src/recoil/regions';

const initialValues = {
  name: '',
  conditions: {
    type: 'and',
    tests: [],
  },
  subscribers: [
    {
      type: 'email',
      value: '',
    },
  ],
};

const getFieldPropsWithHelpText = (formik, name) => ({
  ...formik.getFieldProps(name),
  error: getIn(formik.touched, name) && Boolean(getIn(formik.errors, name)),
  helperText: getIn(formik.touched, name) && getIn(formik.errors, name),
});

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const timeIntervals = [
  { label: '1H', value: ONE_HOUR },
  { label: '6H', value: ONE_HOUR * 6 },
  { label: '12H', value: ONE_HOUR * 12 },
  { label: '1D', value: ONE_DAY },
  { label: '2D', value: ONE_DAY * 2 },
];

const sensorReadingColumns = [
  { value: 'temperature', label: 'Temperature' },
  { value: 'humidity', label: 'Humidity' },
  { value: 'moisture', label: 'Moisture' },
  { value: 'ground_distance', label: 'Ground Distance' },
];

const ruleValidationSchema = Yup.object().shape({
  type: Yup.string().required('Rule type is required'),
  control_window: Yup.object().shape({
    column: Yup.string().required('Control window column is required'),
    timeframe: Yup.number().required('Control window timeframe is required'),
  }),
  test_window: Yup.object().shape({
    column: Yup.string().required('Test window column is required'),
    timeframe: Yup.number().required('Test window timeframe is required'),
  }),
  threshold: Yup.number()
    .required('Threshold is required')
    .min(0.01, 'Threshold must be between 0.01 and 1')
    .max(1, 'Threshold must be between 0.01 and 1'),
});

const conditionValidationSchema = Yup.lazy((value) => {
  switch (value?.type) {
    case 'rule':
      return Yup.object().shape({
        type: Yup.string().required('Rule type is required'),
        rule: ruleValidationSchema,
      });
    case 'and':
    case 'or':
      return Yup.object().shape({
        type: Yup.string().required('Type is required'),
        tests: Yup.array().of(Yup.lazy(() => conditionValidationSchema)),
      });
    default:
      return Yup.object();
  }
});

const getDefaultGroundDistanceRule = () => ({
  type: 'rolling_deviation',
  control_window: {
    column: 'ground_distance',
    timeframe: ONE_DAY,
  },
  test_window: {
    column: 'ground_distance',
    timeframe: ONE_HOUR,
  },
  threshold: 0,
});

const RuleNode = ({ formik, node, path, replace, remove }) => {
  //
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField
          size="small"
          select
          fullWidth
          label="Rule"
          {...formik.getFieldProps(`${path}.type`)}
          onChange={(event) => {
            if (event.target.value === 'rolling_deviation') {
              replace(getDefaultGroundDistanceRule());
              return;
            }
          }}
        >
          <MenuItem value="rolling_deviation">Rolling Deviation</MenuItem>
        </TextField>
        <Button color="error" variant="contained" onClick={() => remove()}>
          Remove
        </Button>
      </Stack>
      {node?.type === 'rolling_deviation' && (
        <>
          <Typography variant="h6">Control Window</Typography>
          <TextField
            size="small"
            fullWidth
            select
            label="Column"
            {...formik.getFieldProps(`${path}.control_window.column`)}
          >
            {sensorReadingColumns.map((column) => (
              <MenuItem key={column.label} value={column.value}>
                {column.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            fullWidth
            select
            label="Timeframe"
            {...formik.getFieldProps(`${path}.control_window.timeframe`)}
          >
            {timeIntervals.map((interval) => (
              <MenuItem key={interval.label} value={interval.value}>
                {interval.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="h6">Test Window</Typography>
          <TextField
            size="small"
            fullWidth
            select
            label="Column"
            {...formik.getFieldProps(`${path}.test_window.column`)}
          >
            {sensorReadingColumns.map((column) => (
              <MenuItem key={column.label} value={column.value}>
                {column.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            fullWidth
            select
            label="Timeframe"
            {...formik.getFieldProps(`${path}.test_window.timeframe`)}
          >
            {timeIntervals.map((interval) => (
              <MenuItem key={interval.label} value={interval.value}>
                {interval.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="number"
            fullWidth
            label="Threshold"
            {...getFieldPropsWithHelpText(formik, `${path}.threshold`)}
          />
        </>
      )}
    </Stack>
  );
};

RuleNode.propTypes = {
  formik: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  replace: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

const AstNode = ({ formik, node, path, arrayTools, root = false }) => {
  const nodeIndex = path.split('.').pop();
  return (
    <FormGroup
      sx={{
        borderLeft: (theme) => `2px dashed ${theme.palette.divider}`,
        borderBottom: (theme) => `2px dashed ${theme.palette.divider}`,
        borderBottomLeftRadius: (theme) => theme.spacing(2),
        pb: 3,
        pl: 6,
      }}
    >
      <Stack spacing={2}>
        {node.type !== 'rule' && (
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              label="Node Type"
              select
              {...formik.getFieldProps(`${path}.type`)}
            >
              <MenuItem value="and">And</MenuItem>
              <MenuItem value="or">Or</MenuItem>
            </TextField>
            {!root && (
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  arrayTools.remove(nodeIndex);
                }}
              >
                Remove
              </Button>
            )}
          </Stack>
        )}
        {node.type === 'rule' ? (
          <RuleNode
            formik={formik}
            node={node.rule}
            path={`${path}.rule`}
            replace={(o) => {
              console.log('replace', nodeIndex, o);
              arrayTools.replace(nodeIndex, {
                type: 'rule',
                rule: o,
              });
            }}
            remove={() => {
              console.log('remove', nodeIndex);
              arrayTools.remove(nodeIndex);
            }}
          />
        ) : (
          <FieldArray name={`${path}.tests`}>
            {(arrayTools) => (
              <Stack spacing={1}>
                {node.tests.map((test, index) => (
                  <Fragment key={index}>
                    {index !== 0 && (
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        {node.type === 'and' ? 'And' : 'Or'}
                      </Typography>
                    )}
                    <AstNode
                      formik={formik}
                      node={test}
                      path={`${path}.tests.${index}`}
                      arrayTools={arrayTools}
                    />
                  </Fragment>
                ))}
                <Stack direction="row" spacing={2}>
                  <Button
                    onClick={() => {
                      arrayTools.push({ type: 'rule', rule: getDefaultGroundDistanceRule() });
                    }}
                  >
                    {`${node.type === 'and' ? 'And Rule' : 'Or Rule'}`}
                  </Button>
                  <Button
                    onClick={() => {
                      arrayTools.push({ type: 'and', tests: [] });
                    }}
                  >
                    Nest And
                  </Button>
                  <Button
                    onClick={() => {
                      arrayTools.push({ type: 'or', tests: [] });
                    }}
                  >
                    Nest Or
                  </Button>
                </Stack>
              </Stack>
            )}
          </FieldArray>
        )}
      </Stack>
    </FormGroup>
  );
};

AstNode.propTypes = {
  formik: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  arrayTools: PropTypes.object.isRequired,
  root: PropTypes.bool,
};

const NestedForm = () => {
  const handleSubmit = (values, { resetForm }) => {
    console.log(values);
    resetForm();
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('A name is required'),
      conditions: conditionValidationSchema,
      subscribers: Yup.array().of(
        Yup.object()
          .shape({
            type: Yup.string().oneOf(['email', 'webhook']).required('Type is required'),
          })
          .when(([values], schema) => {
            if (values.type === 'email') {
              return schema.shape({
                value: Yup.string().email('Invalid email').required('Email is required'),
              });
            }

            if (values.type === 'webhook') {
              return schema.shape({
                interactionRequired: Yup.boolean().required('Interaction Required is required'),
                value: Yup.string()
                  .required('URL is required')
                  .matches(/^https?:\/\/.+/, 'Invalid URL'),
              });
            }

            return schema;
          })
      ),
    }),
    onSubmit: handleSubmit,
  });

  console.log(formik);
  return (
    <FormikProvider value={formik}>
      <Form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              label="Name"
              {...getFieldPropsWithHelpText(formik, 'name')}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
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
          <Grid item xs={12} sm={4}>
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
                        <FormControl sx={{ width: '100%' }}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            size="small"
                            label="Type"
                            value={subscriber.type}
                            onChange={(e) => {
                              arrayHelpers.replace(
                                index,
                                e.target.value === 'email'
                                  ? { type: 'email', value: '' }
                                  : { type: 'webhook', value: '', interactionRequired: false }
                              );
                            }}
                            {...getFieldPropsWithHelpText(formik, `subscribers.${index}.type`)}
                          >
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="webhook">Webhook</MenuItem>
                          </Select>
                        </FormControl>
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
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formik.dirty || !formik.isValid}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
};

export default NestedForm;
