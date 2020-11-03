import * as React from "react";
import ".././main.css";
import * as rs from 'react-bootstrap';
import { Image } from 'cloudinary-react';
import { XCircle, Plus } from 'react-bootstrap-icons';
import dataholding from './Dataholding';
import Login from './Login';
import { Session } from "inspector";

export default class imageView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            clickedThumbnail:0
        }
    }

    //klikattu jotain thumbnailia, jotta saadaan iso kuva kyseisestä thumbnailista
    onClick1 = (event) => {
        dataholding.setClickedNaviButton(false);
        this.setState({ clickedThumbnail: event.target.id });
    }

    //klikattu isoa kuvaa, jotta palattaisiin thumbnail näkymään
    onClick2 = (event) => {
        dataholding.setClickedNaviButton(true);
        this.setState({ clickedThumbnail: 0 });
    }

    //klikattu ison kuvan vasenta laitaa, jotta siirryttäisiin aiempaan kuvaan
    onClick3 = (event) => {
        if (parseInt(this.state.clickedThumbnail) > 0) {
            dataholding.setClickedNaviButton(false);
            let temp = parseInt(this.state.clickedThumbnail) - 1;
            this.setState({ clickedThumbnail: temp });
        }
    }

    //klikattu ison kuvan oikeaa laitaa, jotta siirryttäisiin seuraavaan kuvaan
    onClick4 = (event) => {
        let temp = parseInt(this.state.clickedThumbnail) + 1;
        if (temp < this.props.imagesByButtonClicked.length) {
            dataholding.setClickedNaviButton(false);
            this.setState({ clickedThumbnail: temp });
        }
    }

    delete = (event) => {
        let deleteImg;
        /**
         * Napataan kuvan tietokannan id. Ikonin sisään tulee toinen divi luontivaiheessa joten piti tehdä alla oleva ratkaisu if else if 
         */
        if (event.target.parentElement.getAttribute("data-setid")) deleteImg = event.target.parentElement.getAttribute("data-setid");
        else if (event.target.parentElement.parentElement.getAttribute("data-setid")) deleteImg = event.target.parentElement.parentElement.getAttribute("data-setid");
        console.log(deleteImg);
        alert("Poista kuva");


    }

    add = (event) => {
        alert("Lisää kuva");
    }

    render() {
        let storageusername = sessionStorage.getItem("username");
        if (this.props.imagesByButtonClicked.length > 0 && storageusername !== null) {
            let images = [];

            //jos clickedNaviButton on true, käyttäjä ei ole klikannut yhtään thumbnailia
            if (dataholding.getClickedNaviButton() === true) {

                //Täällä luodaan thumbnail näkymä useilla pikkukuvilla
                images = this.props.imagesByButtonClicked.map((picture, id) => {
                    return (
                        <div className="imageDiv" onClick={this.onClick1} data-setid={picture.id} key={id}>
                            <Image className="thumbnail" src={picture.mURL} width="198" height="198" gravity="center" crop="thumb" id={id} />
                            <XCircle size={24} className="deleteImage" onClick={(e) => { e.stopPropagation(); this.delete(e) }} />
                        </div>
                    )
                });
            } else {

                //Täällä luodaan käyttäjän klikkaamasta thumbnailista yksi iso näkymän täyttävä kuva
                let index = parseInt(this.state.clickedThumbnail);
                let picture = this.props.imagesByButtonClicked[index];
                images.push(
                    <div className="bigImageDiv" >
                        <table style={{ width: "100%" }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: "10px" }} onClick={this.onClick3} className="columnStyle"></td>
                                    <td>
                                        <table style={{ width: "100%" }} onClick={this.onClick2}>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <Image src={picture.mURL} width="100%" gravity="center" id={index} />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <p className="legendStyle">{picture.mLegend}</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td style={{ width: "10px" }} onClick={this.onClick4} className="columnStyle"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            }

            return (
                <div className="main_page">
                    {images}

                    <div className="imageDiv addImage" onClick={this.add}>
                        <Plus size={64} />
                    </div>

                </div>
            )
        } else if (storageusername !== null) {
            return (
                <div className="main_page">
                    <div className="imageDiv addImage" onClick={this.add}>
                        <Plus size={64} />
                    </div>
                </div>
            )
        } else {
            return (
                <div className="main_page">
                    <div>
                        <h1>Welcome to PicturePortal</h1>
                        <Login />
                    </div>
                </div>
            )
        }
    }
}