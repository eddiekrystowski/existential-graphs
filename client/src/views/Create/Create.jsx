import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Toolbar from '@components/Toolbar/Toolbar.jsx';
import { CreatePaperComponent } from '@components/Paper';
import ExistentialGraph from '../../existential-graph/ExistentialGraph';
import ExistentialHypergraph from '../../existential-graph/ExistentialHypergraph';

import { addToLocalGraphData, getLocalGraphByID } from '../../util/util';

export default function Create(props) {

    const { id } = useParams();
    console.log('default name', getLocalGraphByID(id).name);
    const [graphName, setGraphName] = useState(getLocalGraphByID(id).name);
    const [existentialHypergraph, setExistentialHypergraph] = useState(new ExistentialHypergraph());
    const [eg, setExistentialGraph] = useState(null);
    const [graphTool, setGraphTool] = useState('');

    useEffect(() => {
      setExistentialGraph(new ExistentialGraph('main-paper', id, existentialHypergraph));
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
      if (graphTool === 'auto_disable_insert') {
        graphTool = null;
        eg.graphController.disableInsertMode();
        eg.steps.push('disable_insert_mode');
      }
      console.log('set graph tool:', graphTool);
      eg.graphTool = graphTool;
      setGraphTool(graphTool);
    }


    return (
        <div id="create-root">
          <Toolbar
            id={id}
            graphName={graphName}
            handleGraphNameUpdate={handleGraphNameUpdate}
            handleSaveGraph={handleSaveGraph}
            handleSetGraphTool={handleSetGraphTool}
            graphTool={graphTool}
          />
          <CreatePaperComponent
            paper={eg}
            dom_id="main-paper" 
            graph_id={id}
          />
        </div>
    );
}