import * as React from "react";
import ".././main.css";
import * as rs from 'react-bootstrap';
import { Image } from 'cloudinary-react';
import { XCircle, Plus, ChevronLeft, ChevronRight, InfoCircle } from 'react-bootstrap-icons';
import dataholding from './Dataholding';
import Login from './Login';
import { Session } from "inspector";
import { Link } from "react-router-dom";

export default class ImageView extends React.Component {

    constructor(props) {
        super(props);
        this.thumbnail = React.createRef();
        this.state = {
            clickedThumbnail:0
        }
    }

    /**
     * Klikattu jotain thumbnailia, jotta saadaan iso kuva kyseisestä thumbnailista.
     * @param event
     */
    onClick1 = (event) => {
        dataholding.setClickedNaviButton(false);
        this.setState({ clickedThumbnail: event.target.id });
    }

    /**
     * Klikattu isoa kuvaa, jotta palattaisiin thumbnail näkymään.
     * @param event
     */
    onClick2 = (event) => {
        dataholding.setClickedNaviButton(true);
        this.setState({ clickedThumbnail: 0 });
    }

    /**
     * Klikattu ison kuvan vasenta laitaa, jotta siirryttäisiin aiempaan kuvaan.
     * @param event
     */
    onClick3 = (event) => {
        if (parseInt(this.state.clickedThumbnail) > 0) {
            dataholding.setClickedNaviButton(false);
            let temp = parseInt(this.state.clickedThumbnail) - 1;
            this.setState({ clickedThumbnail: temp });
        }
    }

    /**
     * Klikattu ison kuvan oikeaa laitaa, jotta siirryttäisiin seuraavaan kuvaan.
     * @param event
     */
    onClick4 = (event) => {
        let temp = parseInt(this.state.clickedThumbnail) + 1;
        if (temp < this.props.imagesByButtonClicked.length) {
            dataholding.setClickedNaviButton(false);
            this.setState({ clickedThumbnail: temp });
        }
    }

    /**
     * Käyttäjä haluaa poistaa valitsemansa kuvan kuvasetistä.
     */
    remove = (event) => {
        let removeImg = event.currentTarget.id;

        //Kysytään käyttäjältä varmistus, että hän todella haluaa poistaa kuvan kuvasetistä.
        if (window.confirm("Do you want to remove this picture?")) {
            console.log("Removing image " + removeImg);
            let picture = {
                PID: removeImg,
                pictureSet: this.props.imagesByButtonClicked.find(e => e.pictureId == removeImg).mPictureSet
//                url: this.props.imagesByButtonClicked.find(e => e.pictureId == removeImg).mURL 
            };
            this.props.removePicture(picture);
        }
    }


    edit = (event) => {
        let koe = 1;
    }


    render() {
        let storageusername = sessionStorage.getItem("user");

        //Jos käyttäjä on klikannut katseltavakseen jonkun kuvasetin.
        if (this.props.imagesByButtonClicked.length > 0 &&
            storageusername !== null && storageusername.length > 0) {
            let images = [];

            //jos clickedNaviButton on true, käyttäjä ei ole klikannut yhtään thumbnailia
            if (dataholding.getClickedNaviButton() === true) {

                //Täällä luodaan thumbnail näkymä useilla pikkukuvilla
                images = this.props.imagesByButtonClicked.map((picture, index) => {
                    return (
                        <span className="imageDiv"
                            onClick={this.onClick1}
                            key={picture.pictureId}>
                                <Image className="thumbnail"
                                    src={picture.mURL}
                                    gravity="center"
                                    crop="thumb"
                                    id={index} />
                                <XCircle size={24}
                                    className="deleteIcon"
                                    onClick={(e) => { e.stopPropagation(); this.remove(e) }}
                                    id={picture.pictureId} />
                                <InfoCircle size={24}
                                    className="editIcon"
                                    onClick={(e) => { e.stopPropagation(); this.edit(e) }}
                                    id={picture.pictureId} />
                        </span>
                    )
                });

                //Lisätään perään thumbnail, jossa linkki uuden kuvan lisäämiseen
                images.push(
                    <div className="imageDiv" key="0">
                        <Link to="/newpic" aria-orientation="horizontal">
                            <Plus size={64} />
                        </Link>
                    </div>
                );

            } else {

                //Täällä luodaan käyttäjän klikkaamasta thumbnailista yksi iso näkymän täyttävä kuva.
                let index = parseInt(this.state.clickedThumbnail);
                let picture = this.props.imagesByButtonClicked[index];
                images.push(
                    <div className="bigImageDiv" >
                        <table style={{ width: "100%" }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: "10px" }} onClick={this.onClick3} className="columnStyle">
                                        <ChevronLeft size={16} color="#0040ff"/>
                                    </td>
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
                                                        <div className="legendStyle">{picture.mLegend}</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td style={{ width: "10px" }} onClick={this.onClick4} className="columnStyle">
                                        <ChevronRight size={16} color="#0040ff"/>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            }

            return (
                <div className="main_page">
                    {images}
                </div>
            )

        //Jos mitään kuvasettiä ei ole valittu.
        } else if (storageusername !== null && storageusername.length > 0) {
            return (
                <div className="main_page">
                    <p>TODO: add some content here!</p>
                </div>
            )

        //Jos käyttäjä ei ole kirjautunut palveluun.
        } else {
            return (
                <div className="main_page">
                    <div>
                        <h1>Welcome to PicturePortal</h1>
                        <Login subscribe={this.props.subscribe} login={this.props.login} />
                    </div>
                </div>
            )
        }

    }
}