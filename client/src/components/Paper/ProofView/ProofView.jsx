import { useState } from "react"
import ProofStep from "./ProofStep";



export default function ProofView(props) {

    const [expanded, setExpanded] = useState(true);

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    }

    return (
        <div>
            <div id='proof-view' className="absolute right-10 top-8 w-96 ">
                { 
                props.show &&    
                <button 
                    type='button' 
                    className="text-left font-mono font-bold text-slate-600 px-3 py-3 collapse bg-slate-300 hover:bg-slate-200 border-solid border-2 border-slate-600 w-full flex flex-row justify-between items-center"
                    onClick={handleToggleExpand}
                >
                    Proof View
                    <span className="text-3xl">{expanded ? '-' : '+' }</span>
                </button>
                }

                { 
                props.show && expanded &&  
                <div className="w-full bg-slate-100 border-solid border-2 border-slate-600 border-t-0 min-h-[200px] max-h-96 overflow-y-scroll">
                    {
                        props.hypergraph.toArray().map((node, i) => (
                            <ProofStep
                                rule={node.rule}
                                verified={node.verified}
                                selected={i === props.index}
                                key={i}
                                onClick={() => props.handleChangeHypergraphIndex(i)}
                            />
                        ))

                        // this.state.data.map((history_item, num) => (
                        //     (num === 0) ?  null :
                        //     <ProofStep 
                        //         num={num}
                        //         total={this.state.data.length}
                        //         id={this.props.id_prefix + num}
                        //         cells={history_item}
                        //         active={this.state.index === num}
                        //         onClick={this.handleJump.bind(this, num)}
                        //         key={num}
                        //     />
                        // ))
                    }
                </div>
                }
                    
            </div>

            <div id='proof-view-bottom' className="fixed bottom-10 inset-x-1/2 w-96 translate-x-[-50%]">
                { 
                props.show &&    
                <div className="flex flex-row justify-between align-items"> 
                    <button onClick={() => props.handleChangeHypergraphIndex(props.index-1)} className="px-4 py-2 text-2xl text-slate-500 font-bold hover:bg-slate-200 rounded-xl">&lt;</button>
                    <p className="text-2xl font-mono text-slate-500 m-auto"> Step {props.index + 1} / {props.hypergraph.toArray().length} </p>
                    <button onClick={() => props.handleChangeHypergraphIndex(props.index + 1)} className="px-4 py-2 text-2xl text-slate-500 font-bold hover:bg-slate-200 rounded-xl">&gt;</button>
                </div>
                
                }
                    
            </div>
        </div>
        
    )
}