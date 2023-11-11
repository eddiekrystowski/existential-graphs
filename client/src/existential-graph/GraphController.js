import { getLocalGraphByID, findSmallestCell, color, getCellsBoundingBox, contains, intersects, overlapsCells, 
         cellInArray } from '@util';
import * as joint from 'jointjs'
import Atomic from './shapes/Atomic';
import Cut from './shapes/Cut';

const NSAtomic = joint.dia.Element.define('nameSpace.Atomic',Atomic);
const NSCut = joint.dia.Element.define('nameSpace.Cut',Cut);


const DEFAULT_BACKGROUND_COLORS = {
    even: color.shapes.background.even.inactive,
    odd: color.shapes.background.odd.inactive,
    atomic: color.shapes.background.default.color
}

const DISABLED_BACKGROUND_COLORS = {
    even: color.shapes.disabled.even.inactive,
    odd: color.shapes.disabled.odd.inactive,
    atomic: color.shapes.disabled.default.color
}

export default class GraphController {
    constructor(parent_paper, graph_id) {
        this.paper = parent_paper;

        const graphData = getLocalGraphByID(graph_id);
        console.log(graphData);
        this.graph = new joint.dia.Graph({}, {
            cellNamespace: {
                nameSpace: { 
                    Atomic: NSAtomic,
                    Cut: NSCut
                }
            }
        });
        this.spacing = 10;
    }

    addAtomic(config, mute, fast=false) {
        console.log('adding with config', config)
        const atomic = (new Atomic()).create(config, this, fast);
        this.handleCollisions(atomic);

        // Play snip sound
        //let pop = new Audio(Pop); 
        //this.handlePlayAudio(pop);
        //this.paper.onGraphUpdate();
        return atomic;
    }

    addCut(config, collisions=true) {
        const cut = (new Cut()).create(config, this, collisions);
        if (collisions) this.handleCollisions(cut);

        // Play snip sound
        //let snip = new Audio(Snip); 
        //this.handlePlayAudio(snip);
        //this.paper.onGraphUpdate();
        return cut;
    }

    handleCollisions(cell, clean=true) {
        //console.log("=================== HANDLE COLLISIONS =========================")
        //This function takes a Cell as input and, using its position
        // makes any necessary changes to the internal representation of
        // the diagram (parent / child structure (embedding)) to reflect what the user
        // sees on the paper
        let cellbbox = cell.getBoundingBox();
        
        let potential_parents = this.findPotentialParents(cellbbox);
        let parent = findSmallestCell(potential_parents);
    
        if (parent) {
            let children = this.filterChildren(parent, cellbbox)
            //embed cell into parent
            parent.embed(cell);
    
            //reroot children
            for (const child of children) {
                if (child.get("parent")) {
                    parent.unembed(child);
                }
                cell.embed(child)
            }
            this.treeToFront(parent)
        } else {
            let elements_inside = this.findElementsInside(cellbbox)
            for (const element of elements_inside) {
                //do not add children to locked element
                if (cell.isLocked()) {
                    break;
                }
                if (element.get("parent") || element.id === cell.id) {
                    continue;
                }
                cell.embed(element)
            }
            this.treeToFront(cell)
        }
        //recolor trees to reflect new level structure
        this.colorByLevel(cell);
        if (clean) {
            this.pack(cell);
            this.cleanOverlaps();
        }
    }

    pack(cell) {
        let root = this.findRoot(cell);
        //console.log("ROOT EMBEDS", root.getEmbeddedCells())
        this.pack_rec(root);
    }

    pack_rec(cell) {
        //let level = cell.attributes.attrs.level;
        let siblings = cell.getEmbeddedCells()
        //console.log("siblings", siblings)
        if (siblings.length === 0) {
            return;
        }
        for (const child of siblings) {
            this.pack_rec(child);
        }
        //cell is inside a cut
        //get siblings
        this.cleanOverlaps(siblings);
        let siblingsbbox = getCellsBoundingBox(siblings)
        let cellbbox = cell.getBoundingBox()
        if (!contains(cellbbox, siblingsbbox)) {
            if (!intersects(cellbbox, siblingsbbox)) return;
            if (siblingsbbox.x < cellbbox.x || siblingsbbox.x + siblingsbbox.width > cellbbox.x + cellbbox.width) {
                cell.position(siblingsbbox.x - this.spacing, cell.attributes.position.y)
                cell.attr("rect/width", siblingsbbox.width + 2 * this.spacing)
            }
            if (siblingsbbox.y < cellbbox.y || siblingsbbox.y + siblingsbbox.height > cellbbox.y + cellbbox.height) {
                cell.position(cell.attributes.position.x, siblingsbbox.y - this.spacing)
                cell.attr("rect/height", siblingsbbox.height + 2 * this.spacing)
            }
        }
    }

