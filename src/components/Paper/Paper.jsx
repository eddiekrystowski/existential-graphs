import React from 'react';
import * as joint from 'jointjs'
import E from '../../EventController.js';
import _ from 'lodash';
import $ from 'jquery'

import Delete from '../../sounds/delete.wav';
import Sheet from './Sheet/Sheet.js';
import History from './History/History.jsx'

import { Cut } from '../../shapes/Cut/Cut';
import { Premise } from '../../shapes/Premise/Premise';
import './Paper.css';   
import UtilBar from './UtilBar/UtilBar.jsx';
import UtilBarItem from './UtilBar/UtilBarItem.jsx';
import './UtilBar/UtilBar.css';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { getCellsBoundingBox } from '../../util/collisions.js';
import { contains } from '../../util/collisions'

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

    handleHistoryJump = (cells) => {
        this.history.current.lock();
        this.sheet.importCells(cells);
        this.history.current.unlock();
    }

    onGraphUpdate() {
        //const new_graph = this.sheet.exportAsJSON();
        //const cells = Object.values(this.sheet.graph.cloneCells(this.sheet.graph.getCells()));
        const cells = this.sheet.graph.getCells()
        this.history.current.push(cells);
    }

    show() {
        $(this.paperRoot.current).css('display', 'flex');
    }

    hide() {
        $(this.paperRoot.current).css('display', 'none');
    }

    export() {
        // delete graph.changed;
        let graphJSON = this.sheet.graph.toJSON();
        for(let i = 0; i < graphJSON.cells.length; i++) {
            delete graphJSON.cells[i].sheet;
        }
 
        //console.log(graphJSON);
        const file = new Blob([JSON.stringify(graphJSON, null, 2)], { type: 'application/json'});
        const a = document.createElement("a");
        let url = URL.createObjectURL(file);
        a.href = url;
        a.download = 'graph.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

    /**
     * 
     * @param {bool} clear - whether to prompt the user about clearing the graph. 
     *                      If true, the user is prompted to confirm whether they wish to empty the graph on import
     *                      if false, the graph is not cleared on import
     */
    import(clear) {
        const input = document.createElement("input");
        input.type = "file";
        // choosing the file
        input.onchange = (ev) => {
            const file = ev.target.files[0];
            if (file.type !== "application/json") {
                alert("File must be of .JSON type");
                return;
            }
            // read the file
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (readerEvent) => {
                const content = readerEvent.target.result;
                if (clear) {
                    if (window.confirm("Erase your current workspace and import graph?")) {
                        this.sheet.graph.clear();
                        // const dataObj = JSON.parse(content);
                        // graph.fromJSON(dataObj);
                        //props.setGraphDataOnImport(content);

                        const dataObj = JSON.parse(content);
                        this.parseJSON(dataObj.cells);
                    }
                } else {
                    const dataObj = JSON.parse(content);
                    this.parseJSON(dataObj.cells);
                }
            };
        };
        input.click();
    }

    parseJSON(cells) {
        //console.log("CELLS:", cells)
        if (cells === null) return;
        const ids = {}; 
        while (cells.length > 0) {
            const cell = cells.shift();
            const type = cell.type;

            if (cell.parent && !ids.hasOwnProperty(cell.parent)) {
                //console.log('has parent, skipping for now...')
                cells.push(cell);
                continue;
            }
            if (type === "dia.Element.Cut") {
                this.sheet.addCut(cell);
                ids[cell.id] = true;
            }
            else if (type === "dia.Element.Premise") {
                this.sheet.addPremise(cell);
                ids[cell.id] = true;
            }
        }
    }

        /**
     * Force an array of cells into a Cut (target) even if they do not fit by resizing and moving 
     * the target and its children / neighbors
     * @param {Cell[]} cells 
     * @param {Cut} target
     */
    forceParseCells(cells, cellsbbox, target) {
        console.clear()
        console.log("forcing cells: ",cells)
        console.log("to target: ", target)
        if (cells === null) return;
        if (target === null || target.attributes.type !== "dia.Element.Cut") return;

        // We have a non empty array of cells to insert into a cut
        //create a temporary root cut to insert all cells into
        const config = {
            size: {
                width: cellsbbox.width + 10,
                height: cellsbbox.height + 10
            },
            position: {
                x: cellsbbox.x-10,
                y: cellsbbox.y-10
            },
            attrs: {
                rect: {
                    width: cellsbbox.width + 10,
                    height: cellsbbox.height + 10
                }
            }
        }
        const cut = (new Cut({
            markup: '<rect/><text/>',
            position: {
                ...config.position
            },
            size: {
                ...config.size
            },
            attrs: {
                rect: {
                    ...config.attrs.rect
                },
                text: {
                    ...config.attrs.text
                },
                level: 0
            },
            // set custom attributes here:
            sheet: this.sheet
        })).create(config, this.sheet)
        // put the cut inside the target 
        target.embed(cut);
        const target_bbox = target.getBoundingBox();
        const cut_bbox = cut.getBoundingBox();
        const buffer = 10;
        if (!contains(target_bbox, cut_bbox)) {
            //check if premise is to the left of parent
            if (cut_bbox.x <= target_bbox.x) {
                const diff = target_bbox.x - cut_bbox.x - buffer;
                target.position(cut_bbox.x - buffer, target_bbox.y);
                target.attr("rect/width", target.attributes.attrs.rect.width + diff);
            } 
            //check if premise is to the right of parent
            if (cut_bbox.x + cut_bbox.width >= target_bbox.x + target_bbox.width) {
                const diff = cut_bbox.x + cut_bbox.width - (target_bbox.x + target_bbox.width);
                target.attr("rect/width", target.attributes.attrs.rect.width + diff + buffer);
            }
            // check if premise is above parent
            if (cut_bbox.y <= target_bbox.y) {
                const diff = target_bbox.y - cut_bbox.y - buffer;
                target.position(target_bbox.x, cut_bbox.y - buffer);
                target.attr("rect/height", target.attributes.attrs.rect.height + diff);
            }
            //check if premise is below parent
            if (cut_bbox.y + cut_bbox.height >= target_bbox.y + target_bbox.height){
                const diff = cut_bbox.y + cut_bbox.height - (target_bbox.y + target_bbox.height) + 10;
                target.attr("rect/height", target.attributes.attrs.rect.height + diff + buffer);
            }
        }
        console.log("GHOST CUT: ", cut)
        this.sheet.handleCollisions(cut)

        //update position of cells based on where cut ends up
        console.log("updating cells",cells);

        for (const cell of cells) {
            console.log("updating cell position:",cell.position)
            cell.position = {
                x: cut.attributes.position.x + (cell.position.x-cellsbbox.x + 5), 
                y: cut.attributes.position.y + (cell.position.y-cellsbbox.y + 5)
            }
        }
        
        const ids = {}; 
        while (cells.length > 0) {
            const cell = cells.shift();
            const type = cell.type;

            if (cell.parent && !ids.hasOwnProperty(cell.parent)) {
                //console.log('has parent, skipping for now...')
                cells.push(cell);
                continue;
            }

            if (type === "dia.Element.Cut") {
                const new_cut =  this.sheet.addCut(cell);
                ids[cell.id] = true;
            }
            else if (type === "dia.Element.Premise") {
                const new_premise = this.sheet.addPremise(cell);
                ids[cell.id] = true;
            }
        }

        cut.destroy()

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
            
           // console.log(cellView)
            let cell = cellView.model;
            //console.log("cell", cell)

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
            let nextAction;
            if (this.props.action) {
                nextAction = this.props.action(this.sheet, cell, this.getRelativeMousePos());
            }
            if (this.props.handleClearAction && !nextAction) this.props.handleClearAction();
            if(nextAction) this.props.handleActionChange(nextAction);
            this.selected_premise = null;
        });

        // this.sheet.graph.on('add', () => {
        //     this.onGraphUpdate();
        // });

        //PAPER UNDO AND REDO EVENTS
        $(this.paperRoot.current).on('keydown', (event) => {
            if (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
                const new_state = this.history.current.undo();
                this.selected_premise = null;
                //only update graph if new state exists
                //undo will return false if can't undo anymore
                if (new_state) {
                    this.history.current.lock();
                    this.sheet.importCells(new_state);
                    this.history.current.unlock();
                }
            }
            if (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && event.shiftKey) {
                const new_state = this.history.current.redo();
                //only update graph if new state exists
                //redo will return false if can't redo anymore
                if (new_state) {
                    this.history.current.lock();
                    this.sheet.importCells(new_state);
                    this.history.current.unlock();
                }
            }
        });
    }

    handleDeleteCell = () => {
        this.onGraphUpdate();
    }

    onClick = () => {
        //console.log('clicked', this);
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
            if (!this.selected_premise) return;
            let delete_noise = new Audio(Delete);
            if (event.shiftKey) {
                //obliterate
                this.props.handlePlayAudio(delete_noise);
                this.selected_premise.obliterate();
            } else  {
                //single deletion
                if (this.selected_premise.attributes.type === "dia.Element.Premise") {
                    this.selected_premise.destroy()
                    this.props.handlePlayAudio(delete_noise);
                } else if (this.selected_premise.attributes.type === "dia.Element.Cut") {
                    this.selected_premise.destroy();        // Play pop sound
                    this.props.handlePlayAudio(delete_noise);
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
            if (event.shiftKey) this.sheet.forcePremise(config);
            else { this.sheet.addPremise(config); }
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
                this.sheet.addCut(config);
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
                this.sheet.addSubgraph(this.saved_template, mouse_adjusted, this.selected_premise);
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
            if (!this.selected_premise && this.props.action && this.props.action.name === 'bound iterationend') {
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
            <div className="paper-root" ref={this.paperRoot}>
                <div className="paper-wrapper" style={styles}>
                    <div 
                        id={this.props.id}
                        className="joint-paper"
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
