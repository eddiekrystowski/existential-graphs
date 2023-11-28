
const ruleMap = {
    'Start': 'Proof Start',
    'insert_double_cut': 'Insert Double Cut',
    'erase_double_cut': 'Erase Double Cut',
    'insert_subgraph': 'Insert Subgraph',
    'erase_subgraph': 'Erase Subgraph',
    'copy_subgraph': 'Copy Subgraph',
    'paste_subgraph': 'Paste Subgraph'
}

export default function ProofStep(props) {
    return (
        <div className="w-full px-6 py-3 text-lg border-b-2 border-slate-400 hover:cursor-pointer hover:bg-slate-300 font-mono ">
            { ruleMap[props.rule] ||  '???'}
        </div>
    )
}