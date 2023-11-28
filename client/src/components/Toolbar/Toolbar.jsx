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

    function handleStartProofClicked() {
        props.handleStartProofClicked();
    }
  
    return (
        <div className='z-9 w-screen h-max bg-slate-200 dark:bg-slate-500 flex flex-row justify-between pl-2 pr-12 font-mono pt-2'>
            {/* Left-side file management tools */}
            <div className='z-9 h-max bg-slate-200 dark:bg-slate-500 flex flex-col px-2 font-mono pt-2 '>
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
            <div className='z-9 h-max bg-slate-200 dark:bg-slate-500 flex flex-row px-2 font-mono relative'>
                <GraphTool 
                    selected={props.graphTool === 'cut'}
                    onClick={() => props.graphTool === 'cut' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('cut')}
                >
                    Cut
                </GraphTool>
                <GraphTool 
                    selected={props.graphTool === 'insert_double_cut'}
                    onClick={() => props.graphTool === 'insert_double_cut' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('insert_double_cut')}
                >
                    Insert Double Cut
                </GraphTool>
                <GraphTool
                    selected={props.graphTool === 'erase_double_cut'}
                    onClick={() => props.graphTool === 'erase_double_cut' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('erase_double_cut')}
                >
                    Erase Double Cut
                </GraphTool>
                <GraphTool
                    selected={props.graphTool === 'insert_subgraph'}
                    onClick={() => props.graphTool === 'insert_subgraph' 
                                    ? props.handleSetGraphTool('auto_disable_insert') 
                                    : props.handleSetGraphTool('insert_subgraph')}
                >
                    Insert Subgraph
                </GraphTool>
                <GraphTool
                    selected={props.graphTool === 'erase_subgraph'}
                    onClick={() => props.graphTool === 'erase_subgraph' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('erase_subgraph')}
                >
                    Erase Subgraph
                </GraphTool>
                <GraphTool
                    selected={props.graphTool === 'copy_subgraph'}
                    onClick={() => props.graphTool === 'copy_subgraph' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('copy_subgraph')}
                >
                    Copy Subgraph
                </GraphTool>
                <GraphTool
                    selected={props.graphTool === 'paste_subgraph'}
                    onClick={() => props.graphTool === 'paste_subgraph' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('paste_subgraph')}
                >
                    Paste Subgraph
                </GraphTool>

                {
                    props.inProof && 
                    <div className='text-xs min-h-full flex flex-col justify-center flex-initial mx-2 font-bold text-slate-700'>
                        <span>Graph</span>
                        <span>Tools</span>
                    </div>
                }
                
                {
                    props.inProof && 
                    <div className='border-l-2 border-solid border-slate-500 min-h-full'></div>
                }

                {
                    props.inProof && 
                    <div className='text-xs min-h-full flex flex-col justify-center flex-initial mx-2 font-bold text-slate-700'>
                        <span>Proof</span>
                        <span>Steps</span>
                    </div>
                }


                {/**
                 * 
                 * 
                 * Proof steps
                 * 
                 */}

                {
                    props.inProof && 
                    <GraphTool 
                        selected={props.graphTool === 'insert_double_cut'}
                        onClick={() => props.graphTool === 'insert_double_cut' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('insert_double_cut')}
                    >
                        Insert Double Cut
                    </GraphTool>
                }

                {
                    props.inProof && 
                    <GraphTool
                        selected={props.graphTool === 'erase_double_cut'}
                        onClick={() => props.graphTool === 'erase_double_cut' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('erase_double_cut')}
                    >
                        Erase Double Cut
                    </GraphTool>
                }
                
                {
                    props.inProof && 
                    <GraphTool
                        selected={props.graphTool === 'insert_subgraph'}
                        onClick={() => props.graphTool === 'insert_subgraph' 
                                        ? props.handleSetGraphTool('auto_disable_insert') 
                                        : props.handleSetGraphTool('insert_subgraph')}
                    >
                        Insert Subgraph
                    </GraphTool>
                }

                {
                    props.inProof && 
                    <GraphTool
                        selected={props.graphTool === 'erase_subgraph'}
                        onClick={() => props.graphTool === 'erase_subgraph' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('erase_subgraph')}
                    >
                        Erase Subgraph
                    </GraphTool>
                }


                {
                    props.inProof && 
                    <GraphTool
                        selected={props.graphTool === 'iteration'}
                        onClick={() => props.graphTool === 'iteration' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('iteration')}
                    >
                        Iteration
                    </GraphTool>
                }

                {
                    props.inProof && 
                    <GraphTool
                        selected={props.graphTool === 'deiteration'}
                        onClick={() => props.graphTool === 'deiteration' ? props.handleSetGraphTool(null) : props.handleSetGraphTool('deiteration')}
                    >
                        Deiteration
                    </GraphTool>
                }
                
            </div>


            <button 
                className='bg-slate-300 dark:bg-slate-500 border-2 border-solid border-slate-700 hover:bg-slate-200 px-2 mb-2 font-mono text-slate-700 font-bold'
                onClick={handleStartProofClicked}
            >
                Start Proof
            </button>
        </div>
    );
}