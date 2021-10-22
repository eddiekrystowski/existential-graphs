import React from 'react';
import { act } from 'react-dom/test-utils';
import Paper from '../Paper/Paper';
import SideBar from '../SideBar/SideBar';
import Modal from '../Modal/Modal.jsx';
import _ from 'lodash';

import './Workspace.css'
import E from '../../EventController';

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
        this.proofPaper= React.createRef();
        this.history = [];
    }

    componentDidMount() {
        this.proofPaper.current.hide();
    }

    componentDidUpdate(prevProps, prevState) {

        // //if state.mode changed
         if (prevState.mode !== this.state.mode) {
            //switch to proof mode
            if (this.state.mode === 'proof') {
                this.mainPaper.current.hide();
                this.proofPaper.current.sheet.graph.clear();
                this.proofPaper.current.sheet.importFromJSON(this.mainPaper.current.sheet.exportAsJSON());
                this.proofPaper.current.show();
            }
            //switch to create mode
            else {
                this.mainPaper.current.show();
                this.proofPaper.current.hide();
            }
        }
    }

    handleStateSwitch() {
        this.setState({
            mode: this.state.mode === 'create' ? 'proof' : 'create'
        });
    }

    handleActionChange = (action) => {
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
        this.proofPaper.current.sheet.importFromJSON(this.modalPaper.current.sheet.exportAsJSON());
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
                    handleActionChange={this.handleActionChange}
                    handleOpenModal={this.handleOpenModal}
                    handlePlayAudio={this.props.handlePlayAudio}
                    ref={this.mainPaper}
                >
                </Paper>

                <Paper 
                    id={this.props.paper_id + '-proof-paper'} 
                    mode={this.state.mode} 
                    action={this.state.action}
                    handleClearAction={this.handleClearAction.bind(this)}
                    handleActionChange={this.handleActionChange}
                    handleOpenModal={this.handleOpenModal}
                    handlePlayAudio={this.props.handlePlayAudio}
                    ref={this.proofPaper}
                >
                </Paper>


                <Modal show={this.state.showModal} buttons={buttons}>
                    <Paper 
                        id={this.props.paper_id + '-modal-paper'} 
                        mode={'create'} 
                        action={null}
                        handleClearAction={null}
                        handleActionChange={null}
                        handleOpenModal={null}
                        handlePlayAudio={this.props.handlePlayAudio}
                        wrapperWidth='100%'
                        wrapperHeight='72vh'
                        ref={this.modalPaper}
                    >
                    </Paper>
                </Modal>
            </div>
        );
    }
}