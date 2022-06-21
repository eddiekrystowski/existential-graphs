import React from 'react';
import Paper from '../Paper/Paper';
import SideBar from '../SideBar/SideBar';
import Modal from '../Modal/Modal.jsx';

import { getCellsBoundingBox } from '../../util/collisions'

import './Workspace.css'

new Event('load-modal');

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
        this.proofPaper = React.createRef();
        this.history = [];
    }

    componentDidMount() {
        this.proofPaper.current.hide();
        this.proofPaper.current.history.current.clear();
    }

    componentDidUpdate(prevProps, prevState) {

        // //if state.mode changed
         if (prevState.mode !== this.state.mode) {
            //switch to proof mode
            if (this.state.mode === 'proof') {
                this.mainPaper.current.hide();
                this.proofPaper.current.sheet.graph.clear();
                const copy = this.mainPaper.current.sheet.exportAsJSON();
                this.proofPaper.current.sheet.importFromJSON(copy);
                this.proofPaper.current.show();
            }
            //switch to create mode
            else {
                this.mainPaper.current.show();
                this.proofPaper.current.hide();
                this.proofPaper.current.history.current.clear();
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

    handleOpenModal = (mousePosition, model=null) => {
        this.setState({
            showModal: true
        })
        this.insertPosition = Object.assign({}, mousePosition);
        this.insertModel = model
        console.log("model: ",model)
        console.log("this.insertModel: ", this.insertModel)
    }

    handleModalInsert = (position) => {
        console.log('inserting...', this.insertModel);
        if (this.insertModel === null) alert(1)//this.proofPaper.current.sheet.importFromJSON(this.modalPaper.current.sheet.exportAsJSON());
        if (this.modalPaper.current.sheet.graph.getCells().length === 0) this.handleModalExit(); // no cells to import
        else {
            console.log(":0")
            const cells = JSON.parse(this.modalPaper.current.sheet.exportAsJSON());
            const cellsbbox = getCellsBoundingBox(this.modalPaper.current.sheet.graph.getCells())
            console.log(cells)
            this.proofPaper.current.forceParseCells(cells, cellsbbox, this.insertModel)
        }
        this.handleModalExit();
    }

    handleSaveLocally = () => {
        const graphJSON = this.mainPaper.current.export();

        let localGraphs = JSON.parse(localStorage.getItem("graphs"));
        if (localGraphs === null) localGraphs = {};

        let i = 0;
        while (localGraphs.hasOwnProperty(`Graph${i}`)) { i++}
        const graphName = `Graph${i}`;
        localGraphs[graphName] = {
            graphJSON: graphJSON,
            lastModified: new Date()
        }

        localStorage.setItem('graphs', JSON.stringify(localGraphs));
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
            <div className="workspace">
                <SideBar  
                    mode={this.state.mode} 
                    onStateSwitch={this.handleStateSwitch.bind(this)} 
                    handleActionChange={this.handleActionChange.bind(this)}
                    handleSaveLocally={this.handleSaveLocally}
                    action={this.state.action}
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