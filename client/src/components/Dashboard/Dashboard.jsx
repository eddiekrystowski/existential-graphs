import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'

export default class Dashboard extends Component {

  render() {
    return (
        <div id="dashboard-root">
          <div id="dashboard-body">
            <div id="dashboard-left-bar">
              <Link to="graphs" className="dashboard-left-item">Graphs</Link>
            </div>
            <div id="dashboard-main"></div>
          </div>
        </div>
    );
  }
}