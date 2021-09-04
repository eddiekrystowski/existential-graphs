import React from 'react';

import './index.css'; 
import SideBar from './SideBar';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'create'
        }
    }

    handleStateSwitch() {
        console.log('Switching state...');
        console.log(this.state);
        this.setState({
            mode: this.state.mode === 'create' ? 'proof' : 'create'
        });
    }

    render() {
        return (
            <div className="app">
                <SideBar mode={this.state.mode} onStateSwitch={() => { this.handleStateSwitch(); }}></SideBar>
                <div id="paper-container"></div>
            </div>
        );
    }
}