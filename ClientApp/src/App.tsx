import * as React from 'react';
import { Route } from 'react-router';
import { Button, Table } from 'react-bootstrap';
import Navi from './components/Navi';
import Images from './components/ImageView';
import Overlay from './components/Overlay';
import dataholding from './components/Dataholding';

import "./App.css";


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            images: [],
            imageSet: [],
            chosenImageSet: [],
            overlayState: 0//0 = ei näytetä overlayta, 1 = lisää kuvasetti, 2 = lisää kuva, 3 = poista kuva
        } 
    }

    /**
     * Tällä funktiolla kirjaudutaan backendiin.
     */
    loginBackend = (login) => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(login)
        };

        fetch("/api/Pictures/Login", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);
                    if (data !== 0) {
                        sessionStorage.setItem("password", data.mPassword);
                        sessionStorage.setItem("name", data.mName);
                        sessionStorage.setItem("user", data.mUser);
//                        this.setState({ overlayState: 0 });
//                        this.getPicturesBySet();
                        this.overlayVisibility(0);
                    } else {
                        //TODO: show some message to the user
                    }
                }).catch(error => {
                    console.log("Error parsing JSON:", error);
                })
            } else {
                console.log("Server responded with status:", response.status);
                //TODO: show some message to the user
            }
        }).catch(error => {
            console.log("Server responded with error:", error);
            //TODO: show some message to the user
        });
    }

    /**
     * Tällä funktiolla uusi käyttäjä luo itselleen tilin.
     */
    subscribeBackend = (subs) => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(subs)
        };

        fetch("/api/Pictures/Subscribe", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);
                    //                   this.setState({ tempPassWd: data });
                    if (data !== 0) {
                        sessionStorage.setItem("password", data);
                        sessionStorage.setItem("name", subs.mName);
                        sessionStorage.setItem("user", subs.mUser);
//                        this.setState({ overlayState: 0 });
                        //                        this.getPicturesBySet();
                        this.overlayVisibility(0);
                    } else {
                        //TODO: show some message to the user
                    }
                }).catch(error => {
                    console.log("Error parsing JSON:", error);
                })
            } else {
                console.log("Server responded with status:", response.status);
                //TODO: show some message to the user
            }
        }).catch(error => {
            console.log("Server responded with error:", error);
            //TODO: show some message to the user
        });
    }

    /**
     * Tällä kirjaudutaan ulos backendistä.
     * */
    logoutBackend = () => {
        let temp = {
            mUser: sessionStorage.getItem("user"),
            mTemporaryID: parseInt(sessionStorage.getItem("password"))
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/Logout", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    sessionStorage.removeItem("user");
                    sessionStorage.removeItem("password");
                    sessionStorage.removeItem("name");
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
     * Tällä haetaan kaikki tarjolla olevat kuvasetit kaikilta käyttäjiltä ja lisäksi käyttäjät.
     */
    getPicturesBySet = () => {

        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: sessionStorage.getItem("password")
        };
        
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
     * Tässä katsotaan kuinka monta kuvaa tulee kyseisen painetun napin kuvasettiin ja viedään data 
     * imageView.js komponenttiin
     */
    buttonState = (id) => {
        dataholding.setClickedNaviButton(true);
        let temp = {
            mPSID: parseInt(id = id || 0),
            mKey: parseInt(sessionStorage.getItem("password"))
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/GetPictures", request).then(response => {
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

        //Tyhjennetään aiempi kuvasetti. Koska fetch on asynkroninen, tämä tapahtuu aina ennen 
        //uuden kuvasetin saapumista.
        this.setState({ chosenImageSet: [] });
    }

    /**
     * Tällä lisätään kuva tietokantaan haluttuun kuvasettiin.
     */
    savePicture = (data) => {
        let picture = {
            mUserID: parseInt(0),
            mPictureSet: data.pictureSet,
            mURL: data.url,
            mLegend: data.legend
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password")),
            mPicture: picture
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/SavePicture", request).then(response => {
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
    }

    /**
     * Tällä poistetaan kuva tietystä kuvasetistä, mutta ei poisteta kuvaa tietokannasta, 
     * jos se esiintyy jossain toisessa kuvasetissä.
     */
    removePicture = (data) => {
        let picture = {
            mUserID: parseInt(0),
            PictureId: parseInt(data.PID = data.PID || 0),
            mPictureSet: data.pictureSet,
            mURL: data.url,
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password")),
            mPicture: picture
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/RemovePicture", request).then(response => {
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
    }

    overlayVisibility = (data) => {
        this.setState({ overlayState: data });
        if (data === 0) this.getPicturesBySet();
    }

    /**
     * Tällä tuhotaan kuva tietokannasta ja poistetaan se kaikista kuvaseteistä. Kuvaa etsitään
     * tietokannasta ainoastaan annetun URL-osoitteen perusteella.
     */
    deletePicture = (data) => {
        let picture = {
            mUserID: parseInt(0),
            mURL: data.url
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password")),
            mPicture: picture
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/RemovePicture", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);
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
     * Tällä lisätään käyttäjälle uusi kuvasetti tai muokataan jo olemassa olevaa.
     * @param psName Kuvasetin nimi
     * @param pData Jos mukaan sisällytetään kuvia, ne sijoitetaan tähän objektiin
     * @param aData Jos mukaan sisällytetään käyttöoikeuksien muutoksia, ne sijoitetaan tähän objektiin
     */
    addPictureSet = (psName, pData, aData) => {
        let pictures = [];
        for (let i = 0; i < pData.length; i++) {
            pictures.push({
                PictureId: parseInt(pData[i].pictureId = pData[i].pictureId || 0),
                mURL: pData[i].URL,
                mLegend: pData[i].legend
            });
        }
        let allowedUsers = [];
        for (let i = 0; i < aData.length; i++) {
            allowedUsers.push({
                mAllowedUser: aData[i].allowedUser,
                mPictureSet: aData[i].picSet
            });
        }
        let pictureSet = {
            mPicturesSet: psName,
            cPictures: pictures,
            cAllowedUsers: allowedUsers
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password")),
            mPictureSet: pictureSet
        };

        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/AddPictureset", request).then(response => {
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
     * Tällä poistetaan käyttäjältä kuvasetti. Kuvasetin kuvia ei poisteta tietokannasta, jos 
     * ne esiintyvät myös jossain toisessa kuvasetissä.
     */
    removePictureSet = (psName) => {
        let pictureSet = {
            mPicturesSet: psName
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password")),
            mPictureSet: pictureSet
        };

        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/RemovePictureset", request).then(response => {
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
     * Tällä haetaan toisten käyttäjien tekemät kuvasettien käyttöoikeuspyynnöt.
     */
    getApplications = () => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: sessionStorage.getItem("password")
        };

        fetch("/api/Pictures/GetApplications", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);
                    let temp = new Array();
                    for (let i = 0; i < data.length; i++) {
                        temp.push({
                            user: data[i].mApplicantUser,
                            name: data[i].mApplicantName,
                            picSet: data[i].mPictureSet
                        });
                    }
                    sessionStorage.setItem("applications", JSON.stringify(temp));
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
     * Tällä haetaan toisille käyttäjille myönnetyt kuvasettien käyttöoikeudet.
     */
    getAlloweds = () => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: sessionStorage.getItem("password")
        };

        fetch("/api/Pictures/GetAlloweds", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);
                    let temp = new Array();
                    for (let i = 0; i < data.length; i++) {
                        temp.push({
                            user: data[i].mApplicantUser,
                            name: data[i].mApplicantName,
                            picSet: data[i].mPictureSet
                        });
                    }
                    sessionStorage.setItem("alloweds", JSON.stringify(temp));
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

    overlayVisibility = (data) => {
        this.setState({ overlayState: data });
        if (data === 0) this.getPicturesBySet();
    }

    componentDidMount() {
//        this.getPicturesBySet();
        
    }
    

    render() {
        let overlay;
        if (this.state.overlayState > 0) overlay = <Overlay contentId={this.state.overlayState}
                closeOverlay={this.overlayVisibility} />;

        return (
            <div className="App">
                <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet}
                        overlay={this.overlayVisibility} />
                <Images imagesByButtonClicked={this.state.chosenImageSet} login={this.loginBackend}
                    subscribe={this.subscribeBackend} removePicture={this.removePicture} />
                {overlay}
            </div>
        );
    }
}

export default App;
