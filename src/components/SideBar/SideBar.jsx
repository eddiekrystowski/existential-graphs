import React from 'react';

import ButtonGroup from '../ButtonGroup/ButtonGroup';
import Button from '../Button/Button';

import './SideBar.css';

export default class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttons: {
                create: [
                    {
                        text: 'Add Premise',
                        onClick: function() {
                            console.log('Adding premise...')
                        }
                    },
                    {
                        text: 'Cut',
                        onClick: function() {
                            console.log('Cutting...');
                        }
                    }
                ],
                proof: [
                    {
                        text: 'Insertion',
                        onClick: function() {
                            console.log('Performing insertion...');
                        }
                    },
                    {
                        text: 'Erasure',
                        onClick: function() {
                            console.log('Performing erasure...');
                        }
                    },
                    {
                        text: 'Insert Double Cut',
                        onClick: function() {
                            console.log('Inserting double cut...');
                        }
                    },
                    {
                        text: 'Delete Double Cut',
                        onClick: function() {
                            console.log('Deleting double cut...');
                        }
                    },
                    {
                        text: 'Iteration',
                        onClick: function() {
                            console.log('Performing iteration...');
                        }
                    },
                    {
                        text: 'Deiteration',
                        onClick: function() {
                            console.log('Performing deiteration...');
                        }
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
                    <h2 >{this.props.mode.charAt(0).toUpperCase() + this.props.mode.slice(1)} Mode</h2>
                    <Button text="Switch Mode" onClick={this.props.onStateSwitch}></Button>
                    <ButtonGroup buttons={this.state.buttons[this.props.mode]} mode={this.props.mode}/>
                </div>
            </div>
        ); 
    }
}

