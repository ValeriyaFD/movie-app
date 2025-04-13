import React from 'react';
import { Alert } from 'antd';
const Error = () => (
  <>
   <Alert
      message="Error"
      description="Something went wrong. Please try again."
      type="error"
      showIcon
    />
  </>
);
export default Error;