    cleanOverlaps(roots = this.getCellsByLevel(0)) {
        // sort the roots from largest to smallest. this will cause a ripple effect,
        // starting checks for overlaps at the largest cells and moving outward
        roots.sort(function(a, b) {
            return b.getArea() - a.getArea()
        }) 
        let current = roots;
        while (current.length > 0) {
            let next = [];
            //let total_overlaps = 0;
            for (const cell of current) {
                let overlaps = overlapsCells(cell, roots);

                for (const invader of overlaps) {
                    this.separate(cell, invader);
                    let dupe = cellInArray(invader, next);
                    if (!dupe) next.push(invader);
                }
            }
            current = next;
        }
    }

    separate(main, invader) {
        console.log('SEPARATE')
        //assumes main and invader partially overlap

        let mainbbox = main.getBoundingBox();
        let invaderbbox = invader.getBoundingBox();

        console.log('mainbbox', mainbbox);
        console.log('invaderbbox', invaderbbox)

        //find the amount of each directional axis that the two cells occupy together
        //whichever is lower will be chosen to reduce the movement of the invader the smallest possible distance

        let shared_x = (mainbbox.x < invaderbbox.x) ? mainbbox.x + mainbbox.width - invaderbbox.x : mainbbox.x - invaderbbox.x - invaderbbox.width; 
        let shared_y = (mainbbox.y < invaderbbox.y) ? mainbbox.y + mainbbox.height - invaderbbox.y : mainbbox.y - invaderbbox.y - invaderbbox.height;

        console.log('shared_x', shared_x)
        console.log('shared_y', shared_y);



        if (Math.abs(shared_x) > Math.abs(shared_y)) {
            //make adjustment vertically (shorter change)
            //if shared value is positive, then main is somewhat above the invader
            let dir = Math.sign(shared_y);
            if (dir === 0) dir = 1;
            this.treeMove(invader, {x: invaderbbox.x, y: invaderbbox.y + shared_y + (this.spacing * dir)});
        } else {
            //make adjustment horizontally (shorter change)
            //if shared value is positive, then main is somewhat to the left of the invader
            let dir = Math.sign(shared_x);
            if (dir === 0) dir = 1;
            this.treeMove(invader, {x: invaderbbox.x + shared_x + (this.spacing * dir), y: invaderbbox.y});
        }

    }

    getCellsByLevel(level) {
        //returns an array of all cells with the matching level
        let cells = this.graph.getCells();
        let result = []
        for (const cell of cells) {
            if (cell.attributes.attrs.level === level) result.push(cell);
        }
        return result;
    }

    findElementsInside(bbox, cells=this.graph.getCells()) {
        //takes two bbox objects as input
        //bbox objects should have the structure:
        // {
        //      width: int,
        //      height: int,
        //      x: int,
        //      y: int
        // }
        let elements = []
        for (const cell of cells) {
            let otherbbox = cell.getBoundingBox();
            if (contains(bbox, otherbbox)) {
                elements.push(cell)
            }
        }
        return elements
    }


    findPotentialParents(targetbbox) {
        // POTENTIAL PARENTS -- potential parents are only the cells that 
        //                      contain (completely) the CELL.
        let cells = this.graph.getCells()
        let potential_parents = []
        for (const cell of cells) {
            let otherbbox = cell.getBoundingBox();
            //find cells who contain target cell
            if (contains(otherbbox, targetbbox)) {
                //console.log("potential parent found")
                potential_parents.push(cell)
            }
        }
    
        return potential_parents
    }


    filterChildren(parent, new_child_bbox) {
        //function returns array of children who fit inside new child
        let cells = this.graph.getCells();
        let potential_children = [];
        for (const cell of cells) {
            if (cell.get("parent") === parent.id){
                potential_children.push(cell)
            }
        }
        let children = this.findElementsInside(new_child_bbox, potential_children)
        return children;
    }

