import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Toolbar from '@components/Toolbar/Toolbar.jsx';
import { CreatePaperComponent } from '@components/Paper';
import ExistentialGraph from '../../existential-graph/ExistentialGraph';
import ExistentialHypergraph from '../../existential-graph/ExistentialHypergraph';

import { addToLocalGraphData, getLocalGraphByID } from '../../util/util';
import ProofView from '../../components/Paper/ProofView/ProofView';

const GRAPH_STATE = {
  CREATE: 0,
  PROOF: 1
}

function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update state to force render
  // A function that increment 👆🏻 the previous state like here 
  // is better than directly setting `setValue(value + 1)`
}

export default function Create(props) {

    const forceUpdate = useForceUpdate();

    const { id } = useParams();
    console.log('default name', getLocalGraphByID(id).name);
    const [graphName, setGraphName] = useState(getLocalGraphByID(id).name);
    const [existentialHypergraph, setExistentialHypergraph] = useState(new ExistentialHypergraph());
    const [eg, setExistentialGraph] = useState(null);
    const [graphTool, setGraphTool] = useState('');
    const [inProof, setInProof] = useState(false);

    useEffect(() => {
      setExistentialGraph(new ExistentialGraph('main-paper', id, existentialHypergraph));
    }, [id]);

    useEffect(() => {
      if (inProof) {
        console.log('proof successfully started');
        setExistentialHypergraph(new ExistentialHypergraph(eg));
      }
    }, [inProof]);

    useEffect(() => {
      console.log('new hypergraph', existentialHypergraph)
      console.log('eg', eg)
      if (eg) eg.hypergraph = existentialHypergraph;
    }, [existentialHypergraph])

    const handleSaveGraph = () => {
      console.log('CREATE VIEW SAVING GRAPH', graphName, id);
      const graphJSON = eg.exportGraphAsJSON();
      console.log(graphJSON)
      addToLocalGraphData(id, graphJSON, graphName)
    }

    const handleGraphNameUpdate = (newName) => {
      setGraphName(newName);
    }

    const handleSetGraphTool = (graphTool, isProofTool=false) => {
      if (graphTool === 'auto_disable_insert') {
        graphTool = null;
        eg.graphController.disableInsertMode();
        eg.steps.push('disable_insert_mode');
      }
      console.log('set graph tool:', graphTool);
      eg.graphTool = graphTool;
      eg.isProofTool = isProofTool;
      setGraphTool(graphTool);
      eg.onGraphToolUse = () => {
        setGraphTool(null);
        eg.graphTool = null;
        eg.isProofTool = false;
      }

      if (graphTool === 'iteration' || graphTool === 'deiteration') {
        console.log('adding (de)iter step');
        existentialHypergraph.addStep(eg.graphController.graph_id, graphTool, eg.graphController.graph.getCells());
        console.log('existential hypergraph', existentialHypergraph);
        eg.onGraphToolUse();
        forceUpdate();
      }
    }

    const handleSetProofTool = (graphTool) => {
      handleSetGraphTool(graphTool, true);
    }

    const handleStartProofClicked = () => {
      console.log('starting proof for graph ' + id);
      if (!inProof) {
        setInProof(true);
        eg.proofMode = true;
        props.handleGraphStateChange(GRAPH_STATE.PROOF);
      }
    }


    return (
        <div id="create-root">
          <Toolbar
            id={id}
            graphName={graphName}
            handleGraphNameUpdate={handleGraphNameUpdate}
            handleSaveGraph={handleSaveGraph}
            handleSetGraphTool={handleSetGraphTool}
            handleSetProofTool={handleSetProofTool}
            handleStartProofClicked={handleStartProofClicked}
            graphTool={graphTool}
            inProof={inProof}
          />
          <div className='w-screen h-max bg-slate-200 dark:bg-slate-500 flex flex-row relative'>
            <CreatePaperComponent
              paper={eg}
              dom_id="main-paper" 
              graph_id={id}
            />
            <ProofView show={inProof} hypergraph={existentialHypergraph}/>
          </div>
        </div>

    );
}