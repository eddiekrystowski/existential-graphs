import React from 'react';
import * as joint from 'jointjs'
import E from '../../EventController.js';
import _ from 'lodash';
import $ from 'jquery'

import Delete from '../../sounds/delete.wav';
import Sheet from './Sheet/Sheet.js';
import History from './History/History.jsx'

import './Paper.css';   
import UtilBar from './UtilBar/UtilBar.jsx';
import UtilBarItem from './UtilBar/UtilBarItem.jsx';
import './UtilBar/UtilBar.css';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

const PAPER_SIZE = { width: 4000, height: 4000 };

export default class Paper extends React.Component {
    constructor(props) {
        super(props);
        this.sheet = new Sheet(this);
        this.jpaper = null;
        this.paper_element = null;
        this.paperRoot = React.createRef();
    
        this.selected_premise = null;
        this.saved_template = null;
        this.temp_cut = null;
        this.initial_cut_pos = {x: 0, y: 0};
        this.canInsertPremise = true;
        this.previousPremiseCode = 0;

        this.state = {
            show: true
        }

        this.UtilBar = React.createRef();
        this.history = React.createRef();
    }

    componentDidMount() {
        this.jpaper = new joint.dia.Paper({
            el: document.getElementById(this.props.id),
            model: this.sheet.graph,
            width: PAPER_SIZE.width,
            height: PAPER_SIZE.height,
            preventContextMenu: false,
            clickThreshold: 1
        });

        this.paper_element = document.getElementById(this.props.id);
        
        this.setPaperEvents();
        this.history.current.push(this.sheet.exportAsJSON());
    }

    handleHistoryJump = (new_state) => {
        console.log('new state', new_state);
        this.history.current.lock();
        this.sheet.graph.clear();
        this.sheet.importFromJSON(new_state);
        this.history.current.unlock();
    }

    onGraphUpdate() {
        const new_graph = this.sheet.exportAsJSON();
        this.history.current.push(new_graph);
    }

    show() {
        $(this.paperRoot.current).css('display', 'flex');
    }

    hide() {
        $(this.paperRoot.current).css('display', 'none');
    }

    //assume that if there is no workspace associated then we are in create mode
    getMode() {
        return this.props.mode || 'create';
    }

    setupModalPaper() {
        this.sheet.graph.clear();
    }

    copyFrom(sourcePaper) {
        const modal_cells = sourcePaper.sheet.graph.getCells();
        for (let i = 0; i < modal_cells.length; i++) {
            modal_cells[i] = modal_cells[i].clone();
            modal_cells[i].graph = this.sheet.graph;
        }
        this.sheet.graph.addCells(modal_cells);
    }

    setPaperEvents(){
        // paper events
        //arrow functions are required to keep proper this context binding
        this.jpaper.on("element:mouseenter", ( cellView, evt) =>{
            let model = cellView.model
            let modelView = model.findView(this.jpaper);
            modelView.showTools()
            model.attr("rect/stroke", "red")
            model.attr("text/fill", "red")
            this.selected_premise = model
        });

        this.jpaper.on("element:mouseleave", ( cellView, evt) =>{
            let model = cellView.model
            let modelView = model.findView(this.jpaper);
            if(!modelView) return;
            modelView.hideTools()
            model.attr("rect/stroke", "black")
            model.attr("text/fill", "black")
            this.selected_premise = undefined;
        })

        // First, unembed the cell that has just been grabbed by the user.
        this.jpaper.on('cell:pointerdown', (cellView, evt, x, y) => {
            
            console.log(cellView)
            let cell = cellView.model;
            console.log("cell", cell)

            if (!cell.get('embeds') || cell.get('embeds').length === 0) {
                // Show the dragged element above all the other cells (except when the
                // element is a parent).
                cell.toFront();
            }
            
            if (cell.get('parent')) {
                this.sheet.graph.getCell(cell.get('parent')).unembed(cell);
            }

            cell.active();
            this.sheet.treeToFront(this.sheet.findRoot(cell));
        });

        // When the dragged cell is dropped over another cell, let it become a child of the
        // element below.
        this.jpaper.on('cell:pointerup', (cellView, evt, x, y) => {

            let cell = cellView.model;
            
            this.sheet.handleCollisions(cell)
            cell.inactive();

            if(!this.props.action) this.onGraphUpdate();

            if (this.props.action) this.props.action(this.sheet, cell, E.mousePosition);
            if (this.props.handleClearAction) this.props.handleClearAction();
            this.selected_premise = null;
        });

        this.sheet.graph.on('add', () => {
            this.onGraphUpdate();
        });

        this.sheet.graph.on('delete', () => {
            this.onGraphUpdate();
        });

        //PAPER UNDO AND REDO EVENTS
        $(this.paperRoot.current).on('keydown', (event) => {
            if (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
                const new_state = this.history.current.undo();
                //only update graph if new state exists
                //undo will return false if can't undo anymore
                if (new_state) {
                    this.sheet.graph.clear();
                    this.history.current.lock();
                    this.sheet.importFromJSON(new_state);
                    this.history.current.unlock();
                }
            }
            if (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && event.shiftKey) {
                const new_state = this.history.current.redo();
                //only update graph if new state exists
                //redo will return false if can't redo anymore
                if (new_state) {
                    this.sheet.graph.clear();
                    this.history.current.lock();
                    this.sheet.importFromJSON(new_state);
                    this.history.current.unlock();
                }
            }
        });
    }

