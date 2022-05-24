import React from 'react';

import Button from '../Button/Button';

import './ButtonGroup.css';

export default class ButtonGroup extends React.Component {
    render() {
        return (
            <div className="button-group">
                {this.props.buttons.map(button => <Button key={button.text} active={this.props.action === button.action} text={button.text} onClick={button.onClick} icon={button.icon} tooltip_text={button.tooltip_text}/>)}
            </div>
        );
    }
}