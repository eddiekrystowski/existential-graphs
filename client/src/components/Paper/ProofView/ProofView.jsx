import { useState } from "react"

export default function ProofView(props) {

    const [expanded, setExpanded] = useState(false);

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    }

    return (
        <div id='proof-view' className="absolute right-10 top-8 w-96 ">
            { 
            props.show &&    
            <button 
                type='button' 
                className="text-left px-3 py-3 collapse bg-slate-400 hover:bg-slate-200 border-solid border-2 border-slate-600 w-full flex flex-row justify-between items-center"
                onClick={handleToggleExpand}
            >
                Proof View
                <span className="text-3xl">{expanded ? '-' : '+' }</span>
            </button>
            }

            { 
            props.show && expanded &&  
            <div></div>
            }
            
        </div>
    )
}