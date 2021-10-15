import React from 'react';
import { act } from 'react-dom/test-utils';
import Paper from '../Paper/Paper';
import SideBar from '../SideBar/SideBar';
import Modal from '../Modal/Modal.jsx';
import _ from 'lodash';

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
        this.insertPosition = { x: 0, y: 0 };
        this.modalPaper = React.createRef();
        this.mainPaper = React.createRef();
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

    handleOpenModal = (mousePosition) => {
        this.setState({
            showModal: true
        })
        this.insertPosition = Object.assign({}, mousePosition);
    }

    handleModalInsert = (position) => {
        console.log('inserting...');
        //console.log(_.cloneDeep(this.modalPaper));
        this.mainPaper.current.copyFrom(this.modalPaper.current);
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
                    handlePlayAudio={this.props.handlePlayAudio}
                    ref={this.mainPaper}
                >

                </Paper>
                <Modal show={this.state.showModal} buttons={buttons}>
                    <Paper 
                        id={this.props.paper_id + '-modal-paper'} 
                        mode={'create'} 
                        action={null}
                        handleClearAction={null}
                        handleOpenModal={null}
                        handlePlayAudio={this.props.handlePlayAudio}
                        wrapperWidth='100%'
                        wrapperHeight='72vh'
                        isModalPaper={true}
                        ref={this.modalPaper}
                    >
                    </Paper>
                </Modal>
            </div>
        );
    }
}