import React from 'react';
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons'

import './Button.css';
import '../../index.css';

export default function Button(props) {

    
    return (
        <button className={'button ' + (props.active ? 'button-active' : '')} onClick={props.onClick}>
            <div className='tooltip-text'>{props.tooltip_text}</div>
            <FontAwesomeIcon icon={props.icon} className='button-icon'/>
            <p>{props.text}</p>
        </button>
    );
}

Button.propTypes = {
    /** Text to be displayed for a button */
    text : PropTypes.string,
    /** Function to be exicuted when the button is pressed */
    onClick : PropTypes.func,
    /** Icon title on FontAwesome */
    icon : PropTypes.object,
    /** Tooltip text */
    tooltip_text : PropTypes.string,
}

Button.defaultProps = {
    text: 'Button',
    onClick: console.log('Button Clicked! Please define a on click function.'),
    icon : faCoffee,
    tooltip_text : 'Tooltip!',
}