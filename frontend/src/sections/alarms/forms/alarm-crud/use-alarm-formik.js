import { useFormik } from 'formik';

import { initialValues } from './constants';
import { validationSchema } from './schema';

const useAlarmFormik = (options) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    ...options,
  });

  return formik;
};

export default useAlarmFormik;
