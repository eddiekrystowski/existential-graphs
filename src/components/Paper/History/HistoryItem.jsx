import React from 'react';
import * as joint from 'jointjs';
import $ from 'jquery';

import Sheet from '../Sheet/Sheet';

export default class HistoryItem extends React.Component {
    constructor(props) {
        super(props);

        this.jpaper = null;
        this.sheet = new Sheet(this);
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

        this.sheet.importFromJSON(this.props.json);
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

    render() {
        return(
            <div class="history-item">
                    <div 
                        id={this.props.id}
                        class="joint-paper history-item-paper"
                    ></div>
            </div>
        )
    }
}