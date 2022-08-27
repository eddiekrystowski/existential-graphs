import React from 'react';

import ButtonGroup from '../ButtonGroup/ButtonGroup';
import Button from '../Button/Button';

import './SideBar.css';
import { deiteration, deleteDoubleCut, inferenceErasure, inferenceInsertion, insertDoubleCut, iteration } from '../../util/proof-util';

//  Import all of the FontAwesome icons
import { faExchangeAlt, faPlus, faMinus, faVectorSquare, faClone, faMinusSquare, faPlusSquare, faEraser, faSave} from '@fortawesome/free-solid-svg-icons'

export default class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttons: {
                create: [
                    {
<<<<<<< HEAD:client/src copy/components/SideBar/SideBar.jsx
                        text: 'Add Atomic',
=======
                        text: 'Add Atomic Claim',
>>>>>>> master:src/components/SideBar/SideBar.jsx
                        action: deiteration,
                        onClick: () => {
                            console.log('Adding premise...')
                        },
                        icon : faPlus,
                        tooltip_text : 'Add an atomic claim by hovering over the sheet and pressing a letter on your keyboard.'
                    },
                    {
                        text: 'Cut',
                        action: deiteration,
                        onClick: () => {
                            console.log('Cutting...');
                        },
                        icon : faVectorSquare,
                        tooltip_text : 'Add a cut by clicking and dragging on the sheet of assertion.'
                    }
                ],
                proof: [
                    {
                        text: 'Insertion',
                        action: inferenceInsertion,
                        onClick: () => {
                            this.props.handleActionChange(inferenceInsertion);
                            console.log('Loading insertion into action...');
                        },
                        icon : faPlus,
                        tooltip_text : 'Insert a graph by clicking on any odd level.'
                    },
                    {
                        text: 'Erasure',
                        action: inferenceErasure,
                        onClick: () => {
                            this.props.handleActionChange(inferenceErasure);
                            console.log('Performing erasure...');
                        },
                        icon : faMinus,
                        tooltip_text : 'Remove a graph by clicking on anything on an even level.'
                    },
                    {
                        text: 'Insert Double Cut',
                        action: insertDoubleCut,
                        onClick: () => {
                            this.props.handleActionChange(insertDoubleCut);
                            console.log('Inserting double cut...');
                        },
                        icon : faPlusSquare,
                        tooltip_text : 'Add a double cut by clicking on the subgraph you want to encapsulate.'
                    },
                    {
                        text: 'Delete Double Cut',
                        action: deleteDoubleCut,
                        onClick: () => {
                            this.props.handleActionChange(deleteDoubleCut);
                            console.log('Deleting double cut...');
                        },
                        icon : faMinusSquare,
                        tooltip_text : 'Remove a double cut by clicking on the outer-most cut of the double cut.'
                    },
                    {
                        text: 'Iteration',
                        action: iteration,
                        onClick: () => {
                            this.props.handleActionChange(iteration);
                            console.log('Performing iteration...');
                        },
                        icon : faClone,
                        tooltip_text : 'Clone any atomic claim an even number of layers layers deeper by first clicking on the atomic claim and then the desired location.'
                    },
                    {
                        text: 'Deiteration',
                        action: deiteration,
                        onClick: () => {
                            this.props.handleActionChange(deiteration);
                            console.log('Performing deiteration...');
                        },
                        icon : faEraser,
                        tooltip_text : 'Remove any atomic claim an even number of layers deeper by clicking on the atomic claim you wish to remove.'
                    }
                ],
                both: [
                    {
                        text: 'Save Locally',
                        action: () => null,
                        onClick: this.props.handleSaveLocally,
                        icon: faSave,
                        tooltip_text: 'Save this graph locally.'

                    }
                ]
            },
            color : {
                text : {
                    create : "#E0FBFC",
                    proof : "#293241"
                },
                background : {
                    create : "#3D5A80",
                    proof : "#98C1D9"
                }
            }
        }
    }
    render() {
        return (
            <div className="menu-bar" style={{backgroundColor: this.state.color.background[this.props.mode] , color: this.state.color.text[this.props.mode]}}>
                <div id="side-wrapper" >
                    <div id="mode-header">
                        <p className=' text-5xl'>among us</p>
                        <h2>{this.props.mode.charAt(0).toUpperCase() + this.props.mode.slice(1)} Mode</h2>
                        <Button text="Switch Mode" onClick={this.props.onStateSwitch} icon={faExchangeAlt} tooltip_text={'Toggles to ' + (this.props.mode === 'proof' ? 'create' : 'proof') + ' mode'} ></Button>
                    </div>

                    <ButtonGroup buttons={this.state.buttons[this.props.mode]} mode={this.props.mode} action={this.props.action}/>
                    <ButtonGroup buttons={this.state.buttons.both}/>
                </div>
            </div>
        ); 
    }
}