    treeToFront(root) {
        //loops through a tree from its root to the leaves
        //to ensure correct z order
        let current = [root]
        let next = []
        while (current.length > 0) {
            for (const node of current) {
                //console.log(node);
                node.toFront();
                let children = node.getEmbeddedCells();
                next.push(...children);
            }
            current = next
            next = []
        }
    }


    //i think these are graph related functions??? since they call handle collisions, tree stuff, etc which
    //could be specific to a graph
    addSubgraph(subgraph, position, selected = null) {
        let root = subgraph[Object.keys(subgraph)[0]];
        let root_clone = root.clone();
        let new_root = this.subgraphToGraph(root, root_clone, subgraph)
        this.treeMove(new_root, position);
        if (selected && selected.attributes.type === "dia.Element.Cut") {
            selected.embed(new_root);
        }
        this.handleCollisions(new_root)
        return root_clone.id;
    }

    subgraphToGraph(node, clone, subgraph, parent=null) {
        clone.sheet = this;
        clone.addTo(this.graph);
        if (parent != null) {
            parent.embed(clone);
        }
        let embeds = node.get('embeds');
        if (embeds){
            for (const embed of embeds) {
                let child = this.findCellInSubgraph(embed, subgraph);
                this.subgraphToGraph(child, child.clone(), subgraph, clone);
            }
        }
        return clone;
    }

    findCellInSubgraph(id, subgraph) {
        let keys = Object.keys(subgraph);
        for (const key of keys) {
            let cell = subgraph[key];
            if (cell.id === id) {
                return cell;
            }
        }
        alert("find subgraph failed!");
        return null;
    }

    //FIXME: these functions don't seem to be related to a specific graph, yet i'm not sure where to put them.
    // I don't think just having them sit out in the open is a great idea either.
    // Possibly we can just have these functions sit at the bottom of this file (outside of the class)
    // We can't really make a class with these functions since the graph itself is the tree and we are just defining operations on it
    //      - or maybe we can if we get creative, have to think more about it
    treeResize(root, resize_value = 20, center_nodes = true) {
        //resizes all the children of a root, not including the root
        let current = root.getParentCell();
        while (current) {
            current.attr("rect/width", current.attributes.attrs.rect.width + resize_value);
            current.attr("rect/height", current.attributes.attrs.rect.height + resize_value);
            if (center_nodes) {
                current.set("position", {x: current.attributes.position.x - resize_value/2,
                                         y: current.attributes.position.y - resize_value/2});
            }
            current = current.getParentCell();
        }
    }
    
    findRoot(node) {
        while (true) {
            if (node.get("parent")) {
                node = node.getParentCell();
            } else {
                break;
            }
        }
        return node;
    }
    
    findLevel(node) {
        let level = 0;
        let parent = node.getParentCell();
        while (parent) {
            level++;
            parent = parent.getParentCell();
        }
        return level;
    }
    
    colorByLevel(node, color_config = DEFAULT_BACKGROUND_COLORS) {
        //find root of node's tree
        let root = this.findRoot(node);
    
        if (root.attributes.type === "dia.Element.Atomic") {
            root.attr('rect/fill', color_config.atomic);
            return;
        }
        //otherwise its a cut root
        root.attr("rect/fill", color_config.odd)
        let level = 0;
        let children = root.getEmbeddedCells();
        while(children.length > 0) {
            level++
            //the color applies to the level contained within the cut, not the level the cut is on
            let parity = (level+1) % 2;
            let next_children = []
            for (const child of children) {
                child.attr("level", level);
                if (child.attributes.type === "dia.Element.Atomic") {
                    child.attr("rect/fill", color_config.atomic)
                    continue;
                }
                //coloring cut
                child.attributes.attrs.level = level;
                if (parity === 0) {
                    child.attr("rect/fill", color_config.even) 
                } else {
                    child.attr("rect/fill", color_config.odd);   
                }                                 
                next_children.push(...child.getEmbeddedCells());
            }
            children = next_children;
        }
    
    }
    
