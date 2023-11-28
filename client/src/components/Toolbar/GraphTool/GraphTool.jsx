import React from 'react';

import addCutPng from "@assets/images/addcut.png";
import insertDoubleCutPng from "@assets/images/insertdoublecut.png";
import removeDoubleCutPng from "@assets/images/removedoublecut.png";
import insertSubgraphPng from "@assets/images/insertsubgraph.png";
import removeSubgraphPng from "@assets/images/removesubgraph.png"; 
import copySubgraphPng from "@assets/images/copysubgraph.png";
import pasteSubgraphPng from "@assets/images/pastesubgraph.png";
import iterationPng from '@assets/images/iteration.png';
import deiterationPng from '@assets/images/deiteration.png';

const imageMap = {
  'Cut': addCutPng,
  'Insert Double Cut' : insertDoubleCutPng,
  'Erase Double Cut' : removeDoubleCutPng,
  'Insert Subgraph' : insertSubgraphPng,
  'Erase Subgraph' : removeSubgraphPng,
  'Copy Subgraph' : copySubgraphPng,
  'Paste Subgraph' : pasteSubgraphPng,
  'Iteration' : iterationPng,
  'Deiteration' : deiterationPng,
  'Confirm Insertion': insertSubgraphPng,
  'Cancel Insertion': removeSubgraphPng
};

/**
 * Insert Double Cut
Erase Double Cut
Insert Subgraph
Erase Subgraph
Copy Subgraph
Paste Subgraph
 */

export default function GraphTool(props) {

  let text_color = props.selected ? 'text-red-400' : '';

  if (props.is_auto) {
    text_color = 'hover:text-purple-600 text-blue-600';
  }

  return (
    <div className='z-9 w-max h-max bg-slate-200 dark:bg-slate-500 flex flex-col px-2 font-mono hover:cursor-pointer hover:bg-slate-300 '>
            <button onClick={props.onClick} className='inline-block min-h-[2rem] min-w-[2rem] m-auto'>
              <img src={imageMap[props.children]} alt={props.children + '.png'}></img>
            </button>
            <span className={`h-min ${text_color}`}>
              { props.requiresConfirmation 
                ? (
                  props.waitingOnConfirmation
                  ? <div className='z-10 flex justify-between w-full mr-2 mb-1 mt-1 min-h-max'>
                      <button onClick={()=>props.handleConfirm()} className='font-mono text-xs text-green-700 bg-emerald-100 p-1 rounded-xl hover:bg-emerald-200'>Confirm</button>
                      <button onClick={()=>props.handleCancel()} className='font-mono text-xs text-red-700 bg-red-100 p-1 rounded-xl hover:bg-red-200'>Cancel</button>
                    </div>
                  : props.children
                )
                : props.children}
            </span>
    </div>
  );
}