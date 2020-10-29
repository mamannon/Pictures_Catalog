import * as React from 'react';
import { Route } from 'react-router';
import { Button, Table } from 'react-bootstrap';
import Navi from './components/Navi';
import Images from './components/imageView';
import Overlay from './components/overlay';
import dataholding from './components/Dataholding';

import "./App.css";


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            images: [],
            imageSet: [],
            chosenImageSet: [],
            overlayState:0//0 = ei näytetä overlayta, 1 = lisää kuvasetti, 2 = lisää kuva, 3 = poista kuva
        } 

    }

    getPicturesBySet = () => {
        let request = {
            method: "GET",
            headers: { "Content-type": "application/json" }
        }
        //Haetaan kuvasetit
        fetch("/api/Pictures/GetSets", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);
                    let temp = new Array();
                    for (let i = 0; i < data.length; i++) {
                        temp.push([data[i].mPictureSet, data[i].mPSID]);
                    }
                    this.setState({ imageSet: temp });
                }).catch(error => {
                    console.log("Error parsing JSON:", error);
                })
            } else {
                console.log("Server responded with status:", response.status);
            }
        }).catch(error => {
            console.log("Server responded with error:", error);
        });
    }
    /**
     * 
     * Tässä katsotaan kuinka monta kuvaa tulee kyseisen painetun napin kuvasettiin ja viedään data imageView.js komponenttiin
     * 
     */
    buttonState = (id) => {
        dataholding.setClickedNaviButton(true);
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" }
        }

        fetch("/api/Pictures/GetPictures/" + id, request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);
                    this.setState({ chosenImageSet: data });
                }).catch(error => {
                    console.log("Error parsing JSON:", error);
                })
            } else {
                console.log("Server responded with status:", response.status);
            }
        }).catch(error => {
            console.log("Server responded with error:", error);
        });
        this.setState({ chosenImageSet: [] });//tyhjennetään
        
    }

    overlayVisibility = (data) => {
        this.setState({ overlayState: data });
        if (this.state.overlayState === 0) this.getPicturesBySet();
    }


    componentDidMount() {
        this.getPicturesBySet();
        
    }
    

    render() {
        let overlay;
        if (this.state.overlayState > 0) overlay = <Overlay contentId={this.state.overlayState} closeOverlay={ this.overlayVisibility}/>;

        return (
            <div className="App">
                <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet} overlay={ this.overlayVisibility}/>
                <Images imagesByButtonClicked={this.state.chosenImageSet}/>
                {overlay}
            </div>
        );
    }
}

export default App;

/*
 *
 * KOODI MITÄ EI VIELÄ KÄYTETÄ JNE
 * 
 */

/*
    //Haetaan kuvat kannasta
    componentDidMount() {
        
       
    }*/
