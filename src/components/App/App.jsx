import React from 'react';

import '../../index.css'; 
import MenuBar from '../MenuBar/MenuBar.jsx';
import Workspace from '../Workspace/Workspace.jsx';


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.workspace = React.createRef();
    }

    componentDidMount() {
        console.log('WORKSPACE', this.workspace);
    }

    render() {
        return (
            <div id="app" className="app">
                <MenuBar id="header"/>
                <Workspace paper_id="main-paper" ref={this.workspace} ></Workspace>
            </div>
        );
    }
}