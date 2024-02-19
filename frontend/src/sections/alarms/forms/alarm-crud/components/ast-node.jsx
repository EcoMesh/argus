import React, { Fragment } from 'react';
import { Formik, Form } from 'formik';
import {
  Grid,
  Modal,
  FormGroup,
  TextField,
  Typography,
  Box,
  Switch,
  Stack,
  Button,
  MenuItem,
} from '@mui/material';

import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { useFormik, FieldArray, FormikProvider, getIn } from 'formik';
import { alpha } from '@mui/material/styles';

import RuleNode from './rule-node';
import { getDefaultGroundDistanceRule } from '../constants';

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
              arrayTools.replace(nodeIndex, {
                type: 'rule',
                rule: o,
              });
            }}
            remove={() => {
              arrayTools.remove(nodeIndex);
            }}
          />
        ) : (
          <FieldArray name={`${path}.tests`}>
            {(childrenArrayTools) => (
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
                      arrayTools={childrenArrayTools}
                    />
                  </Fragment>
                ))}
                <Stack direction="row" spacing={2}>
                  <Button
                    onClick={() => {
                      childrenArrayTools.push({
                        type: 'rule',
                        rule: getDefaultGroundDistanceRule(),
                      });
                    }}
                  >
                    {`${node.type === 'and' ? 'And Rule' : 'Or Rule'}`}
                  </Button>
                  <Button
                    onClick={() => {
                      childrenArrayTools.push({ type: 'and', tests: [] });
                    }}
                  >
                    Nest And
                  </Button>
                  <Button
                    onClick={() => {
                      childrenArrayTools.push({ type: 'or', tests: [] });
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

export default AstNode;
