import React from 'react';
import Toolbar from '@components/Toolbar/Toolbar';
import CreatePaper from '@components/CreatePaper/CreatePaper';

export default function Create() {
    return (
        <div id="create-root">
          <Toolbar/>
          <CreatePaper/>
        </div>
    );
}