import React from "react";
import _ from 'lodash';

import './UtilBar.css';

export default class UtilBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: -1
        }
    }

    handleChangeActive = (num) => {
        this.setState({
            active: num === this.state.active ? -1 : num
        });
    }

    render() {
        return (
            <div class="util-bar-root">
                { 
                    //loop through children and pass active prop to child whose index corresponds to
                    //this.state.active
                    // Ex. if History is the first child (index 0), then when this.state.active === 0 
                    //then History will be passed active=true  as a prop
                    React.Children.map(this.props.children, (child, num) => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, {
                                active: this.state.active === num,
                                handleChangeActive: this.handleChangeActive.bind(this, num)
                            });
                        }
                        return child;
                    })
                }
            </div>
        );
    }
}