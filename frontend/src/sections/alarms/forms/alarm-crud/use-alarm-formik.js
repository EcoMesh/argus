import { useFormik } from 'formik';

import { validationSchema } from './schema';
import { initialValues as defaultInitialValues } from './constants';

const useAlarmFormik = ({ initialValues = defaultInitialValues, ...options }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    ...options,
  });

  return formik;
};

export default useAlarmFormik;
