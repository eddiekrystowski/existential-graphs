import React from 'react';

import '../../index.css'; 
import MenuBar from '../MenuBar/MenuBar.jsx';
import Workspace from '../Workspace/Workspace.jsx';
import $ from 'jquery'


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.workspace = React.createRef();
        this.sound = null;
        this.state = {
            muted: true
        }
    }

    componentDidMount() {
        console.log('WORKSPACE', this.workspace);
        this.getGraphForExport = () => {
            console.log('EXPORT: ', this.workspace.current); 
            return this.workspace.current.mainPaper.current.sheet.graph; 
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.muted && this.sound) {
            this.sound.pause();
            this.sound.currentTime = 0;
        }
    }

    handleMuteToggle = () => {
        this.setState({
            muted: !this.state.muted
        });

        const mute_button = getMenuItem("Toggle Sound");
        const mute_button_label = mute_button.find('.menu-item-label');
        mute_button.toggleClass('mute-active');

        if (mute_button.hasClass('mute-active')) {
            mute_button_label.html('Unmute');
        }
        else {
            mute_button_label.html('Mute');
        }
        
    }

    handlePlayAudio = (audio) => {
        if (this.state.muted) return;
        this.sound = audio;
        this.sound.play();
    }

    getGraphForExport = () => {
        
    }

    render() {
        return (
            <div id="app" className="app">
                <MenuBar 
                    id="header" 
                    muted={this.state.muted} 
                    handleMuteToggle={this.handleMuteToggle}
                    getGraphForExport={this.getGraphForExport}
                />
                <Workspace paper_id="main-paper" ref={this.workspace} handlePlayAudio={this.handlePlayAudio}></Workspace>
            </div>
        );
    }
}


function getMenuItem(item_label) {
    return $('.header-bar').find(`[aria-label="${item_label}"]`)
}