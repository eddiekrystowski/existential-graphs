import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Toolbar from '@components/Toolbar/Toolbar.jsx';
import { CreatePaperComponent } from '@components/Paper';
import  CreatePaper  from '@scripts/CreatePaper';

import { create } from 'lodash';
import { addToLocalGraphData, getLocalGraphByID } from '../../util/util';

export default function Create(props) {

    const { id } = useParams();
    console.log('default name', getLocalGraphByID(id).name);
    const [graphName, setGraphName] = useState(getLocalGraphByID(id).name);
    const [paper, setPaper] = useState(null);


    useEffect(() => {
      setPaper(new CreatePaper('main-paper', id));
    }, [id]);


    const handleSaveGraph = () => {
      console.log('CREATE VIEW SAVING GRAPH', graphName, id);
      const graphJSON = paper.exportGraphAsJSON();
      console.log(graphJSON)
      addToLocalGraphData(id, graphJSON, graphName)
    }

    const handleGraphNameUpdate = (newName) => {
      setGraphName(newName);
    }


    return (
        <div id="create-root">
          <Toolbar
            id={id}
            graphName={graphName}
            handleGraphNameUpdate={handleGraphNameUpdate}
            handleSaveGraph={handleSaveGraph}
          />
          <CreatePaperComponent
            paper={paper}
            dom_id="main-paper" 
            graph_id={id}
          />
        </div>
    );
}