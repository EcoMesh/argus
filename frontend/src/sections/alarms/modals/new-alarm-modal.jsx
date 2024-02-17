import * as Yup from 'yup';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { useFormik, FieldArray, FormikProvider } from 'formik';
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
import NestedForm from './NestedForm';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 1200,
  maxHeight: 800,
  width: '100%',
  height: '100%',
  bgcolor: 'background.paper',
  p: 4,
};

// const conditionValidationSchema = Yup.object().shape({
//   type: Yup.string().required('Type is required'),
//   rule: Yup.mixed().when('type', {
//     is: 'rule',
//     then: Yup.object({
//       type: Yup.string().required('Rule type is required'),
//       resolution: Yup.number().required('Resolution is required'),
//       control_window: Yup.object().shape({
//         column: Yup.string().required('Control window column is required'),
//         timeframe: Yup.number().required('Control window timeframe is required'),
//       }),
//       test_window: Yup.object().shape({
//         column: Yup.string().required('Test window column is required'),
//         timeframe: Yup.number().required('Test window timeframe is required'),
//       }),
//       threshold: Yup.number().required('Threshold is required'),
//     }),
//   }),
//   tests: Yup.array().of(
//     Yup.lazy(value => {
//       switch (value.type) {
//         case 'rule':
//           return Yup.reach(validationSchema, 'rule');
//         case 'and':
//         case 'or':
//           return Yup.reach(validationSchema, 'tests');
//         default:
//           return Yup.object();
//       }
//     })
//   ),
// });

// // Export the validation schema

const validationSchema = Yup.object().shape({
  name: Yup.string().required('A name is required'),
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
});

export default function NewAlarmModal({ open, handleClose }) {
  const formik = useFormik({
    initialValues: {
      name: '',
      subscribers: [
        {
          type: 'email',
          value: '',
        },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('submit', values);
      innerHandleClose(null);
    },
  });

  const region = useRecoilValue(selectedRegionAtom);
  const innerHandleClose = (e) => {
    formik.resetForm();
    handleClose(e);
  };

  console.log(formik);

  return (
    <div>
      <Modal
        open={open}
        onClose={innerHandleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <NestedForm />
        <FormikProvider value={formik}>
          <Stack spacing={3} sx={style}>
            <Typography id="modal-modal-title" variant="h5" component="h2">
              New Alarm
            </Typography>
            <FormGroup>
              <Stack spacing={2}>
                <FormControl>
                  <Typography id="modal-modal-title" variant="h6" component="h3">
                    Region
                  </Typography>
                  <Typography id="modal-modal-title" variant="p">
                    {region.name}
                  </Typography>
                </FormControl>
              </Stack>
            </FormGroup>
            <FormGroup>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  {...formik.getFieldProps('name')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
                <FormControl>
                  <Typography id="modal-modal-title" variant="h6" component="h3" sx={{ mb: 3 }}>
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
                                {...formik.getFieldProps(`subscribers.${index}.type`)}
                                onChange={(e) => {
                                  arrayHelpers.replace(
                                    index,
                                    e.target.value === 'email'
                                      ? { type: 'email', value: '' }
                                      : { type: 'webhook', value: '', interactionRequired: false }
                                  );
                                }}
                                error={
                                  formik.touched.subscribers?.[index]?.type &&
                                  Boolean(formik.errors.subscribers?.[index]?.type)
                                }
                                helperText={
                                  formik.touched.subscribers?.[index]?.type &&
                                  formik.errors.subscribers?.[index]?.type
                                }
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
                              {...formik.getFieldProps(`subscribers.${index}.value`)}
                              error={
                                formik.touched.subscribers?.[index]?.value &&
                                Boolean(formik.errors.subscribers?.[index]?.value)
                              }
                              helperText={
                                formik.touched.subscribers?.[index]?.value &&
                                formik.errors.subscribers?.[index]?.value
                              }
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
                </FormControl>
              </Stack>
            </FormGroup>
            <Stack direction="row" justifyContent="space-between">
              <Button variant="contained" onClick={formik.handleSubmit} disabled={!formik.isValid}>
                Register
              </Button>
              <Button variant="contained" onClick={innerHandleClose} color="error">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </FormikProvider>
      </Modal>
    </div>
  );
}

NewAlarmModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
