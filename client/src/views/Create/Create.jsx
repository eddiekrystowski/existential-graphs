import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Toolbar from '@components/Toolbar/Toolbar.jsx';
import { CreatePaperComponent } from '@components/Paper';
import ExistentialGraph from '../../existential-graph/ExistentialGraph';

import { addToLocalGraphData, getLocalGraphByID } from '../../util/util';

export default function Create(props) {

    const { id } = useParams();
    console.log('default name', getLocalGraphByID(id).name);
    const [graphName, setGraphName] = useState(getLocalGraphByID(id).name);
    const [eg, setExistentialGraph] = useState(null);

    useEffect(() => {
      setExistentialGraph(new ExistentialGraph('main-paper', id));
    }, [id]);


    const handleSaveGraph = () => {
      console.log('CREATE VIEW SAVING GRAPH', graphName, id);
      const graphJSON = eg.exportGraphAsJSON();
      console.log(graphJSON)
      addToLocalGraphData(id, graphJSON, graphName)
    }

    const handleGraphNameUpdate = (newName) => {
      setGraphName(newName);
    }

    const handleSetGraphTool = (graphTool) => {
      console.log('set graph tool:', graphTool);
      eg.graphTool = graphTool;
    }


    return (
        <div id="create-root">
          <Toolbar
            id={id}
            graphName={graphName}
            handleGraphNameUpdate={handleGraphNameUpdate}
            handleSaveGraph={handleSaveGraph}
            handleSetGraphTool={handleSetGraphTool}
          />
          <CreatePaperComponent
            paper={eg}
            dom_id="main-paper" 
            graph_id={id}
          />
        </div>
    );
}