import { useState } from "react"
import ProofStep from "./ProofStep";



export default function ProofView(props) {

    const [expanded, setExpanded] = useState(true);

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    }



    

    return (
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
                            key={i}
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
    )
}