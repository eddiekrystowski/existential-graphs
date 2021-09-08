import React from 'react';

import './Button.css';

export default class Button extends React.Component {
    render() {
        return (
            <button className='button-group-button' onClick={this.props.onClick}>{this.props.text}</button>
        );
    }
}