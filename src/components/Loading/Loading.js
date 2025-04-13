import React from 'react';
import { Spin } from 'antd';
import './Loading.css';

const content = <p className="content" />;
const Loading = () => (
  <div className="spin">
    <Spin tip="Loading..." size="large">
      {content}
    </Spin>
  </div>
);

export default Loading;