    treeMove(root, position) {
        if (root === null || root === undefined) {
            console.error("root is " + root + "for treeMove()")
            return;
        }
        //console.log("ROOT: ", root)
        const offset = {
            x: position.x - root.attributes.position.x,
            y: position.y - root.attributes.position.y
        }
        let current = [];
        let next = [root];
        while (next.length > 0) {
            current = next;
            next = [];
            //console.log("current: ", current)
            for (const node of current) {
                //console.log("node: ", node)
                next.push(...node.getEmbeddedCells());
                //node.move({x: node.attributes.position.x + offset.x, y: node.attributes.position.y + offset.y})
                //safeMove(node, {x: node.attributes.position.x + offset.x, y: node.attributes.position.y + offset.y})
                node.position(node.attributes.position.x + offset.x, node.attributes.position.y + offset.y);
            }
        }
    }

    forcePremise(config, target=null) {
        const parent = (target === null) ? this.getCellAtMouse() : target;
        //console.log("TEST PARENT : ", parent)
        if (parent === null || parent.attributes.type !== "dia.Element.Cut") return this.addAtomic(config);
        const atomic = (new Atomic()).create(config, this, false);
        parent.embed(atomic) 
        //need to resize cut to fit premise
        const atomic_bbox = atomic.getBoundingBox();
        const parent_bbox = atomic.getBoundingBox();
        //console.log("premise: ", premise_bbox);
        //console.log("parent: ", parent_bbox);
        const buffer = 10;
        if (!contains(parent.getBoundingBox(), atomic.getBoundingBox())) {
            //check if premise is to the left of parent
            if (atomic_bbox.x <= parent_bbox.x) {
                const diff = parent_bbox.x - atomic_bbox.x - buffer;
                this.treeMove(parent, {x: atomic_bbox.x - buffer, y: parent_bbox.y});
                parent.attr("rect/width", parent.attributes.attrs.rect.width + diff);
            } 
            //check if premise is to the right of parent
            if (atomic_bbox.x + atomic_bbox.width >= parent_bbox.x + parent_bbox.width) {
                const diff = atomic_bbox.x + atomic_bbox.width - (parent_bbox.x + parent_bbox.width);
                parent.attr("rect/width", parent.attributes.attrs.rect.width + diff + buffer);
            }
            // check if premise is above parent
            if (atomic_bbox.y <= parent_bbox.y) {
                const diff = parent_bbox.y - atomic_bbox.y - buffer;
                this.treeMove(parent, {x: parent_bbox.x, y: atomic_bbox.y - buffer});
                parent.attr("rect/height", parent.attributes.attrs.rect.height + diff);
            }
            //check if premise is below parent
            if (atomic_bbox.y + atomic_bbox.height >= parent_bbox.y + parent_bbox.height){
                const diff = atomic_bbox.y + atomic_bbox.height - (parent_bbox.y + parent_bbox.height) + 10;
                parent.attr("rect/height", parent.attributes.attrs.rect.height + diff + buffer);
            }

        }
        
        this.handleCollisions(atomic);
        
        return atomic;
    }


