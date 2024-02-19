import * as Yup from 'yup';

export const ruleValidationSchema = Yup.object().shape({
  type: Yup.string().required('Rule type is required'),
  controlWindow: Yup.object().shape({
    column: Yup.string().required('Control window column is required'),
    timeframe: Yup.number().required('Control window timeframe is required'),
  }),
  testWindow: Yup.object().shape({
    column: Yup.string().required('Test window column is required'),
    timeframe: Yup.number().required('Test window timeframe is required'),
  }),
  threshold: Yup.number()
    .required('Threshold is required')
    .min(0.01, 'Threshold must be between 0.01 and 1')
    .max(1, 'Threshold must be between 0.01 and 1'),
});

export const conditionValidationSchema = Yup.lazy((value) => {
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

export const validationSchema = Yup.object().shape({
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
});
