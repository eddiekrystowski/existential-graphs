import React from 'react';
import "@root/main.css"; // Tawilwind stylesheet
import ToolbarItem from './ToolbarItem/ToolbarItem';
import ToolbarItemOption from './ToolbarItemOption/ToolbarItemOption';
import { Menu } from '@headlessui/react';

export default function Toolbar( props ) {

    function handleImport() {}
    function handleExport() {}

    function handleGraphNameLoseFocus(e) {
        e.target.value = e.target.value.trim();
        if (!e.target.value) e.target.value = "Untitled Graph";
    }
  
    return (
      <div className='w-screen h-max bg-slate-200 dark:bg-slate-500 flex flex-col px-2 font-mono pt-2 '>
          <div>    
            <input 
              onBlur={handleGraphNameLoseFocus} 
              placeholder="Untitled Graph" 
              type="text" 
              defaultValue="Untitled Graph" 
              className="outline-none bg-transparent border-none hover:ring-1 hover:ring-black font-semibold text-xl font-sans"
            />
          </div>
          <div className='flex flex-row gap-4'>
          <ToolbarItem name="File">
              <div className="py-1">
                  <ToolbarItemOption action={handleImport}>Import</ToolbarItemOption>
                  <ToolbarItemOption>Export</ToolbarItemOption>
                  <ToolbarItemOption>Save</ToolbarItemOption>
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
      
    );
}