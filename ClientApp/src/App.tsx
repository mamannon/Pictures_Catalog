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
            overlayState: 0//0 = ei n�ytet� overlayta, 1 = lis�� kuvasetti, 2 = lis�� kuva, 3 = poista kuva
        } 
    }

    /**
     * T�ll� funktiolla kirjaudutaan backendiin.
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
     * T�ll� funktiolla uusi k�ytt�j� luo itselleen tilin.
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
     * T�ll� kirjaudutaan ulos backendist�.
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
     * T�ll� haetaan kaikki tarjolla olevat kuvasetit kaikilta k�ytt�jilt� ja lis�ksi k�ytt�j�t.
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
     * T�ss� katsotaan kuinka monta kuvaa tulee kyseisen painetun napin kuvasettiin ja vied��n data 
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

        //Tyhjennet��n aiempi kuvasetti. Koska fetch on asynkroninen, t�m� tapahtuu aina ennen 
        //uuden kuvasetin saapumista.
        this.setState({ chosenImageSet: [] });
    }

    /**
     * T�ll� lis�t��n kuva tietokantaan haluttuun kuvasettiin.
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
     * T�ll� poistetaan kuva tietyst� kuvasetist�, mutta ei poisteta kuvaa tietokannasta, 
     * jos se esiintyy jossain toisessa kuvasetiss�.
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
     * T�ll� tuhotaan kuva tietokannasta ja poistetaan se kaikista kuvaseteist�. Kuvaa etsit��n
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
     * T�ll� lis�t��n k�ytt�j�lle uusi kuvasetti tai muokataan jo olemassa olevaa.
     * @param psName Kuvasetin nimi
     * @param pData Jos mukaan sis�llytet��n kuvia, ne sijoitetaan t�h�n objektiin
     * @param aData Jos mukaan sis�llytet��n k�ytt�oikeuksien muutoksia, ne sijoitetaan t�h�n objektiin
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
     * T�ll� poistetaan k�ytt�j�lt� kuvasetti. Kuvasetin kuvia ei poisteta tietokannasta, jos 
     * ne esiintyv�t my�s jossain toisessa kuvasetiss�.
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
     * T�ll� haetaan toisten k�ytt�jien tekem�t kuvasettien k�ytt�oikeuspyynn�t.
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
     * T�ll� haetaan toisille k�ytt�jille my�nnetyt kuvasettien k�ytt�oikeudet.
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
