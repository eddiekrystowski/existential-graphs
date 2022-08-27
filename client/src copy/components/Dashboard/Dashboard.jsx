import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../Navbar/Navbar.css'
import './Dashboard.css'

export default class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      localGraphData: JSON.parse(localStorage.getItem('graphs'))
    }
  }

  render() {

    let graphs = []
    for (let graph in this.state.localGraphData) {
      const date = new Date(this.state.localGraphData[graph].lastModified);
      const now = new Date();
      let dateString = "";


      if (date.getDay() === now.getDay()) {
        dateString = date.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
      }
      else {
        const month = date.toLocaleString('default', {month: 'short'} );
        const day = date.toLocaleString('default', {day: 'numeric'} );
        dateString = `${month} ${day}, ${date.getFullYear()}`;
      }
      /* TODO: NEED to make this into react component!! Waiting for refactor pr after this one*/
      graphs.push(
        <Link to={{ pathname: `/create?graph=${graph}` }} key={graph} className='graph-table-item'>
          <span className='graph-table-field'>{graph}</span>
          <span className='graph-table-field'>{dateString}</span>
        </Link>
      )
    }

    /* TODO: use react components! waitinf for refactor pr after this one */
    return (
        <div id="dashboard-root">
          <div id="dashboard-body">
            <div id="dashboard-left-bar">
              <Link to="graphs" className="nav-link dashboard-left-item">Graphs</Link>
              <Link to="graphs" className="nav-link dashboard-left-item">Lemmas</Link>
            </div>
            <div id="dashboard-main">
              <div id="graph-table">
                <div id="graph-table-header">
                  <span>Name</span>
                  <span>Last Modified</span>
                </div>
                <div id="graph-table-body">
                  {graphs}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}