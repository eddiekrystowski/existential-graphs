import React from 'react';
import Paper from '../Paper/Paper';
import SideBar from '../SideBar/SideBar';

import './Workspace.css'

export default class Workspace extends React.Component {
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
        window.mode = this.state.mode === 'create' ? 'proof' : 'create';
    }

    render() {
        return (
            <div class="workspace">
                <SideBar  mode={this.state.mode} onStateSwitch={() => { this.handleStateSwitch(); }}></SideBar>
                <Paper id={this.props.paper_id}></Paper>
            </div>
        );
    }
}