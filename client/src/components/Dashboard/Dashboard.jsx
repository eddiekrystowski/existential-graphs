import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../Navbar/Navbar.css'
import './Dashboard.css'

export default class Dashboard extends Component {

  render() {
    return (
        <div id="dashboard-root">
          <div id="dashboard-body">
            <div id="dashboard-left-bar">
              <Link to="graphs" className="nav-link dashboard-left-item">Graphs</Link>
              <Link to="graphs" className="nav-link dashboard-left-item">Lemmas</Link>
            </div>
            <div id="dashboard-main">
              {/* <table id="doc-data-table">
                <thead>
                  <tr className='doc-data-row'>
                    <th className='doc-data-header'>Name</th>
                    <th>Last Modified</th>
                  </tr>
                </thead>
                
                <tbody>
                  <tr>
                    <td>Test</td>
                    <td>Test</td>
                  </tr>
                </tbody>

              </table> */}
              <div id="doc-data-table">
                <div id="doc-data-table-header">
                  <span>Name</span>
                  <span>Last Modified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}