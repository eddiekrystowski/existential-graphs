import React from 'react';
import $ from 'jquery';
import * as joint from 'jointjs';

import Sheet from '../Sheet/Sheet';

/**
 * This class renders an individual JointJS paper inside a History component. 
 * The actual data that makes up the paper is entirely derived from the History it is part of.
 */
export default class HistoryItem extends React.Component {
    constructor(props) {
        super(props);

        // keeps track of joint paper object 
        this.jpaper = null;

        // Sheet component for managing graph
        this.sheet = new Sheet(this);
    }

    // if any of the properties of this component change, make sure cells are correct
    // (only need to do this if it is the last item in the history since we could be making a new branch)
    componentDidUpdate(prevProps, prevState) {
        if(this.props.num === this.props.total -1 ){
            this.sheet.importCells(this.props.cells);
            this.jpaper.scaleContentToFit();
        }
    }

    // initialize component
    componentDidMount() {
        this.jpaper = new joint.dia.Paper({
            el: document.getElementById(this.props.id),
            model: this.sheet.graph,
            width: 200,
            height: 200,
            preventContextMenu: false,
            clickThreshold: 1
        });

        this.sheet.importCells(this.props.cells);
        this.jpaper.scaleContentToFit();
        this.jpaper.updateViews();

        this.jpaper.setInteractivity(false);
        

        //add and remove highlight on hover
        $(`#${this.props.id}`).on('mouseover', function() {
            $(this).closest('.history-item').addClass('history-selected');
            
        });
        $(`#${this.props.id}`).on('mouseout', function() {
            $(this).closest('.history-item').removeClass('history-selected');
        });
    }

    //TODO: This was just sitting here empty, not sure if it is necessary to have or not
    refresh() {}

    render() {
        const style = {
            backgroundColor: this.props.active ? '#ed6b4d' : ''
        }
        return(
            <div className="history-item"style={style}>
                    <div 
                        id={this.props.id}
                        className="joint-paper history-item-paper"
                        onClick={this.props.onClick}
                    ></div>
            </div>
        )
    }
}