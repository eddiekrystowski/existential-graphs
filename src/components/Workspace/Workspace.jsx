import React from 'react';
import { act } from 'react-dom/test-utils';
import Paper from '../Paper/Paper';
import SideBar from '../SideBar/SideBar';

import './Workspace.css'

export default class Workspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'create',
            action: null
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

    handleActionChange(action) {
        this.setState({
            action: action
        });
    }

    handleClearAction(){
        this.handleActionChange(null);
    }

    render() {
        return (
            <div class="workspace">
                <SideBar  
                    mode={this.state.mode} 
                    onStateSwitch={this.handleStateSwitch.bind(this)} 
                    handleActionChange={this.handleActionChange.bind(this)}
                >
                </SideBar>
                <Paper 
                    id={this.props.paper_id} 
                    mode={this.state.mode} 
                    action={this.state.action}
                    handleClearAction={this.handleClearAction.bind(this)}
                >

                </Paper>
            </div>
        );
    }
}