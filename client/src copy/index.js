import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './components/App/App';

console.log("Starting...");
window.joint = joint;


const APP = ReactDOM.render(
    <App/>,
    document.getElementById('root')
);

console.log(APP);
console.log(APP.workspace);
