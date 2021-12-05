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
        let responseStatus = 1;

        fetch("/api/Pictures/Login", request).then(response => {     
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json.mPassword && json.mName && json.mUser) {
                sessionStorage.setItem("password", json.mPassword);
                sessionStorage.setItem("name", json.mName);
                sessionStorage.setItem("user", json.mUser);
                this.getPicturesBySet();
            } else {
                window.alert("Invalid JSON content. Please try again.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/Subscribe", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json) {
                sessionStorage.setItem("password", json);
                sessionStorage.setItem("name", subs.mName);
                sessionStorage.setItem("user", subs.mUser);
                this.getPicturesBySet();
            } else {
                window.alert("Invalid JSON content. Please try to log in with your current credentials and if that doesn't work, subscribe with a new username.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/Logout", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
                return response.json();
            }
        }).then(json => {
            if (!responseStatus) {
                console.log(json);
                throw json;
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/GetSets", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then( json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
                && json[0].mName && json[0].mAccessible > -1) {
                let temp = [];
                for (let i = 0; i < json.length; i++) {
                    temp.push([json[i].mPictureSet, json[i].mPSID,
                    json[i].mName, json[i].mAccessible]);
                }
                this.setState({ imageSet: temp });
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/GetPictures", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            } 
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json) {

                //Vaihdetaan kuvasetti.
                this.setState({ chosenImageSet: [] });
                this.setState({ chosenImageSet: json });
            }
            if (json && json.length > 0 && json[0].mPictureSet) {
                this.setState({ pictureSet: json[0].mPictureSet });
            } else {
                window.alert("Couldn't get any pictures. Requested pictureset is either empty or you are not allowed to see pictures. If you are not allowed, the owner of the pictures may allow you to see the pictures at later time.")
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
        });
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
        let responseStatus = 1;

        fetch("/api/Pictures/SaveData/" + id, request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            } 
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;

            //Varmistutuaan ensin, ett� kuvadata on tallennettu Cloudinaryyn
            if (json && json.mURL) {

                //Sitten tallennetaan kuva tietokantaan.
                let picture = {
                    pictureSet: data.pictureSet,
                    url: json.mURL,
                    legend: data.legend
                };
                this.savePicture(picture);
            } else {

                //Jos kuvaa ei saatu tallennettua Cloudinaryyn
                window.alert("Couldn't load image data into Cloudinary.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
        });
    }

    /**
     * SavePicture funktiolla lis�t��n kuvan url-osoite ja kuvateksti k�ytt�j�n haluamaan 
     * kuvakokoelmaan, niin ett� kuva n�kyy Picture Catalogissa jos k�ytt�j� on itse tallentanut
     * kuvan kyseiseen url osoitteeseen tai siell� on kolmannen osapuolen kuva.
     */
    savePicture = (data) => {

        let picture = {
            mUserID: 0,
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
        let responseStatus = 1;

        fetch("/api/Pictures/SavePicture", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json && json.length > 0 && json[0].mPictureSet) {
                this.setState({ chosenImageSet: json });
                this.setState({ pictureSet: json[0].mPictureSet });
            } else {
                window.alert("Couldn't save your picture to the database. Logout, login and try again.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
        });
    }

    /**
     * T�ll� poistetaan kuva tietyst� kuvasetist�, mutta ei poisteta kuvaa tietokannasta, 
     * jos se esiintyy jossain toisessa kuvasetiss�.
     */
    removePicture = (data) => {
        let picture = {
            mUserID: 0,
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
        let responseStatus = 1;

        fetch("/api/Pictures/RemovePicture", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json) {
                this.setState({ chosenImageSet: json });
                if (json.length > 0 && json[0].mPictureSet) {
                    this.setState({ pictureSet: json[0].mPictureSet });
                } else {
                    this.setState({ pictureSet: "" });
                }
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
        });
    }

    /**
     * T�ll� tuhotaan kuva tietokannasta ja poistetaan se kaikista kuvaseteist�. Kuvaa etsit��n
     * tietokannasta ainoastaan annetun URL-osoitteen perusteella.
     */
    deletePicture = (data) => {
        let picture = {
            mUserID: 0,
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
        let responseStatus = 1;

        fetch("/api/Pictures/RemovePicture", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/AddPictureset", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
                && json[0].mName && json[0].mAccessible > -1) {
                let temp = [];
                for (let i = 0; i < json.length; i++) {
                    temp.push([json[i].mPictureSet, json[i].mPSID,
                    json[i].mName, json[i].mAccessible]);
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
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/RemovePictureset", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
                && json[0].mName && json[0].mAccessible > -1) {
                let temp = new Array();
                for (let i = 0; i < json.length; i++) {
                    temp.push([json[i].mPictureSet, json[i].mPSID, json[i].mName, json[i].mAccessible]);
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
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/GetApplications", request).then(response => {
            if (!response.ok) {
                responseStatus = 0;
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json && json.length > 0 && json[0].mApplicantUser
                && json[0].mApplicantName && json[0].mPictureSet) {
                let temp = new Array();
                for (let i = 0; i < json.length; i++) {
                    temp.push({
                        user: json[i].mApplicantUser,
                        name: json[i].mApplicantName,
                        picSet: json[i].mPictureSet
                    });
                }
                sessionStorage.setItem("applications", JSON.stringify(temp));
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
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
        let responseStatus = 1;

        fetch("/api/Pictures/GetAlloweds", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);

                }).catch(error => {
                    window.alert("Error parsing JSON:" + error);
                })
            } else {
                window.alert("Server responded with status:" + response.status);
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (!responseStatus) throw json;
            if (json && json.length > 0 && json[0].mApplicantUser
                && json[0].mApplicantName && json[0].mPictureSet) {
                let temp = new Array();
                for (let i = 0; i < json.length; i++) {
                    temp.push({
                        user: json[i].mApplicantUser,
                        name: json[i].mApplicantName,
                        picSet: json[i].mPictureSet
                    });
                }
                sessionStorage.setItem("alloweds", JSON.stringify(temp));
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.log(error);
            this.errorMessage(error);
        });
    }

    errorMessage = (error) => {
        if (error.mCode && error.mMessage) {
            if (error.mCode < 500) {
                window.alert("Application error: " + error.mCode +
                    "\nMessage: " + error.mMessage +
                    "\nDetails: " + error.mDetails);
            } else {
                window.alert("Server error: " + error.mCode +
                    "\nMessage: " + error.mMessage +
                    "\nDetails: " + error.mDetails);
            }
        } else {
            window.alert(error);
        }
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
