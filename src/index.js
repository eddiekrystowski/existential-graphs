import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './components/App/App';


console.log("Starting...");
window.joint = joint;

window.action = null; 
window.mode = 'create';


let application = ReactDOM.render(
    <App/>,
    document.getElementById('root')
);

export {application};