    // returns cell under mouse with the highest z value;
    getCellAtMouse() {
        //console.log("mouse pos", this.paper.getRelativeMousePos());
        const mouse_pos = this.paper.getRelativeMousePos()
        const cells = this.graph.getCells().filter(cell =>  mouse_pos.x <= cell.attributes.position.x + cell.attributes.attrs.rect.width
                                                        && mouse_pos.x >= cell.attributes.position.x
                                                        && mouse_pos.y <= cell.attributes.position.y + cell.attributes.attrs.rect.height
                                                        && mouse_pos.y >= cell.attributes.position.y); 
        //console.log("getCellAtMouse : \n CELLS: ", cells);
        if (cells.length === 0) return null;
        const cell = cells.reduce((max, cell) => max.attributes.z > cell.attributes.z ? max : cell);
        //console.log("HIGHEST CELL: ", cell)
        return cell;
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
            sheet: this
        })).create(config, this)
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
        this.handleCollisions(cut)

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
                const new_cut =  this.addCut(cell);
                ids[cell.id] = true;
            }
            else if (type === "dia.Element.Atomic") {
                const new_atomic = this.addAtomic(cell);
                ids[cell.id] = true;
            }
        }

        cut.destroy()

    }

    lockAllCells() {
        const cells = this.graph.getCells()

        for (let cell of cells) {
            cell.lock()
            console.log('cell', cell)
        }
    }

    unlockAllCells() {
        const cells = this.graph.getCells()

        for (let cell of cells) {
            cell.unlock()
        }
    }

    lockSubgraph(root, includeRoot=true) {
        if (includeRoot) {
            root.lock()
        }

        let children = root.getEmbeddedCells();
        while (children.length > 0) {
            let new_children = []
            for (let child of children) {
                new_children.push(...child.getEmbeddedCells());
                child.lock();
            }
            children = new_children
        }  
    }

    unlockSubgraph(root) {
        root.unlock()
        let children = root.getEmbeddedCells();
        while (children.length > 0) {
            let new_children = []
            for (let child of children) {
                new_children.push(...child.getEmbeddedCells());
                child.unlock();
            }
            children = new_children
        } 
    }

    colorCells(color_config, cells=[]) {
        // if no cells are provided, color all cells
        if (cells.length === 0) {
            cells = this.graph.getCells()
        }

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i]
            const level = cell.attributes.attrs.level
            const color = (level % 2 === 0) ? color_config.even.color : color_config.odd.color
            cell.setColor(color)
        }
    }

    //insertion mode disables editing all elements except for those on the same level with the target cut
    enableInsertMode(targetCut) {
        const type = targetCut.type

        if (type == "dia.Element.Premise") {
            //error : can not activate insert mode on a premise
            return null;
        }

        //start by locking all cells
        this.lockAllCells()

        //remove joint tools from cells
        
        //color all cells with disabled colors
        this.colorCells(DISABLED_BACKGROUND_COLORS)

        //unlock children of target cut
        const children = targetCut.getEmbeddedCells()
        for (const child of children) {
            child.unlock()
        }

        //set color to active for target and children
        this.colorCells(DEFAULT_BACKGROUND_COLORS, [targetCut, ...children])
    }

    //insertion mode disables editing all elements except for those on the same level with the target cut
    disableInsertMode() {
        //unlock all cells
        const cells = this.graph.getCells();

        for (const cell of cells) {
            cell.unlock()
        }

        //color all cells with default colors
        this.colorCells(DEFAULT_BACKGROUND_COLORS)
    }

    addCutAsParent(config) {
        const cut = (new Cut()).create(config, this, false);
    }

    insertDoubleCut = function(model, mousePosition={}) {
        let position = {};
        let size = {}
        if (!model && mousePosition) {
            position = mousePosition;
            size = { width: 80, height: 80 }
        }
        else if (model){
            position = model.get('position');
            size = { width: model.attr('rect/width'), height: model.attr('rect/height') }
        }
        else {
            throw new Error('Bad arguments');
        }
        const multipliers = [0.8, 0.25];
        let new_cuts = []
        for(let i = 0; i < multipliers.length; i++) { 
            new_cuts.push(this.addCut({
                position:  {
                x: position.x - (size.width * multipliers[i]/2),
                y: position.y - (size.height * multipliers[i]/2)
                },
                attrs: {
                    rect: {
                        width: size.width * (1 + multipliers[i]),
                        height: size.height * (1 + multipliers[i])
                    }
                }
            }, false));
        } 
        new_cuts[0].embed(new_cuts[1])
        this.colorByLevel(new_cuts[0])
        let selected_premise = this.paper.selected_premise;
        if (selected_premise && selected_premise.attributes.type === "dia.Element.Cut") {
        selected_premise.embed(new_cuts[0]);
        this.colorByLevel(selected_premise)
        this.pack(selected_premise)
        }
        this.handleCollisions(new_cuts[0]) 
    }

    deleteDoubleCut(model) {
        console.log("MODEL: ", model);
        if(model.__proto__.constructor.name === "Cut" && model.attributes.embeds?.length === 1 && 
            this.graph.getCell(model.attributes.embeds[0]).__proto__.constructor.name === "Cut") {
            const children = this.graph.getCell(model.attributes.embeds[0]).attributes.embeds;
            this.graph.getCell(model.attributes.embeds[0]).destroy();
            model.destroy();
            if(model.attributes.parent) {
                this.handleCollisions(this.graph.getCell(model.attributes.parent));
            }
            else {
            children?.forEach(element => {
                if(this.graph.getCell(element).__proto__.constructor.name === "Cut") {
                    this.handleCollisions(this.graph.getCell(element))
                }
            });
            }
        }
    }

    deleteSubgraph(root, deleteRoot=true) {
        //destroy recursively, starting at the leaves to not lose reference
        //to the rest of the tree by deleting the root first
        let children = root.getEmbeddedCells()
        for (const child in children) {
            this.deleteSubgraph(child)
        }
        root.destroy()
    }

}