import React from 'react';
import MenuBar from './MenuBar';

import './index.css'; 

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
                <MenuBar mode={this.state.mode} onStateSwitch={() => { this.handleStateSwitch(); }}></MenuBar>
                <div id="paper-container"></div>
            </div>
        );
    }
}