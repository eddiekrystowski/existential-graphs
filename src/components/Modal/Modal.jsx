import React from 'react';

import './Modal.css'

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.show) {
            console.log('early');
            return null;
        }
        console.log('rendering...');
        return (
            <div class='modal-bg'>
                <div class='modal-body'>
                    <div class="modal-top-bar">
                        <button class="modal-item modal-item-cancel" onClick={this.props.onClose}>X</button>
                    </div>
                    <div class="modal-content">
                        { this.props.children }
                    </div>
                </div>
            </div>
        );
    }
}   