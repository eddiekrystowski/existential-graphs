import React from 'react';
import { act } from 'react-dom/test-utils';
import Paper from '../Paper/Paper';
import SideBar from '../SideBar/SideBar';
import Modal from '../Modal/Modal.jsx';

import './Workspace.css'

const LOAD_MODAL = new Event('load-modal');

export default class Workspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'create',
            action: null,
            showModal: false
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

    //TODO: MOVE MODAL TO WORKSPACE
    handleModalExit = () => {
        this.setState({
            showModal: false
        });
    }

    handleOpenModal = () => {
        this.setState({
            showModal: true
        })
        window.dispatchEvent(LOAD_MODAL);
    }

    handleModalInsert = () => {
        console.log('inserting...');
        this.handleModalExit();
    }

    render() {

        const buttons = [
            {
                name: 'insert',
                text: 'Insert',
                onClick: this.handleModalInsert
            },
            {
                name: 'cancel',
                text: 'X',
                onClick: this.handleModalExit
            },
        ]

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
                    handleOpenModal={this.handleOpenModal}
                >

                </Paper>
                <Modal show={this.state.showModal} buttons={buttons}>
                    <Paper 
                        id={this.props.paper_id + '-modal-paper'} 
                        mode={'create'} 
                        action={null}
                        handleClearAction={null}
                        handleOpenModal={null}
                        wrapperWidth='100%'
                        wrapperHeight='72vh'
                        isModalPaper={true}
                    >
                    </Paper>
                </Modal>
            </div>
        );
    }
}