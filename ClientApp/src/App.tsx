import * as React from 'react';
//import { Switch, Route, Redirect } from 'react-router';
import { Button, Table } from 'react-bootstrap';
import { Switch, Route, Redirect } from 'react-router-dom';
import Navi from './components/Navi';
import Images from './components/imageView';
import dataholding from './components/Dataholding';
import NewPic from "./components/Newpic";
import "./App.css";
import { JwModal } from './components/Modal';


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pictureSet: "",
            images: [],
            imageSet: [],
            chosenImageSet: [],
            bodyText: ""
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
 //               window.alert("You are logged out of Picture Catalog.");
            } else {
                window.alert("Server responded with status:" + response.status);
            }
        }).catch(error => {
            window.alert("Server responded with error:" + error);
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
                    if (data.length > 0) {
                        this.setState({ chosenImageSet: data });
                        this.setState({ pictureSet: data[0].mPictureSet });
                    } else {
                        window.alert("Couldn't get any pictures. This pictureset is either empty or you are not allowed to see pictures. If you are not allowed, the owner of the pictures may allow you to see the pictures at later time.")
                        this.setState({ chosenImageSet: [] });
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

        //Tyhjennet��n aiempi kuvasetti. Koska fetch on asynkroninen, t�m� tapahtuu aina ennen 
        //uuden kuvasetin saapumista.
        this.setState({ chosenImageSet: [] });
    }

    /**
 * SaveData ja SavePicture yhdistelm�ll� lis�t��n kuva tietokantaan haluttuun kuvasettiin ja 
 * kuvan data talletetaan k�ytt�j�n koneelta Cloudinary pilvipalveluun, josta saadaan url-osoite.
 * Kuvan lis��minen tietokantaan on kaksivaiheinen prosessi teknisist� rajoitteista johtuen ja
 * edellytt�� kahta eri kutsua backendiin: Itse kuva, kuvadata, pit�� tallentaa Cloudinaryyn, 
 * ja t�m� suoritetaan erillisell� SaveData-funktiolla, jolla backend hoitaa asian Cloudinaryn 
 * kanssa ja palauttaa kuvan url-osoitteen. Sitten kyseinen kuva tallennetaan tietokantaan
 * SavePicture-funktiolla, kun url-osoite on tiedossa. Syy, miksi t�m� luontaisesti yhdell� 
 * funktiolla suoritettava teht�v� on jaettu kahteen on, ett� datan l�hett�minen bodyssa 
 * edellytt�� ettei bodyssa l�hetet� mit��n muuta tietoa. SaveData:
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

                    //Varmistutuaan ensin, ett� kuvadata on tallennettu Cloudinaryyn
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
     * SavePicture funktiolla lis�t��n kuvan url-osoite ja kuvateksti k�ytt�j�n haluamaan 
     * kuvakokoelmaan, niin ett� kuva n�kyy Picture Catalogissa jos k�ytt�j� on itse tallentanut
     * kuvan kyseiseen url osoitteeseen tai siell� on kolmannen osapuolen kuva.
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
     * T�ll� lis�t��n k�ytt�j�lle uusi kuvasetti tai muokataan jo olemassa olevaa.
     * @param psName Kuvasetin nimi
     * @param pData Jos mukaan sis�llytet��n kuvia, ne sijoitetaan t�h�n objektiin
     * @param aData Jos mukaan sis�llytet��n k�ytt�oikeuksien muutoksia, ne sijoitetaan t�h�n objektiin
     */
    addPictureSet = (psName, pData, aData) => {

        let pictures = [];

        if (pData !== null)
        for (let i = 0; i < pData.length; i++) {
            pictures.push({
                PictureId: parseInt(pData[i].pictureId = pData[i].pictureId || 0),
                mURL: pData[i].URL,
                mLegend: pData[i].legend
            });
            }

        let allowedUsers = [];

        if (aData !== null)
        for (let i = 0; i < aData.length; i++) {
            allowedUsers.push({
                mAllowedUser: aData[i].allowedUser,
                mPictureSet: aData[i].picSet
            });
        }
        let pictureSet1 = {
            mPictureSet: psName,
            cPictures: pictures,
            cAllowedUsers: allowedUsers
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password")),
            cPictureSet: pictureSet1
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
                    let temp = [];
                    for (let i = 0; i < data.length; i++) {
                        temp.push([data[i].mPictureSet, data[i].mPSID, data[i].mName, data[i].mAccessible]);
                    }
                    let state = {
                        pictureSet: pictureSet1.mPictureSet,
                        images: this.state.images,
                        imageSet: temp,
                        chosenImageSet: this.state.chosenImageSet,
                        bodyText: this.state.bodyText
                    };
                    this.setState(state);
                    const picset = (q) => (q[0] === pictureSet1.mPictureSet && sessionStorage.getItem("name") === q[2]);
                    this.buttonState(temp[temp.findIndex(picset)][1]);
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
     * T�ll� poistetaan k�ytt�j�lt� kuvasetti. Kuvasetin kuvia ei poisteta tietokannasta, jos 
     * ne esiintyv�t my�s jossain toisessa kuvasetiss�.
     */
    removePictureSet = (id) => {

        let pictureSet = {

            //Kyseess� on picturesetin tietokanta id, mutta sit� ei voi laittaa PictureSetId
            //nimell�, koska ASP.NET ei ehk� ota sit� vastaan silloin.
            mUserId: parseInt(id = id || 0)
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password")),
            cPictureSet: pictureSet
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
                    let state = {
                        pictureSet: this.state.pictureSet,
                        images: this.state.images,
                        imageSet: temp,
                        chosenImageSet: this.state.chosenImageSet,
                        bodyText: this.state.bodyText
                    };
                    this.setState(state);
                    this.getPicturesBySet();
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
            bodyText: ""
        }
        this.setState(state);
    }

    /**
 * T�m� eventti peruuttaa kuvasetin luomisen.
 * @param event
 */
    onCancel = (event) => {
        event.preventDefault();
        JwModal.close('custom-modal-1')(event);

        //Lopuksi nollaamme bodytekstin.
        let state = {
            pictureSet: this.state.pictureSet,
            images: this.state.images,
            imageSet: this.state.imageSet,
            chosenImageSet: this.state.chosenImageSet,
            bodyText: ""
        };
        this.setState(state);
    }

    /**
 * K�ytt�j� luo kuvasetin.
 * @param event
 */
    onSubmit = (event) => {
        event.preventDefault();
        JwModal.close('custom-modal-1')(event);

        //varmistetaan, ett� k�ytt�j� on kirjottanut jotain
        if (this.state.bodyText.length > 0) {

            this.addPictureSet(this.state.bodyText, null, null);
        }

        //Lopuksi nollaamme bodytekstin.
        let state = {
            pictureSet: this.state.pictureSet,
            images: this.state.images,
            imageSet: this.state.imageSet,
            chosenImageSet: this.state.chosenImageSet,
            bodyText: ""
        };
        this.setState(state);
    }

    /**
 * T�m� p�ivitt�� k�ytt�j�n kirjoittamat kirjaimet stateen.
 * @param event
 */
    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    render() {

        const { bodyText } = this.state.bodyText;

        return (
            <div className="App">
                <Switch>
                    <Route exact path="/" render={() => (
                        <div>
                            <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet}
                                logout={this.logout} addPictureSet={this.addPictureSet}
                                removePictureSet={this.removePictureSet} />
                            <Images imagesByButtonClicked={this.state.chosenImageSet} login={this.loginBackend}
                                subscribe={this.subscribeBackend} removePicture={this.removePicture}
                                currentPictureSet={this.state.pictureSet} />       
                        </div>
                    )} />
                    <Route path="/newpic" render={() => (
                        <div>
                            <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet}
                                logout={this.logout} addPictureSet={this.addPictureSet}
                                removePictureSet={this.removePictureSet} />
                            <NewPic currentPictureSet={this.state.pictureSet} saveData={this.saveData}
                                savePicture={this.savePicture} />
                        </div>
                    )}/>
                </Switch>

                <JwModal id="custom-modal-1" key="custom-modal-1">
                    <div>
                        <h1>Create Picture Set</h1>
                        <form className="form2" onSubmit={this.onSubmit}>
                            <fieldset>
                                <label>Write below a name of your new picture set:</label>
                                <input type="text"
                                    name="bodyText"
                                    onChange={this.handleChange}
                                    value={bodyText} />
                            </fieldset>
                            <fieldset>
                                <table style={{ border: "none", boxShadow: "none" }}>
                                    <tbody>
                                        <tr>
                                            <td align="center">
                                                <Button type="submit">Ok</Button>
                                                <Button onClick={this.onCancel}>Cancel</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </fieldset>
                        </form>
                    </div>
                </JwModal>

            </div>
        );
    }
}

export default App;