    onClick = () => {
        console.log('clicked', this);
    }

    onKeyUp = (event) => {
        if(event.keyCode === this.previousPremiseCode) this.canInsertPremise = true;
    }

    onKeyDown = (event) => {
        if(this.getMode() === 'proof'){
            return;
        }

        if(this.getMode() === 'create'){
            if (E.keys[16]) {
                this.jpaper.setInteractivity(false);
            }
        }

        //backspace (delete premise or cut)
        if (event.keyCode === 8) {
            if (this.selected_premise) {
                let delete_noise = new Audio(Delete); 
                if (this.selected_premise.attributes.type === "dia.Element.Premise") {
                    this.selected_premise.destroy()
                    delete_noise.play();
                } else if (this.selected_premise.attributes.type === "dia.Element.Cut") {
                    this.selected_premise.destroy();        // Play pop sound
                    delete_noise.play();
                } else {
                    console.error("attempted to delete shape of unknown type: " + this.selected_premise.attributes.type)
                }
            }
            this.selected_premise = null;
        }

        //a-z for creating premise
        const key = event.key.toLocaleUpperCase();
        const code = key.charCodeAt(0);
        if (this.canInsertPremise && key.length === 1 && !(event.ctrlKey || event.metaKey) && code >= 65 && code <= 90) {
            let config = {
                //use capital letters by default, can press shift to make lowercase
                attrs:{
                    text: {
                        text: key
                    }
                },
                position: this.getRelativeMousePos()
            }
            //eslint-disable-next-line
            //let new_rect = new Premise().create(config)
            this.sheet.addPremise(config);
            this.canInsertPremise = false;
            this.previousPremiseCode = code;
        }
        //ENTER
        // new cut
        if (event.keyCode === 13) {
            let config = {
                position: this.getRelativeMousePos()
            }
            if (this.selected_premise) {
                config["child"] = this.selected_premise;
                this.sheet.addCut(config);
            } else {
                //console.log("creating empty cut")
                const new_cut = this.sheet.addCut(config);
                //console.log("cut", new_cut)
            }
        }
    
        if (event.keyCode === 49) {
            //save template
            if (this.selected_premise) {
                this.saved_template = this.sheet.graph.cloneSubgraph([this.selected_premise], {deep: true});
            }
        }
    
        if (event.keyCode === 50) {
            const mouse_adjusted = this.getRelativeMousePos();
            //console.log("position", mouse_adjusted)
            if (this.saved_template) {
                this.sheet.addSubgraph(this.saved_template, mouse_adjusted);
            }
        }
    }

    onMouseDown = (event) => {
        //console.log('mousedown', this);
        if (E.keys[16] && this.getMode() === 'create') {
            this.initial_cut_pos = Object.assign({}, E.mousePosition);
            this.initial_cut_pos.x -= this.paper_element.getBoundingClientRect().left;
            this.initial_cut_pos.y -= this.paper_element.getBoundingClientRect().top;
            let config  = {
                position: Object.assign({}, this.initial_cut_pos),
                size: {width: 0, height: 0}
            }
            //this.temp_cut = new Cut().create(config);
            this.history.current.lock();
            this.temp_cut = this.sheet.addCut(config);
            this.temp_cut.active();
            event.preventDefault();
            //console.log("CREATED TEMP CUT", this.temp_cut);
        }
    }

