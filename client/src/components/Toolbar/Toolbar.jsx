import React from 'react';
import "@root/main.css"; // Tawilwind stylesheet
import ToolbarItem from './ToolbarItem/ToolbarItem';
import ToolbarItemOption from './ToolbarItemOption/ToolbarItemOption';
import { Menu } from '@headlessui/react';
import GraphTool from './GraphTool/GraphTool';

export default function Toolbar( props ) {

    function handleGraphNameLoseFocus(e) {
        e.target.value = e.target.value.trim();
        if (!e.target.value) e.target.value = "Untitled Graph";
        props.handleGraphNameUpdate(e.target.value);
    }
  
    return (
        <div className='z-9 w-screen h-max bg-slate-200 dark:bg-slate-500 flex flex-row px-2 font-mono pt-2 '>
            {/* Left-side file management tools */}
            <div className='z-9 w-1/4 h-max bg-slate-200 dark:bg-slate-500 flex flex-col px-2 font-mono pt-2 '>
                <div>    
                    <input 
                        onBlur={handleGraphNameLoseFocus} 
                        placeholder="Untitled Graph" 
                        type="text" 
                        defaultValue={props.graphName}
                        className="outline-none bg-transparent border-none hover:ring-1 hover:ring-black font-semibold text-xl font-sans"
                    />
                </div>
                <div className='flex flex-row gap-4'>
                    <ToolbarItem name="File">
                        <div className="py-1">
                            <ToolbarItemOption>Import</ToolbarItemOption>
                            <ToolbarItemOption>Export</ToolbarItemOption>
                            <ToolbarItemOption action={props.handleSaveGraph}>Save</ToolbarItemOption>
                        </div>
                    </ToolbarItem>
                    <ToolbarItem name="Edit">
                        <div className="py-1">
                            <ToolbarItemOption>Clear Graph</ToolbarItemOption>
                        </div>
                    </ToolbarItem>
                    <ToolbarItem name="Lemma">
                        <div className="py-1">
                            <ToolbarItemOption>Insert Lemma</ToolbarItemOption>
                            <ToolbarItemOption>Save Lemma</ToolbarItemOption>
                            <ToolbarItemOption>View Lemmas</ToolbarItemOption>
                        </div> 
                    </ToolbarItem>
                </div>
            </div>
            
            {/* Graph tools */}
            <div className='z-9 w-max h-max bg-slate-200 dark:bg-slate-500 flex flex-row px-2 font-mono'>
                <GraphTool onClick={() => props.handleSetGraphTool('cut')}>Cut</GraphTool>
                <GraphTool onClick={() => props.handleSetGraphTool('insert_double_cut')}>Insert Double Cut</GraphTool>
                <GraphTool onClick={() => props.handleSetGraphTool('erase_double_cut')}>Erase Double Cut</GraphTool>
                <GraphTool onClick={() => props.handleSetGraphTool('insert_subgraph')}>Insert Subgraph</GraphTool>
                <GraphTool onClick={() => props.handleSetGraphTool('erase_subgraph')}>Erase Subgraph</GraphTool>
            </div>
        </div>
    );
}