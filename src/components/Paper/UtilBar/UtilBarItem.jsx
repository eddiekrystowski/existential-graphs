import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const UtilBarItem = (props) => {
    return (
        <div class="util-bar-item-root">
            <FontAwesomeIcon icon={props.icon} className="util-bar-item-icon" onClick={props.handleChangeActive} />
            <div class={`util-bar-active-menu ${props.active === false ? 'visually-hidden' : ''}`}>
                {props.children}
            </div>
        </div>
    );
};

export default UtilBarItem;