import React from 'react';
import $ from 'jquery';
import * as joint from 'jointjs';

import Sheet from '../Sheet/Sheet';

export default class HistoryItem extends React.Component {
    constructor(props) {
        super(props);

        this.jpaper = null;
        this.sheet = new Sheet(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.props.num === this.props.total -1 ){
            this.sheet.importCells(this.props.cells);
            this.jpaper.scaleContentToFit();
        }
    }

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
        
        $(`#${this.props.id}`).on('mouseover', function() {
            $(this).closest('.history-item').addClass('history-selected');
            
        });

        $(`#${this.props.id}`).on('mouseout', function() {
            $(this).closest('.history-item').removeClass('history-selected');
        });
    }

    refresh() {

    }

    render() {
        const style = {
            backgroundColor: this.props.active ? '#ed6b4d' : ''
        }
        return(
            <div class="history-item"style={style}>
                    <div 
                        id={this.props.id}
                        class="joint-paper history-item-paper"
                        onClick={this.props.onClick}
                    ></div>
            </div>
        )
    }
}