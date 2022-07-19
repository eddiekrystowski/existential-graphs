import React from 'react';
import { Menu } from '@headlessui/react';

export default function ToolbarItemOption(props) {
    return (
        <Menu.Item><p onClick={props.action} className='px-1 hover:cursor-pointer hover:bg-slate-100'>{props.children}</p></Menu.Item>
    )
}