import React from 'react';
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons'

import './Button.css';

export default class Button extends React.Component {

    
    render() {
        return (
            <button className={'button ' + (this.props.active ? 'button-active' : '')} onClick={this.props.onClick}>
                <div className='tooltip-text'>{this.props.tooltip_text}</div>
                <FontAwesomeIcon icon={this.props.icon} className='button-icon'/>
                <p>{this.props.text}</p>
            </button>
        );
    }
}

Button.propTypes = {
    /** Text to be displayed for a button */
    text : PropTypes.string,
    /** Function to be exicuted when the button is pressed */
    onClick : PropTypes.func,
    /** Icon title on FontAwesome */
    icon : PropTypes.string,
    /** Tooltip text */
    tooltip_text : PropTypes.string,
}

Button.defaultProps = {
    text: 'Button',
    onClick: console.log('Button Clicked! Please define a on click function.'),
    icon : faCoffee,
    tooltip_text : 'Tooltip!',
}