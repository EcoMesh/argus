import { getIn } from 'formik';

export const getFieldPropsWithHelpText = (formik, name) => ({
  ...formik.getFieldProps(name),
  error: getIn(formik.touched, name) && Boolean(getIn(formik.errors, name)),
  helperText: getIn(formik.touched, name) && getIn(formik.errors, name),
});
