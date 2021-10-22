import * as joint from 'jointjs';

import { Cut } from '../../../shapes/Cut/Cut';
import { Premise } from '../../../shapes/Premise/Premise';
import { color } from '../../../util/color';
import { findSmallestCell, overlapsCells, contains, safeMove } from '../../../util/collisions';
import $ from 'jquery'

const NSPremise = joint.dia.Element.define('nameSpace.Premise',Premise);
const NSCut = joint.dia.Element.define('nameSpace.Cut',Cut);

const DEFAULT_BACKGROUND_COLORS = {
    even: color.shapes.background.even.inactive,
    odd: color.shapes.background.odd.inactive,
    premise: color.shapes.background.default.color
}

export default class Sheet {
    constructor(paper) {
        this.paper = paper;
        this.graph = new joint.dia.Graph({}, {
            cellNamespace: {
                nameSpace: { 
                    Premise: NSPremise,
                    Cut: NSCut
                }
            }
        });
        this.spacing = 10;
    }

    addPremise(config) {
        console.log(config);
        const premise = (new Premise()).create(config, this);
        this.handleCollisions(premise);
        return premise;
    }

    addCut(config) {
        const cut = (new Cut()).create(config, this);
        this.handleCollisions(cut);
        return cut;
    }

    exportAsJSON() {
        //console.log('exporting...');
        const cells = this.graph.getCells();
        const exported = cells.map(cell => Object.assign(cell.attributes, { sheet: null }));
        //console.log(exported);
        const json = JSON.stringify(exported, null, 2);
        //console.log(json);
        return json;
    }

    importFromJSON(json) {
        const parsed = JSON.parse(json);
        for (let cell of parsed) {
            let new_element;
            if (cell.type === 'dia.Element.Premise') {
                new_element = this.addPremise(cell, true);
            }
            else if (cell.type === 'dia.Element.Cut') {
                new_element = this.addCut(cell, true);
            }
            else {
                throw new RangeError(`Cell type must be either dia.Element.Premise or dia.Element.Cut, got ${cell.type}`);
            }

            //fix for small outline box first time mousing over after importing
            const dom_element = $(`svg [model-id="${new_element.attributes.id}"]`);
            dom_element.trigger('mouseenter');
            dom_element.trigger('mouseleave');
        }
    }

    //TODO: some of these functions kind of fit here and also kind of don't. I'm moving them here for now
    // because in the future it would be beneficial to at least have a "entire graph update" be possible, which would be very simple to 
    // do if they are all bundled up.
    handleCollisions(cell) {
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
                if (element.get("parent") || element.id === cell.id) {
                    continue;
                }
                cell.embed(element)
            }
            this.treeToFront(cell)
        }
        //recolor trees to reflect new level structure
        this.colorByLevel(cell);
        this.cleanOverlaps();
    }

    pack() {

    }

    cleanOverlaps() {
        let roots = this.getCellsByLevel(0);
        // sort the roots from largest to smallest. this will cause a ripple effect,
        // starting checks for overlaps at the largest cells and moving outward
        roots.sort(function(a, b) {
            return b.getArea() - a.getArea()
        })

        while (true) {
            let total_overlaps = 0;
            for (const root of roots) {
                let overlaps = overlapsCells(root, roots);
                if (overlaps.length === 0) {
                    continue;
                }
                total_overlaps += overlaps.length;
                for (const invader of overlaps) {
                    this.separate(root, invader);
                }
            }
            if (total_overlaps === 0) break;
        }
    }

    separate(main, invader) {
        //assumes main and invader partially overlap

        let mainbbox = main.getBoundingBox();
        let invaderbbox = invader.getBoundingBox();

        //find the amount of each directional axis that the two cells occupy together
        //whichever is lower will be chosen to reduce the movement of the invader the smallest possible distance

        let shared_x = (mainbbox.x < invaderbbox.x) ? mainbbox.x + mainbbox.width - invaderbbox.x : mainbbox.x - invaderbbox.x - invaderbbox.width; 
        let shared_y = (mainbbox.y < invaderbbox.y) ? mainbbox.y + mainbbox.height - invaderbbox.y : mainbbox.y - invaderbbox.y - invaderbbox.height;

        if (Math.abs(shared_x) >= Math.abs(shared_y)) {
            //make adjustment vertically (shorter change)
            //if shared value is positive, then main is somewhat above the invader
            this.treeMove(invader, {x: invaderbbox.x, y:invaderbbox.y + shared_y + ((this.spacing) * Math.abs(shared_y) / shared_y)});
        } else {
            //make adjustment horizontally (shorter change)
            //if shared value is positive, then main is somewhat to the left of the invader
            this.treeMove(invader, {x: invaderbbox.x + shared_x + ((this.spacing) * Math.abs(shared_x) / shared_x), y: invaderbbox.y});
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
            if (!(cell.get("parent")) || cell.get("parent") === parent.id){
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
    addSubgraph(subgraph, position) {
        let root = subgraph[Object.keys(subgraph)[0]];
        let root_clone = root.clone();
        let new_root = this.subgraphToGraph(root, root_clone, subgraph)
        this.treeMove(new_root, position);
        this.handleCollisions(new_root);
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
            console.log("current", current)
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
            console.log('FIND ROOT NODE', node)
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
        root.attr("level", 0)
    
        if (root.attributes.type === "dia.Element.Premise") {
            root.attr('rect/fill', color_config.premise);
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
                if (child.attributes.type === "dia.Element.Premise") {
                    child.attr("rect/fill", color_config.premise)
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
        let offset = {
            x: position.x - root.attributes.position.x,
            y: position.y - root.attributes.position.y
        }
        console.log(offset);
        let current = [];
        let next = [root];
        while (next.length > 0) {
            current = next;
            next = [];
            console.log(current);
            for (const node of current) {
                next.push(...node.getEmbeddedCells());
                //node.move({x: node.attributes.position.x + offset.x, y: node.attributes.position.y + offset.y})
                //safeMove(node, {x: node.attributes.position.x + offset.x, y: node.attributes.position.y + offset.y})
                node.position(node.attributes.position.x + offset.x, node.attributes.position.y + offset.y);
            }
        }
    }


}