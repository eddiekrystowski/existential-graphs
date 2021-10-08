import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './components/App/App';
import  _  from 'lodash'

console.log("Starting...");
window.joint = joint;

window.action = null; 
window.mode = 'create';

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);