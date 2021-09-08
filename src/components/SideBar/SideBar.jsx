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
            }
        }
    }
    render() {
        return (
            <div className="menu-bar">
                <div id="side-wrapper">
                    <h2>{this.props.mode} mode</h2>
                    <Button text="Switch Mode" onClick={this.props.onStateSwitch}></Button>
                    <ButtonGroup buttons={this.state.buttons[this.props.mode]} mode={this.props.mode}/>
                </div>
            </div>
        ); 
    }
}

