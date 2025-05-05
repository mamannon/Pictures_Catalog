import React, { useState, useRef, useContext, FC } from "react";
import ".././main.css";
import { XCircle, Plus, ChevronLeft, ChevronRight, InfoCircle } from 'react-bootstrap-icons';
import Login from './Login';
import { Link } from "react-router-dom";
import { ImageType2, ImageType3, LoginType } from "../App"; 
import { useClickedNaviButton } from './Dataholding';

interface Props {
    imagesByButtonClicked: ImageType3[],
    currentPictureSet: string,
    removePicture: (picture: ImageType2) => void,
    subscribe: (user: LoginType) => void,
    login: (user: LoginType) => void
}

const ImageView: FC<Props> = ({ imagesByButtonClicked, currentPictureSet,
    removePicture, subscribe, login }) => {
    const [clickedThumbnail, setClickedThumbnail] = useState<number>(0);
    const { clickedNaviButton, setClickedNaviButton } = useClickedNaviButton();
    const thumbnail = useRef(null);

    /**
     * Klikattu jotain thumbnailia, jotta saadaan iso kuva kyseisestä thumbnailista.
     * @param event
     */
    const onClick1 = (event: any) => {
        setClickedNaviButton(false);
        setClickedThumbnail(Number(event.target.id));
    };

    /**
     * Klikattu isoa kuvaa, jotta palattaisiin thumbnail näkymään.
     * @param event
     */
    const onClick2 = (event: any) => {
        setClickedNaviButton(true);
        setClickedThumbnail(0);
    };

    /**
     * Klikattu ison kuvan vasenta laitaa, jotta siirryttäisiin aiempaan kuvaan.
     * @param event
     */
    const onClick3 = (event: any) => {
        if (clickedThumbnail > 0) {
            setClickedNaviButton(false);
            let temp = clickedThumbnail - 1;
            setClickedThumbnail(Number(temp));
        }
    };

    /**
     * Klikattu ison kuvan oikeaa laitaa, jotta siirryttäisiin seuraavaan kuvaan.
     * @param event
     */
    const onClick4 = (event: any) => {
        let temp = clickedThumbnail + 1;
        if (temp < imagesByButtonClicked.length) {
            setClickedNaviButton(false);
            setClickedThumbnail(Number(temp));
        }
    };

    /**
     * Käyttäjä haluaa poistaa valitsemansa kuvan kuvasetistä.
     */
    const remove = (event: any) => {
        let removeImg: number = event.currentTarget.id;
        let pic: ImageType3 | undefined = imagesByButtonClicked.find(e => e.PictureId === removeImg);
        if (pic === undefined) {
            window.alert("This picture is not in any imageset, so it cannot be removed.");
            return;
        }

        //Kysytään käyttäjältä varmistus, että hän todella haluaa poistaa kuvan kuvasetistä.
        if (window.confirm("Do you want to remove picture from this imageset?")) {
            console.log("Removing image " + removeImg);
            let picture: ImageType2 = {
                PID: Number(removeImg),
                pictureSet: pic.mPictureSet
            };
            removePicture(picture);
        }
    };

    /**
     * Käyttäjä haluaa muokata valitsemansa kuvan kuvatekstiä tai lisätä sen toiseen kuvasettiin.
     * @param event
     */
    const edit = (event: any) => {
        window.alert("This is not implemented yet!");
    };

    /**
     * Tämä funktio katkoo tekstistringin '\n' merkin kohdalta erillisiksi paragrapheiksi.
     * @param data
     */
    const NewlineText = (data: any) => {
        let newText = data.text.split("\n").map((item: any, i: number) => {
            return (<p className="leftAlign" key={i}>{item}</p>);
        }); 
        return <div>{newText}</div>;
    };

    let storageusername = sessionStorage.getItem("user");

    //Jos käyttäjä on klikannut katseltavakseen jonkun kuvasetin.
    if (currentPictureSet.length > 0 &&
        storageusername !== null && storageusername.length > 0) {
        let images = [];

        //jos clickedNaviButton on true, käyttäjä ei ole klikannut yhtään thumbnailia
        if (clickedNaviButton === true) {

            //Täällä luodaan thumbnail näkymä useilla pikkukuvilla
            images = imagesByButtonClicked.map((picture: ImageType3, index: number) => {
                return (
                    <span className="imageDiv"
                        onClick={onClick1}
                        key={picture.PictureId}>
                        <img className="thumbnail"
                            src={picture.mURL}
                        //    gravity="center"
                        //    crop="thumb"
                            id={index.toString()} />
                        <XCircle size={24}
                            className="deleteIcon"
                            onClick={(e) => { e.stopPropagation(); remove(e) }}
                            id={picture.PictureId.toString()} />
                        <InfoCircle size={24}
                            className="editIcon"
                            onClick={(e) => { e.stopPropagation(); edit(e) }}
                            id={picture.PictureId.toString()} />
                    </span>
                );
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
            let picture = imagesByButtonClicked[clickedThumbnail];
            images.push(
                <div className="bigImageDiv" >
                    <table style={{ width: "100%" }}>
                        <tbody>
                            <tr>
                                <td style={{ width: "10px" }} onClick={onClick3} className="columnStyle">
                                    <ChevronLeft size={16} color="#0040ff"/>
                                </td>
                                <td>
                                    <table style={{ width: "100%" }} onClick={onClick2}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    {/*    <img src={picture.mURL} width="100%" gravity="center" id={clickedThumbnail.toString()} /> */}
                                                    <img src={picture.mURL} width="100%" id={clickedThumbnail.toString()} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="leftAlign">
                                                        <NewlineText className="leftAlign" text={picture.mLegend} />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td style={{ width: "10px" }} onClick={onClick4} className="columnStyle">
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
                <p>PicturePortal is a study project, which is not finished nor bug free. The purpose of this application is to give for registered users a forum where they can share pictures to each other and to choose who can see certain pictures and who not.</p>
            </div>
        )

    //Jos käyttäjä ei ole kirjautunut palveluun.
    } else {
        return (
            <div className="main_page">
                <div>
                    <h1>Welcome to PicturePortal</h1>
                    <Login subscribe={subscribe} login={login} />
                </div>
            </div>
        )
    }
}
export { ImageView };




/**
 * Alla on JavaScript luokkaversio yläpuolen Typescript-versiosta.
 */




//class ImageView extends React.Component {

//    constructor(props) {
//        super(props);
//        this.thumbnail = React.createRef();
//        this.state = {
//            clickedThumbnail: 0
//        };
//    };

//    /**
//     * Klikattu jotain thumbnailia, jotta saadaan iso kuva kyseisestä thumbnailista.
//     * @param event
//     */
//    onClick1 = (event) => {
//        dataholding.setClickedNaviButton(false);
//        this.setState({ clickedThumbnail: event.target.id });
//    };

//    /**
//     * Klikattu isoa kuvaa, jotta palattaisiin thumbnail näkymään.
//     * @param event
//     */
//    onClick2 = (event) => {
//        dataholding.setClickedNaviButton(true);
//        this.setState({ clickedThumbnail: 0 });
//    };

//    /**
//     * Klikattu ison kuvan vasenta laitaa, jotta siirryttäisiin aiempaan kuvaan.
//     * @param event
//     */
//    onClick3 = (event) => {
//        if (parseInt(this.state.clickedThumbnail) > 0) {
//            dataholding.setClickedNaviButton(false);
//            let temp = parseInt(this.state.clickedThumbnail) - 1;
//            this.setState({ clickedThumbnail: temp });
//        }
//    };

//    /**
//     * Klikattu ison kuvan oikeaa laitaa, jotta siirryttäisiin seuraavaan kuvaan.
//     * @param event
//     */
//    onClick4 = (event) => {
//        let temp = parseInt(this.state.clickedThumbnail) + 1;
//        if (temp < this.props.imagesByButtonClicked.length) {
//            dataholding.setClickedNaviButton(false);
//            this.setState({ clickedThumbnail: temp });
//        }
//    };

//    /**
//     * Käyttäjä haluaa poistaa valitsemansa kuvan kuvasetistä.
//     */
//    remove = (event) => {
//        let removeImg = event.currentTarget.id;

//        //Kysytään käyttäjältä varmistus, että hän todella haluaa poistaa kuvan kuvasetistä.
//        if (window.confirm("Do you want to remove this picture?")) {
//            console.log("Removing image " + removeImg);
//            let picture = {
//                PID: removeImg,
//                pictureSet: this.props.imagesByButtonClicked.find(e => e.pictureId == removeImg).mPictureSet
//            };
//            this.props.removePicture(picture);
//        }
//    };

//    /**
//     * Käyttäjä haluaa muokata valitsemansa kuvan kuvatekstiä tai lisätä sen toiseen kuvasettiin.
//     * @param event
//     */
//    edit = (event) => {
//        window.alert("This is not implemented yet!");
//    };

//    /**
//     * Tämä funktio katkoo tekstistringin '\n' merkin kohdalta erillisiksi paragrapheiksi.
//     * @param data
//     */
//    newlineText = (data) => {
//        let newText = data.text.split("\n").map((item, i) => {
//            return (<p className="leftAlign" key={i}>{item}</p>);
//        });
//        return <div>{newText}</div>;
//    };

//    render() {
//        let storageusername = sessionStorage.getItem("user");

//        //Jos käyttäjä on klikannut katseltavakseen jonkun kuvasetin.
//        if (this.props.currentPictureSet.length > 0 &&
//            storageusername !== null && storageusername.length > 0) {
//            let images = [];

//            //jos clickedNaviButton on true, käyttäjä ei ole klikannut yhtään thumbnailia
//            if (dataholding.getClickedNaviButton() === true) {

//                //Täällä luodaan thumbnail näkymä useilla pikkukuvilla
//                images = this.props.imagesByButtonClicked.map((picture, index) => {
//                    return (
//                        <span className="imageDiv"
//                            onClick={this.onClick1}
//                            key={picture.pictureId}>
//                            <Image className="thumbnail"
//                                src={picture.mURL}
//                                gravity="center"
//                                crop="thumb"
//                                id={index} />
//                            <XCircle size={24}
//                                className="deleteIcon"
//                                onClick={(e) => { e.stopPropagation(); this.remove(e) }}
//                                id={picture.pictureId} />
//                            <InfoCircle size={24}
//                                className="editIcon"
//                                onClick={(e) => { e.stopPropagation(); this.edit(e) }}
//                                id={picture.pictureId} />
//                        </span>
//                    );
//                });

//                //Lisätään perään thumbnail, jossa linkki uuden kuvan lisäämiseen
//                images.push(
//                    <div className="imageDiv" key="0">
//                        <Link to="/newpic" aria-orientation="horizontal">
//                            <Plus size={64} />
//                        </Link>
//                    </div>
//                );

//            } else {

//                //Täällä luodaan käyttäjän klikkaamasta thumbnailista yksi iso näkymän täyttävä kuva.
//                let index = parseInt(this.state.clickedThumbnail);
//                let picture = this.props.imagesByButtonClicked[index];
//                images.push(
//                    <div className="bigImageDiv" >
//                        <table style={{ width: "100%" }}>
//                            <tbody>
//                                <tr>
//                                    <td style={{ width: "10px" }} onClick={this.onClick3} className="columnStyle">
//                                        <ChevronLeft size={16} color="#0040ff" />
//                                    </td>
//                                    <td>
//                                        <table style={{ width: "100%" }} onClick={this.onClick2}>
//                                            <tbody>
//                                                <tr>
//                                                    <td>
//                                                        <Image src={picture.mURL} width="100%" gravity="center" id={index} />
//                                                    </td>
//                                                </tr>
//                                                <tr>
//                                                    <td>
//                                                        <div className="leftAlign">
//                                                            <this.newlineText className="leftAlign" text={picture.mLegend} />
//                                                        </div>
//                                                    </td>
//                                                </tr>
//                                            </tbody>
//                                        </table>
//                                    </td>
//                                    <td style={{ width: "10px" }} onClick={this.onClick4} className="columnStyle">
//                                        <ChevronRight size={16} color="#0040ff" />
//                                    </td>
//                                </tr>
//                            </tbody>
//                        </table>
//                    </div>
//                );
//            }

//            return (
//                <div className="main_page">
//                    {images}
//                </div>
//            )

//            //Jos mitään kuvasettiä ei ole valittu.
//        } else if (storageusername !== null && storageusername.length > 0) {
//            return (
//                <div className="main_page">
//                    <p>TODO: add some content here!</p>
//                </div>
//            )

//            //Jos käyttäjä ei ole kirjautunut palveluun.
//        } else {
//            return (
//                <div className="main_page">
//                    <div>
//                        <h1>Welcome to PicturePortal</h1>
//                        <Login subscribe={this.props.subscribe} login={this.props.login} />
//                    </div>
//                </div>
//            )
//        }

//    }
//}

//export default withRouter(ImageView);