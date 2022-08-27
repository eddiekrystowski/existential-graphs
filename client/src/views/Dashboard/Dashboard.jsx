import React, { Component } from 'react';
import { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { randomFromArray } from '@util';
import './Dashboard.css'

export default function Dashboard(props) {
  const [localGraphData, setLocalGraphData] = useState(JSON.parse(localStorage.getItem('graphs')));
  const navigate = useNavigate();

  let graphs = []
  for (let graph in localGraphData) {
    const date = new Date(localGraphData[graph].lastModified);
    const now = new Date();
    let dateString = "";

    const name = localGraphData[graph].name;


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
      <Link to={{ pathname: `/create/${graph}` }} key={graph} className='graph-table-item'>
        <span className='graph-table-field'>{name}</span>
        <span className='graph-table-field'>{dateString}</span>
      </Link>
    )
  }

  /* TODO: use react components! waitinf for refactor pr after this one */
  return (
      <div id="dashboard-root" className=' bg-white dark:bg-slate-700'>
        <div id="dashboard-body">
          <div id="dashboard-left-bar">
            <Link to="graphs" className="nav-link h-15 py-4 px-6 flex justify-center text-center bg-blue-500 w-4/5 rounded-lg text-white font-sans font-semibold text-2xl active:bg-blue-600 shadow-md shadow-slate-600 active:shadow-none transition">Graphs</Link>
            <br />
            <Link to="graphs" className="nav-link h-15 py-4 px-6 flex justify-center text-center bg-blue-500 w-4/5 rounded-lg text-white font-sans font-semibold text-2xl active:bg-blue-600 shadow-md shadow-slate-600 active:shadow-none transition">Lemmas</Link>
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