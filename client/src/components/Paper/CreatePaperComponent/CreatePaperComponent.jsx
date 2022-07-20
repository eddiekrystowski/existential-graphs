import React from 'react';
import { useState, useEffect } from 'react';
import  CreatePaper  from '@components/Paper/scripts/CreatePaper';
import '@components/Paper/scripts/Paper.css'

export default function CreatePaperComponent(props) {

    const [paper, setPaper] = useState(null);
    
    function handleKeyDown(event)   { paper.onKeyDown(event); }
    function handleKeyUp(event)     { paper.onKeyUp(event); }
    function handleMouseDown(event) { paper.onMouseDown(event); }
    function handleMouseUp(event)   { paper.onMouseUp(event); }
    function handleMouseMove(event) { paper.onMouseMove(event); }

    //initial mount & whenever props.graph_id is changed
    useEffect(() => {
        setPaper(new CreatePaper(props.dom_id, props.graph_id));
    }, [props.dom_id, props.graph_id]);

    const styles = {
        width: props.wrapperWidth || '100%',
        height: props.wrapperHeight || '100%'
    }

    return(
        <div className="paper-root">
            <div className="paper-wrapper" style={styles}>
                <div 
                    id={props.dom_id}
                    className="joint-paper"
                    onClick={(event) => console.log('click')}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    // onMouseEnter={this.onMouseEnter}
                    tabIndex="0"
                ></div>
            </div>
        </div>
    );
}