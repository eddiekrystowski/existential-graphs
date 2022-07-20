import React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Toolbar from '@components/Toolbar/Toolbar.jsx';
import { CreatePaperComponent } from '@components/Paper';

export default function Create(props) {

    const { id } = useParams();
    const [graphName, setGraphName] = useState();

    return (
        <div id="create-root">
          <Toolbar/>
          <CreatePaperComponent dom_id="main-paper" graph_id={id}/>
        </div>
    );
}