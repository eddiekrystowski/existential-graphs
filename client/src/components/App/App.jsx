import React from 'react';
import {BrowserRouter, Route, Router, Routes} from "react-router-dom";

import '../../index.css'; 
import MenuBar from '../MenuBar/MenuBar.jsx';
import Workspace from '../Workspace/Workspace.jsx';
import Navbar from '../Navbar/Navbar.jsx';
import Dashboard from '../Dashboard/Dashboard';
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

    render() {
        return (
            <div id="app" className="app">
                <BrowserRouter>
                    <Navbar/>
                    <br/>
                    <Routes>
                        <Route path="/" exact element={<Dashboard/>} />
                        <Route path="/create" exact element={
                            <Workspace 
                                paper_id="main-paper" 
                                ref={this.workspace} 
                                handlePlayAudio={this.handlePlayAudio}>
                            </Workspace>
                        } />
                    </Routes>

                    {/* <MenuBar id="header" muted={this.state.muted} handleMuteToggle={this.handleMuteToggle}/>
                    <Workspace paper_id="main-paper" ref={this.workspace} handlePlayAudio={this.handlePlayAudio}></Workspace> */}
                </BrowserRouter>
            </div>
        );
    }
}


function getMenuItem(item_label) {
    return $('.header-bar').find(`[aria-label="${item_label}"]`)
}