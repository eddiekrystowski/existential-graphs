import React from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function ToolbarItem(props) {
  return (
    <Menu as="div">
        <Menu.Button className="hover:bg-slate-300 h-max">
          { props.name }
        </Menu.Button>
        
        {/* 
        FIXME: need to disable transition for now since it creates its own z-index context causing the dropdown from the toolbar to be hidden
              by the paper
        <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        > */}
          <Menu.Items className="z-10 origin-bottom-left absolute w-56 shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none p-1 ">
            {props.children}
          </Menu.Items>
        {/* </Transition> */}
        
    </Menu>

  );
}