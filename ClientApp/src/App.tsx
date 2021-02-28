import * as React from 'react';
//import { Switch, Route, Redirect } from 'react-router';
import { Button, Table } from 'react-bootstrap';
import { Switch, Route, Redirect } from 'react-router-dom';
import Navi from './components/Navi';
import Images from './components/imageView';
import dataholding from './components/Dataholding';
import NewPic from "./components/Newpic";
import "./App.css";



class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pictureSet: "",
            images: [],
            imageSet: [],
            chosenImageSet: [],
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
                        this.getPicturesBySet();
                    } else {
                        window.alert("Wrong username or password. Please try again.");
                    }
                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Wrong username or password. Please try again.");
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                    if (data !== 0) {
                        sessionStorage.setItem("password", data);
                        sessionStorage.setItem("name", subs.mName);
                        sessionStorage.setItem("user", subs.mUser);
                        this.getPicturesBySet();
                    } else {
                        window.alert("You gave a username which is either already in use or you typed ##. Please give a new username.")
                    }
                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("You gave a username which is either already in use or you typed ##.Please give a new username.");
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
 //               window.alert("You are logged out of Picture Catalog.");
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                    let temp = [];
                    for (let i = 0; i < data.length; i++) {
                        temp.push([data[i].mPictureSet, data[i].mPSID, data[i].mName, data[i].mAccessible]);
                    }
                    this.setState({ imageSet: temp });
                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                    if (data.length > 0) {
                        this.setState({ pictureSet: data[0].mPictureSet });
                    } else {
                        window.alert("Couldn't get any pictures. This pictureset is either empty or you are not allowed to see pictures. If you are not allowed, the owner of the pictures may allow you to see the pictures at later time.")
                    }
                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
        });

        //Tyhjennetään aiempi kuvasetti. Koska fetch on asynkroninen, tämä tapahtuu aina ennen 
        //uuden kuvasetin saapumista.
        this.setState({ chosenImageSet: [] });
    }

    /**
 * SaveData ja SavePicture yhdistelmällä lisätään kuva tietokantaan haluttuun kuvasettiin ja 
 * kuvan data talletetaan käyttäjän koneelta Cloudinary pilvipalveluun, josta saadaan url-osoite.
 * Kuvan lisääminen tietokantaan on kaksivaiheinen prosessi teknisistä rajoitteista johtuen ja
 * edellyttää kahta eri kutsua backendiin: Itse kuva, kuvadata, pitää tallentaa Cloudinaryyn, 
 * ja tämä suoritetaan erillisellä SaveData-funktiolla, jolla backend hoitaa asian Cloudinaryn 
 * kanssa ja palauttaa kuvan url-osoitteen. Sitten kyseinen kuva tallennetaan tietokantaan
 * SavePicture-funktiolla, kun url-osoite on tiedossa. Syy, miksi tämä luontaisesti yhdellä 
 * funktiolla suoritettava tehtävä on jaettu kahteen on, että datan lähettäminen bodyssa 
 * edellyttää ettei bodyssa lähetetä mitään muuta tietoa. SaveData:
 */
    saveData = (data) => {

        let request = {
            method: 'POST',
            body: data.file,
        };
        let id = parseInt(sessionStorage.getItem("password"));

        fetch("/api/Pictures/SaveData/" + id, request).then(response => {
            if (response.ok) {
                response.json().then(success => {
                    console.log(success);

                    //Varmistutuaan ensin, että kuvadata on tallennettu Cloudinaryyn
                    if (success.mURL !== null) {

                        //Sitten tallennetaan kuva tietokantaan.
                        let picture = {
                            pictureSet: data.pictureSet,
                            url: success.mURL,
                            legend: data.legend
                        };
                        this.savePicture(picture);
                    } else {

                        //Jos kuvaa ei saatu tallennettua Cloudinaryyn
                        window.alert("Couldn't load image data into Cloudinary.");
                    }
                }).catch(error => {
                    window.alert("Error parsing JSON: " + error);
                });
            } else {
                window.alert("Server responded with status: " + response.status);
            }
        }).catch(error => {
            window.alert(error);
        });
    }

    /**
     * SavePicture funktiolla lisätään kuvan url-osoite ja kuvateksti käyttäjän haluamaan 
     * kuvakokoelmaan, niin että kuva näkyy Picture Catalogissa jos käyttäjä on itse tallentanut
     * kuvan kyseiseen url osoitteeseen tai siellä on kolmannen osapuolen kuva.
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
                    if (data.length > 0) {
                        this.setState({ pictureSet: data[0].mPictureSet });
                    } else {
                        window.alert("Couldn't save your picture to the database. Logout, login and try again.");
                    }
                }).catch(error => {
                    window.alert("Error parsing JSON: " + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                    if (data.length > 0) {
                        this.setState({ pictureSet: data[0].mPictureSet });
                    } else {
                        this.setState({ pictureSet: "" });
                    }
                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
        });
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
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                        temp.push([data[i].mPictureSet, data[i].mPSID, data[i].mName, data[i].mAccessible]);
                    }
                    this.setState({ imageSet: temp });
                    this.buttonState(temp.find(q => q.mPictureSet == pictureSet.mPicturesSet).mPSID);
                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                        temp.push([data[i].mPictureSet, data[i].mPSID, data[i].mName, data[i].mAccessible]);
                    }
                    this.setState({ imageSet: temp });
                    if (temp.length > 0)
                        this.buttonState(temp[0].mPSID);
                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
        });
    }

    logout = () => {
        this.logoutBackend();
        sessionStorage.setItem("user", "");
        sessionStorage.setItem("name", "");
        sessionStorage.setItem("password", "");
        let state = {
            pictureSet: "",
            images: [],
            imageSet: [],
            chosenImageSet: [],
        }
        this.setState(state);
    }

    componentDidMount() {
//        this.getPicturesBySet();
        
    }
    

    render() {
        return (
            <div className="App">
                <Switch>
                    <Route exact path="/" render={() => (
                        <div>
                            <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet}
                                logout={this.logout}/>
                            <Images imagesByButtonClicked={this.state.chosenImageSet} login={this.loginBackend}
                                subscribe={this.subscribeBackend} removePicture={this.removePicture}
                                currentPictureSet={this.state.pictureSet} />
                           
                        </div>
                    )} />
                    <Route path="/newpic" render={() => (
                        <div>
                            <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet}
                                logout={this.logout} />
                            <NewPic currentPictureSet={this.state.pictureSet} saveData={this.saveData} savePicture={this.savePicture} />
                        </div>
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
