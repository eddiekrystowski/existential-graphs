import React from 'react';
import { useState, useEffect, useRef  } from 'react';
import {BrowserRouter, Route, Router, Routes} from "react-router-dom";

import "../../main.css"; // Tawilwind stylesheet
//import Workspace from '../Workspace/Workspace.jsx';
import Header from '@components/Header/Header.jsx';
import Dashboard from '@views/Dashboard/Dashboard';
import Create from '@views/Create/Create';
import Login from '../../views/Login/Login';
//import Proof from '@view/Proof';
import $ from 'jquery';


export default function App(props) {
    const workspace = useRef(null);

    const [muted, setMuted] = useState(true);
    const [sound, setSound] = useState(null);

    //initial render
    useEffect(() => {
        
    }, []);


    //pause sound if muted
    useEffect(() => {
        if(muted && sound != null) {
            sound.pause();
            sound.currentTime = 0;
        }
    }, [muted, sound]);

    const handleMuteToggle  = () => {
        setMuted(() => !muted);

        // const mute_button = getMenuItem("Toggle Sound");
        // const mute_button_label = mute_button.find('.menu-item-label');
        // mute_button.toggleClass('mute-active');

        // if (mute_button.hasClass('mute-active')) {
        //     mute_button_label.html('Unmute');
        // }
        // else {
        //     mute_button_label.html('Mute');
        // }
    }

    const handlePlayAudio = (audio) => {
        if (muted) return;
        setSound(() => audio);
        audio.play();
    }

    /*
    const getGraphForExport = () => {
        return workspace.current.mainPaper.current.sheet.graph; 
    }

    const exportMainGraph = () => {
        workspace.current.mainPaper.current.exportAsFile();
    }

    const importMainGraph = () => {
        workspace.current.mainPaper.current.import();
    }

    const setGraphDataOnImport = (data) => {
        const graph = workspace.current.mainPaper.current.sheet.graph; 
        graph.clear();
        const dataObj = JSON.parse(data);
        for (let i = 0; i < dataObj.cells.length; i++) {
            if (dataObj.cells[i].type === "dia.Element.Cut") {
                dataObj.cells[i].sheet = this.workspace.current.mainPaper.current.sheet;
            }
        }   

        graph.fromJSON(dataObj);
    }
    */

    return (
        <div id="app" className="app text-black dark:text-white bg-white dark:bg-slate-700">
            <BrowserRouter>
                <Header muted={muted} handleMuteToggle={handleMuteToggle}/>
                <Routes>
                    <Route path="/" element={
                        <Dashboard/>
                    } />
                    <Route path="/create/:id" element={
                        <Create handlePlayAudio={handlePlayAudio}/>
                    } />
                    <Route path="/proof" element={
                        <Create handlePlayAudio={handlePlayAudio}/>
                    } />
                    <Route path="/login" element={
                        <Login/>
                    } />
                </Routes>

                {/* <MenuBar id="header" muted={this.state.muted} handleMuteToggle={this.handleMuteToggle}/>
                <Workspace paper_id="main-paper" ref={this.workspace} handlePlayAudio={this.handlePlayAudio}></Workspace> */}
            </BrowserRouter>
        </div>
    );
}


function getMenuItem(item_label) {
    return $('.header-bar').find(`[aria-label="${item_label}"]`)
}