    onMouseUp = () => {
        //console.log('mouseup', this);
        if (this.getMode() === 'proof') {
            this.history.current.startBatch();
            if (!this.selected_premise && this.props.action && this.props.action.name === 'insertDoubleCut') {
                const mouse_adjusted = this.getRelativeMousePos();
                this.props.action(this.sheet, null, mouse_adjusted);
                this.props.handleClearAction();
            }
            this.history.current.endBatch();
        }
        if (this.temp_cut && this.getMode() === 'create') {
            const position = _.clone(this.temp_cut.get('position'));
            const size = _.clone({width: this.temp_cut.attr('rect/width'), height: this.temp_cut.attr('rect/height')});
            const config = {
                position: position,
                attrs:{
                    rect: {
                        ...size
                    }
                }
            }
            //eslint-disable-next-line
            //let new_rect = new Cut().create(config);
            //console.log('mouse released, deleting temp cut...');
            this.temp_cut.remove();
            this.history.current.unlock();
            //NOTE: Temp cut must be deleted first or there will be uwnanted conflicts with  collisions
            this.sheet.addCut(config);
        }
    
        this.jpaper.setInteractivity(true);
        this.temp_cut = null;
    }

    onMouseMove = () => {
        //console.log('mousemove', this);
        if(this.getMode() === 'create'){
            //console.log(E.isMouseDown);
            if (E.isMouseDown && E.keys[16] && this.temp_cut) {
                const mouse_adjusted = this.getRelativeMousePos();
                this.temp_cut.set('position', {
                    x: Math.min(mouse_adjusted.x, this.initial_cut_pos.x),
                    y: Math.min(mouse_adjusted.y, this.initial_cut_pos.y)
                });
                this.temp_cut.attr('rect/width', Math.abs(mouse_adjusted.x - this.initial_cut_pos.x));
                this.temp_cut.attr('rect/height', Math.abs(mouse_adjusted.y - this.initial_cut_pos.y));
            }
        }
    }

    onMouseEnter = () => {
        this.paper_element.focus();
    }

    getRelativeMousePos() {
        return {
            x: E.mousePosition.x - this.paper_element.getBoundingClientRect().left,
            y: E.mousePosition.y - this.paper_element.getBoundingClientRect().top
        };
    }

    render() {
        if (!this.state.show) return null;
        const styles = {
            width: this.props.wrapperWidth || '100%',
            height: this.props.wrapperHeight || '100%'
        }

        return(
            <div class="paper-root" ref={this.paperRoot}>
                <div class="paper-wrapper" style={styles}>
                    <div 
                        id={this.props.id}
                        class="joint-paper"
                        onClick={this.onClick}
                        onKeyDown={(event) => this.onKeyDown(event)}
                        onKeyUp={(event) => this.onKeyUp(event)}
                        onMouseDown={(event) => this.onMouseDown(event)}
                        onMouseUp={this.onMouseUp}
                        onMouseMove={this.onMouseMove}
                        onMouseEnter={this.onMouseEnter}
                        tabIndex="0"
                    ></div>
                </div>
                <UtilBar ref={this.UtilBar}>
                    <UtilBarItem icon={faHistory}>
                        <History 
                            ref={this.history} 
                            id_prefix={`${this.props.id}-`}
                            handleHistoryJump={this.handleHistoryJump}
                            handleInitializeHistory={this.handleInitializeHistory}
                        />
                    </UtilBarItem>
                </UtilBar>
            </div>
        );
    }
}

export function initializeContainerDrag(container_id){
    const ele = document.getElementById(container_id);
    ele.style.cursor = 'default';
  
      let pos = { top: 0, left: 0, x: 0, y: 0 };
  
      const mouseDownHandler = function(e) {
          if (!E.keys[16]) return;
          ele.style.cursor = 'grabbing';
          ele.style.userSelect = 'none';
  
          pos = {
              left: ele.scrollLeft,
              top: ele.scrollTop,
              // Get the current mouse position
              x: e.clientX,
              y: e.clientY,
          };
  
          ele.addEventListener('mousemove', mouseMoveHandler);
          ele.addEventListener('mouseup', mouseUpHandler);
      };
  
      const mouseMoveHandler = function(e) {
          // How far the mouse has been moved
          const dx = e.clientX - pos.x;
          const dy = e.clientY - pos.y;
  
          // Scroll the element
          ele.scrollTop = pos.top - dy;
          ele.scrollLeft = pos.left - dx;
      };
    
      const mouseUpHandler = function() {
          ele.style.cursor = 'default';
          ele.style.removeProperty('user-select');
  
          ele.removeEventListener('mousemove', mouseMoveHandler);
          ele.removeEventListener('mouseup', mouseUpHandler);
      };
  
      // Attach the handler
      ele.addEventListener('mousedown', mouseDownHandler);
  }