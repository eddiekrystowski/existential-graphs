import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'

export default class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">EG</Link>
        <div className="navbar-left">
              <Link to="/create" className="nav-link">Create</Link>
              <Link to="/create" className="nav-link">Proof</Link>
        </div>
      </nav>
    );
  }
}