import React, { Component } from 'react';
import { Tabs } from 'antd';
import './Tab.css';
import PropTypes from 'prop-types';


export default class Tab extends Component {
  render() {
    const items = [
      {
        key: 'search',
        label: 'Search',
      },
      {
        key: 'rated',
        label: 'Rated',
      },
    ];

    return (
      <Tabs
        defaultActiveKey="search"
        items={items}
        onChange={this.props.onTabChange}
        className="tabs"
      />
    );
  }
}

Tab.propTypes = {
  onTabChange: PropTypes.func.isRequired,
};