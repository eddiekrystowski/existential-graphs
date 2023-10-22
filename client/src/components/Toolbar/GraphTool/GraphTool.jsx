import React from 'react';

export default function GraphTool(props) {
  return (
    <div className='z-9 w-max h-max bg-slate-200 dark:bg-slate-500 flex flex-col px-2 font-mono'>
            <button onClick={props.onClick} className='inline-block min-h-[2rem] min-w-[2rem] bg-slate-600'>
            </button>
            <span className='h-min'>{props.children}</span>
    </div>
  );
}