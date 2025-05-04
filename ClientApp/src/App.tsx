import React, { useState, useContext, useEffect } from "react";
import { Button, Table } from 'react-bootstrap';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navi from './components/Navi';
import { useClickedNaviButton } from './components/Dataholding';
import { Newpic } from "./components/Newpic";
import "./main.css";
import { JwModal, useModalSharedState } from './components/Modal';
import { ImageView } from "./components/ImageView";

export type ImageSetType = {
    mPictureSet: string,
    mPSID: number,
    mName: string,
    mAccessible: number
};

export type ImageType1 = {
    pic: string,
    pictureSet: string,
    legend: string
};

export type ImageType2 = {
    PID: number,
    pictureSet: string
}

export type ImageType3 = {
    mPublicId: string,
    mUserId: number,
    PictureId: number,
    mPictureSet: string
    mURL: string,
    mLegend: string
};

type ApplicationType = {
    mApplicantUser: string,
    mApplicantName: string,
    mPictureSet: string,
    mGranted: boolean
};

type AllowedUserType = {
    AllowedUserId: number,
    mOwnerUserId: number,
    mAllowedUser: string,
    mPictureSet: string
}

export type LoginType = {
    mName: string,
    mUser: string,
    mPassword: string
}

const App = () => {
    const [pictureSet, setPictureSet] = useState<string>("");
 //   const [images, setImages] = useState<>([]);
    const [imageSet, setImageSet] = useState<ImageSetType[]>([]);
    const [chosenImageSet, setChosenImageSet] = useState<ImageType3[]>([]);
    const [bodyText, setBodyText] = useState<string>("");
    const [applications, setApplications] = useState<ApplicationType[]>([]);
    const [alloweds, setAlloweds] = useState<ApplicationType[]>([]);
    const [applicationsChanges, setApplicationsChanges] = useState<number[]>([]);
    const [allowedsChanges, setAllowedsChanges] = useState<number[]>([]);
    const { clickedNaviButton, setClickedNaviButton } = useClickedNaviButton();
    const {
        addModal, removeModal,
        jsxOpen, jsxClose, javaScriptOpen, javaScriptClose
    } = useModalSharedState();

    const errorWindow = (status: any, json: any) => {
        let message = `Server responded with status: ${status} \nError message: ${json}`;
        window.alert(message);
    }


    /**
     * T‰ll‰ funktiolla kirjaudutaan backendiin.
     */
    const loginBackend = (login: LoginType) => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(login)
        };

        fetch("/api/Pictures/Login", request).then(async (response) => {     
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (json.mPassword && json.mName && json.mUser) {
                sessionStorage.setItem("password", json.mPassword);
                sessionStorage.setItem("name", json.mName);
                sessionStorage.setItem("user", json.mUser);
                getPicturesBySet();
            } else {
                window.alert("Invalid JSON content. Please try again.");
            }
        }).catch(error => {
            console.error("Error fetching data in loginBackend: ", error);
        });
    }

    /**
     * T‰ll‰ funktiolla uusi k‰ytt‰j‰ luo itselleen tilin.
     */
    const subscribeBackend = (subs: LoginType) => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(subs)
        };

        fetch("/api/Pictures/Subscribe", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (json) {
                sessionStorage.setItem("password", json);
                sessionStorage.setItem("name", subs.mName);
                sessionStorage.setItem("user", subs.mUser);
                getPicturesBySet();
            } else {
                window.alert("Invalid JSON content. Please try to log in with your current credentials and if that doesn't work, subscribe with a new username.");
            }
        }).catch(error => {
            console.error("Error fetching data in subscribeBackend: ", error);
        });
    }

    /**
     * T‰ll‰ kirjaudutaan ulos backendist‰.
     * */
    const logoutBackend = () => {
        let temp = {
            mUser: sessionStorage.getItem("user"),
            mTemporaryID: parseInt(sessionStorage.getItem("password") || "")
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/Logout", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
        }).catch(error => {
            console.error("Error fetching data in logoutBackend: ", error);
        });
    }

    /**
     * T‰ll‰ haetaan kaikki tarjolla olevat kuvasetit kaikilta k‰ytt‰jilt‰ ja lis‰ksi k‰ytt‰j‰t.
     */
    const getPicturesBySet = () => {

        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: sessionStorage.getItem("password") || ""
        };

        fetch("/api/Pictures/GetSets", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then( json => {
            console.log(json);
            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
                && json[0].mName && json[0].mAccessible > -1) {
                    
                let temp: ImageSetType[] = [];
                for (let i = 0; i < json.length; i++) {
                    temp.push({
                        mPictureSet: json[i].mPictureSet,
                        mPSID: Number(json[i].mPSID),
                        mName: json[i].mName,
                        mAccessible: Number(json[i].mAccessible)
                    });
                }
                
                setImageSet(temp);
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.error("Error fetching data in getPicturesBySet: ", error);
        });
    }

    /**
     * T‰ss‰ katsotaan kuinka monta kuvaa tulee kyseisen painetun napin kuvasettiin ja vied‰‰n data 
     * imageView.js komponenttiin
     */
    const buttonState = (id: number) => {
        setClickedNaviButton(true);
        let temp = {
            mPSID: id,
            mKey: parseInt(sessionStorage.getItem("password") || "")
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/GetPictures", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            } 
            return response.json();
        }).then(json => {
            console.log(json);
            if (json && json.length > 0 && json[0].mPictureSet && json[0].mURL) {
                setChosenImageSet(json);
                setPictureSet(json[0].mPictureSet);
            } else {
                setChosenImageSet([]);
                setPictureSet(json[0].mPictureSet);
                window.alert("Couldn't get any pictures. Requested pictureset is either empty or you are not allowed to see pictures. If you are not allowed, the owner of the pictures may allow you to see the pictures at later time.")
            }
        }).catch(error => {
            console.error("Error fetching data in buttonState: ", error);
        });
    }

    /**
 * SaveData ja SavePicture yhdistelm‰ll‰ lis‰t‰‰n kuva tietokantaan haluttuun kuvasettiin ja 
 * kuvan data talletetaan k‰ytt‰j‰n koneelta Cloudinary pilvipalveluun, josta saadaan url-osoite.
 * Kuvan lis‰‰minen tietokantaan on kaksivaiheinen prosessi teknisist‰ rajoitteista johtuen ja
 * edellytt‰‰ kahta eri kutsua backendiin: Itse kuva, kuvadata, pit‰‰ tallentaa Cloudinaryyn, 
 * ja t‰m‰ suoritetaan erillisell‰ SaveData-funktiolla, jolla backend hoitaa asian Cloudinaryn 
 * kanssa ja palauttaa kuvan url-osoitteen. Sitten kyseinen kuva tallennetaan tietokantaan
 * SavePicture-funktiolla, kun url-osoite on tiedossa. Syy, miksi t‰m‰ luontaisesti yhdell‰ 
 * funktiolla suoritettava teht‰v‰ on jaettu kahteen on, ett‰ datan l‰hett‰minen bodyssa 
 * edellytt‰‰ ettei bodyssa l‰hetet‰ mit‰‰n muuta tietoa. 
 * 
 * K‰ytt‰m‰ll‰ saveData.then(...) t‰m‰ metodi odottaa, ett‰ funktio on suoritettu ennen jatkamista.
 * 
 * SaveData:
 */
    const saveData = async (data: ImageType1) => {

        let request = {
            method: 'POST',
            body: data.pic,
        };
        let id = parseInt(sessionStorage.getItem("password") || "");

        fetch("/api/Pictures/SaveData/" + id, request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            } 
            return response.json();
        }).then(json => {
            console.log(json);

            //Varmistutuaan ensin, ett‰ kuvadata on tallennettu Cloudinaryyn
            if (json && json.mURL) {

                //Sitten tallennetaan kuva tietokantaan.
                let picture: ImageType1 = {
                    pictureSet: data.pictureSet,
                    pic: json.mURL,
                    legend: data.legend
                };
                savePicture(picture);
            } else {

                //Jos kuvaa ei saatu tallennettua Cloudinaryyn
                window.alert("Couldn't load image data into Cloudinary.");
            }
            return json;
        }).catch(error => {
            console.error("Error fetching data in saveData: ", error);
        });
    }

    /**
     * SavePicture funktiolla lis‰t‰‰n kuvan url-osoite ja kuvateksti k‰ytt‰j‰n haluamaan 
     * kuvakokoelmaan, niin ett‰ kuva n‰kyy Picture Catalogissa jos k‰ytt‰j‰ on itse tallentanut
     * kuvan kyseiseen url osoitteeseen tai siell‰ on kolmannen osapuolen kuva.
     * K‰ytt‰m‰ll‰ savePicture.then(...) t‰m‰ metodi odottaa, ett‰ funktio on suoritettut ennen jatkamista.
     */
    const savePicture = async (data: ImageType1) => {

        let picture = {
            mUserID: 0,
            mPictureSet: data.pictureSet,
            mURL: data.pic,
            mLegend: data.legend
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password") || ""),
            mPicture: picture
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        try {
            let response = await fetch("/api/Pictures/SavePicture", request);
            let json = await response.json();
            if (!response.ok) {
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            console.log(json);
            if (json && json.length > 0 && json[0].mPictureSet) {
                setChosenImageSet(json);
                setPictureSet(json[0].mPictureSet);
            } else {
                window.alert("Couldn't save your picture to the database. Logout, login and try again.");
            }
            return;
        } catch (error) {
            console.error("Error fetching data in savePicture: ", error);
        }
    }

    /**
     * T‰ll‰ poistetaan kuva tietyst‰ kuvasetist‰, mutta ei poisteta kuvaa tietokannasta, 
     * jos se esiintyy jossain toisessa kuvasetiss‰.
     */
    const removePicture = (data: ImageType2) => {
        let picture: ImageType3 = {
            mUserId: 0,
            PictureId: Number(data.PID),
            mPictureSet: data.pictureSet,
            mURL: "",
            mLegend: "",
            mPublicId: ""
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password") || ""),
            mPicture: picture
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/RemovePicture", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (json) {   
                if (json && json.length > 0 && json[0].mPictureSet) {
                    setChosenImageSet(json);
                    setPictureSet(json[0].mPictureSet);
                } else {
                    setChosenImageSet([]);
                    setPictureSet("");
                }
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.error("Error fetching data in removePicture: ", error);
        });
    }

    /**
     * T‰ll‰ tuhotaan kuva tietokannasta ja poistetaan se kaikista kuvaseteist‰. Kuvaa etsit‰‰n
     * tietokannasta ainoastaan annetun URL-osoitteen perusteella.
     */
    const deletePicture = (data: ImageType1) => {
        let picture: ImageType3 = {
            mUserId: 0,
            PictureId: 0,
            mPictureSet: "",
            mURL: data.pic,
            mLegend: "",
            mPublicId: ""
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password") || ""),
            mPicture: picture
        };
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/DeletePicture", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
        }).catch(error => {
            console.error("Error fetching data in deletePicture: ", error);
        });
    }

    /**
     * T‰ll‰ lis‰t‰‰n k‰ytt‰j‰lle uusi kuvasetti tai muokataan jo olemassa olevaa.
     * @param psName Kuvasetin nimi
     * @param pData Jos mukaan sis‰llytet‰‰n kuvia, ne sijoitetaan t‰h‰n objektiin
     * @param aData Jos mukaan sis‰llytet‰‰n k‰yttˆoikeuksien muutoksia, ne sijoitetaan t‰h‰n objektiin
     */
    const addPictureSet = (psName: string, pData: ImageType3[] | undefined | null,
        aData: ApplicationType[] | undefined | null) => {

        if (psName === null || psName.length < 1) {
            errorWindow("Trying to create picture set, but there is no name for it.", null);
            throw new Error("Trying to create picture set, but there is no name for it.");
        }

        let pictures: ImageType3[] = [];

        if (pData !== null && pData !== undefined) {
            for (let i = 0; i < pData.length; i++) {
                pictures.push({
                    PictureId: Number(pData[i].PictureId),
                    mURL: pData[i].mURL,
                    mLegend: pData[i].mLegend,
                    mPublicId: "",
                    mUserId: 0,
                    mPictureSet: psName
                });
            }
        }

        let allowedUsers: ApplicationType[] = [];

        if (aData !== null && aData !== undefined) {
            for (let i = 0; i < aData.length; i++) {
                allowedUsers.push({
                    mApplicantUser: aData[i].mApplicantUser,
                    mApplicantName: "",
                    mPictureSet: psName,
                    mGranted: aData[i].mGranted
                });
            }
        }
        let pictureSet1 = {
            mPictureSet: psName,
            cPictures: pictures
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password") || ""),
            cPictureSet: pictureSet1,
            cApplications: allowedUsers
        };

        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/AddPictureset", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
                && json[0].mName && json[0].mAccessible > -1) {
                    
                let temp: ImageSetType[] = [];
                for (let i = 0; i < json.length; i++) {
                    temp.push({
                        mPictureSet: json[i].mPictureSet,
                        mPSID: Number(json[i].mPSID),
                        mName: json[i].mName,
                        mAccessible: Number(json[i].mAccessible)
                    });
                }
                
                setPictureSet(pictureSet1.mPictureSet);
                setImageSet(temp);
                /*
                const picset = (q: ImageSetType) =>
                    (q.mPictureSet === pictureSet1.mPictureSet && sessionStorage.getItem("name") === q.mName);
                buttonState(json[json.findIndex(picset)][1]);
                */
                const picset = temp.find(
                    q => q.mPictureSet === pictureSet1.mPictureSet && sessionStorage.getItem("name") === q.mName);
                if (picset !== undefined && picset !== null) {
                    buttonState(picset.mPSID);
                } else {
                    window.alert("Couldn't find the created picture set from backend response.");
                }
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.error("Error fetching data in addPictureSet: ", error);
        });
    }

    /**
     * T‰ll‰ poistetaan k‰ytt‰j‰lt‰ kuvasetti. Kuvasetin kuvia ei poisteta tietokannasta, jos 
     * ne esiintyv‰t myˆs jossain toisessa kuvasetiss‰.
     */
    const removePictureSet = (id: number) => {

        let pictureSet = {

            //Kyseess‰ on picturesetin tietokanta id, mutta sit‰ ei voi laittaa PictureSetId
            //nimell‰, koska ASP.NET ei ehk‰ ota sit‰ vastaan silloin.
            PictureSetId: id
        };
        let temp = {
            mKey: parseInt(sessionStorage.getItem("password") || ""),
            cPictureSet: pictureSet
        };

        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(temp)
        };

        fetch("/api/Pictures/RemovePictureset", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
                && json[0].mName && json[0].mAccessible > -1) {
                    
                let temp: ImageSetType[] = [];
                for (let i = 0; i < json.length; i++) {
                    temp.push({
                        mPictureSet: json[i].mPictureSet,
                        mPSID: Number(json[i].mPSID),
                        mName: json[i].mName,
                        mAccessible: Number(json[i].mAccessible)
                    });
                }
                
                setImageSet(temp);
                getPicturesBySet();
            } else {
                window.alert("Invalid JSON data.");
            }
        }).catch(error => {
            console.error("Error fetching data in removePictureSet: ", error);
        });
    }

    /**
     * T‰ll‰ metodilla haetaan toisten k‰ytt‰jien tekem‰t kuvasettien k‰yttˆoikeuspyynnˆt. 
     * K‰ytt‰m‰ll‰ getApplications.then(...) t‰m‰ metodi odottaa, ett‰ funktio on suoritettu ennen jatkamista.
     */
    const getApplications = async () => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: sessionStorage.getItem("password") || ""
        };

        try { 
            let response = await fetch("/api/Pictures/GetApplications", request);
            let json = await response.json();
            if (!response.ok) {
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            console.log(json);
            if (json && json.length === 0) return;
            if (json && json.length > 0 && json[0].mApplicantUser
                && json[0].mApplicantName && json[0].mPictureSet) {
                    /*
                let temp = new Array();
                for (let i = 0; i < json.length; i++) {
                    temp.push({
                        mApplicantUser: json[i].mApplicantUser,
                        mApplicantName: json[i].mApplicantName,
                        mPictureSet: json[i].mPictureSet,
                        mGranted: json[i].mGranted
                    });
                }
                */
                setApplications(json);
            } else {
                window.alert("Invalid JSON data.");
            }
        } catch(error) {
            console.error("Error fetching data in getApplications: ", error);
        }
    }

    /**
     * T‰ll‰ metodilla haetaan toisille k‰ytt‰jille myˆnnetyt kuvasettien k‰yttˆoikeudet. 
     * K‰ytt‰m‰ll‰ getAlloweds.then(...) t‰m‰ metodi odottaa, ett‰ funktio on suoritettu ennen jatkamista.
     */
    const getAlloweds = async () => {
        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: sessionStorage.getItem("password") || ""
        };

        try { 
            let response = await fetch("/api/Pictures/GetAlloweds", request);
            let json = await response.json();
            if (!response.ok) {
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            console.log(json);
            if (json && json.length === 0) return;
            if (json && json.length > 0 && json[0].mApplicantUser
                && json[0].mApplicantName && json[0].mPictureSet) {
                    /*
                let temp = new Array();
                for (let i = 0; i < json.length; i++) {
                    temp.push({
                        mApplicantUser: json[i].mApplicantUser,
                        mApplicantName: json[i].mApplicantName,
                        mPictureSet: json[i].mPictureSet,
                        mGranted: json[i].mGranted
                    });
                }
                */
                setAlloweds(json);
            } else {
                window.alert("Invalid JSON data.");
            }
        } catch(error) {
            console.error("Error fetching data in getAlloweds: ", error);
        }
    }

    /**
     * T‰ll‰ metodilla tallennetaan back-endiin myˆnnetyt ja ev‰tyt k‰yttˆluvat.
     * @param permissions
     */
    const setPermissions = (permissions: ApplicationType[]) => {

        let request = {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                "Password": sessionStorage.getItem("password") || ""
            },
            body: JSON.stringify(permissions)
        };

        fetch("/api/Pictures/setPermissions/", request).then(async (response) => {
            if (!response.ok) {
                let json = await response.json();
                errorWindow(response.status, json);
                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
            }
            return response.json();
        }).then(json => {
            console.log(json);
        }).catch(error => {
            console.error("Error sending data to back-end in setPermissions: ", error);
        });
    }

    const logout = () => {
        logoutBackend();
        sessionStorage.setItem("user", "");
        sessionStorage.setItem("name", "");
        sessionStorage.setItem("password", "");
        setPictureSet("");
 //       setImages([]);
        setImageSet([]);
        setChosenImageSet([]);
        setBodyText("");
    }

    /**
 * T‰m‰ eventti peruuttaa kuvasetin luomisen.
 * @param event
 */
    const onCancel2 = (event: any) => {
        event.preventDefault();
        javaScriptClose('custom-modal-2');

        //Lopuksi nollaamme bodytekstin.
        setBodyText("");
    }

    /**
     * K‰ytt‰j‰ luo kuvasetin.
     * @param event
     */
    const onSubmit2 = (event: any) => {
        event.preventDefault();
        javaScriptClose('custom-modal-2');

        // Varmistetaan, ett‰ k‰ytt‰j‰ on kirjottanut jotain.
        if (bodyText.length > 0) {

            addPictureSet(bodyText, null, null);
        }

        // Lopuksi nollaamme bodytekstin.
        setBodyText("");
    }

    /**
 * T‰m‰ eventti sulkee k‰yttˆoikeuksien hallintaikkunan ilman muutoksia k‰yttˆoikeuksiin.
 * @param event
 */
    const onCancel1 = (event: any) => {
        event.preventDefault();

        javaScriptClose('custom-modal-1');
        setAllowedsChanges([]);
        setApplicationsChanges([]);
    }

    /**
     * K‰ytt‰j‰ tallentaa k‰yttˆoikeuksiin tekem‰ns‰ muutokset.
     * @param event
     */
    const onSubmit1 = (event: any) => {
        event.preventDefault();
        javaScriptClose('custom-modal-1');

        // Selvitet‰‰n ja ryhmitell‰‰n, mitk‰ hakemukset on hyv‰ksytty ja mitk‰ eiv‰t ole.
        let alloweds1: ApplicationType[]= [];
        let applications1: ApplicationType[] = [];
        for (let index1 = 0; index1 < alloweds.length; index1++) {
            let allowed: boolean = alloweds[index1].mGranted;
            for (let index2 = 0; index2 < allowedsChanges.length; index2++) {
                if (index1 === allowedsChanges[index2]) {
                    allowed = !allowed;
                }
            }
            if (allowed) {
                alloweds[index1].mGranted = true;
                alloweds1.push(alloweds[index1]);
            }
            else {
                alloweds[index1].mGranted = false;
                applications1.push(alloweds[index1]);
            }
        }
        for (let index1 = 0; index1 < applications.length; index1++) {
            let allowed: boolean = applications[index1].mGranted;
            for (let index2 = 0; index2 < applicationsChanges.length; index2++) {
                if (index1 === applicationsChanges[index2]) {
                    allowed = !allowed;
                }
            }
            if (allowed) {
                applications[index1].mGranted = true;
                alloweds1.push(applications[index1]);
            }
            else {
                applications[index1].mGranted = false;
                applications1.push(applications[index1]);
            }
        }

        // Tyhjennet‰‰n statesta alloweds ja applications.
        setAlloweds([]);
        setApplications([]);
        setAllowedsChanges([]);
        setApplicationsChanges([]);

        // L‰hetet‰‰n katseluluvat backendiin.
        setPermissions(alloweds1.concat(applications1));
    }

    /**
     * T‰m‰ eventti vaihtaa kuvasetin k‰yttˆoikeuden myˆnteiseksi/kielteiseksi.
     * @param event
     * @param rowIndex
     * @param group
     */
    const onRowClick = (rowIndex: number, group: string) => (event: any) => {
        event.preventDefault();
        
        if (group === "alloweds") {
            let temp = allowedsChanges;
            temp.push(rowIndex);
            setAllowedsChanges(temp);
        }
        else {
            let temp = applicationsChanges;
            temp.push(rowIndex);
            setApplicationsChanges(temp);
        }

        const row = event.currentTarget;
        row.style.backgroundColor = getBackgroundColor(rowIndex, group === "alloweds" ? true : false);
    }

    /**
     * T‰m‰ apumetodi antaa k‰yttˆoikeuksien riveille v‰rin sen mukaan, onko k‰yttˆoikeus
     * myˆnnetty (vihre‰) vai ev‰tty (punainen). Koska muutetut k‰yttˆoikeudet vahvistetaan vasta,
     * kun k‰ytt‰j‰ klikkaa "ok", mutta muutosten pit‰‰ n‰ky‰ heti, tarvitaan erillinen kirjanpito 
     * muutoksista: t‰m‰ sijaitsee state-muuttujissa allowedsChanges ja applicationChanges.
     * @param rowIndex
     * @param granted
     * @returns
     */
    const getBackgroundColor = (rowIndex: number, granted: boolean) => {
        if (granted) {
            allowedsChanges.forEach(function(index) { 
                if (index === rowIndex) {
                    granted = !granted;
                }
            });
        }
        else {
            applicationsChanges.forEach(function(index) {
                if (index === rowIndex) {
                    granted = !granted;
                }
            });
        }  
        if (granted) {
            return "Green";
        }
        else {
            return "Red";
        }
    }

    /**
     * T‰m‰ p‰ivitt‰‰ k‰ytt‰j‰n kirjoittamat kirjaimet stateen.
     * @param event
     */
    const bodyTextChange = (event: any) => {
        setBodyText(event.target.value);
    }

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={
                        <div>
                            <Navi getClickedButtonId={buttonState} imageSets={imageSet}
                                logout={logout} removePictureSet={removePictureSet}
                                getApplications={getApplications} getAlloweds={getAlloweds} />
                            <ImageView imagesByButtonClicked={chosenImageSet} login={loginBackend}
                                subscribe={subscribeBackend} removePicture={removePicture}
                                currentPictureSet={pictureSet} />       
                        </div>
                    } />
                    <Route path="/newpic" element={
                        <div>
                            <Navi getClickedButtonId={buttonState} imageSets={imageSet}
                                logout={logout} removePictureSet={removePictureSet}
                                getApplications={getApplications} getAlloweds={getAlloweds} />
                            <Newpic currentPictureSet={pictureSet} saveData={saveData}
                                savePicture={savePicture} />
                        </div>
                    }/>
                </Routes>
            </BrowserRouter>

            <JwModal id="custom-modal-2" key="custom-modal-2">
                    <div>
                        <h1>Create Picture Set</h1>
                        <form className="form2" onSubmit={onSubmit2}>
                            <fieldset>
                                <label>Write below a name of your new picture set:</label>
                                <input type="text"
                                    name="bodyText"
                                    onChange={bodyTextChange}
                                    value={bodyText} />
                            </fieldset>
                            <fieldset>
                                <table style={{ border: "none", boxShadow: "none" }}>
                                    <tbody>
                                        <tr>
                                            <td align="center">
                                                <Button type="submit">Ok</Button>
                                                <Button onClick={onCancel2}>Cancel</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </fieldset>
                        </form>
                    </div>
            </JwModal>
            
            <JwModal id="custom-modal-1" key="custom-modal-1">
                    <div>
                        <h1>Picture Viewing Permissions</h1>
                        <form className="form1">
                            <fieldset>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "50%" }}>Applicant Name</th>
                                            <th style={{ width: "50%" }}>Picture Set</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alloweds.map((row, rowIndex) => (
                                            <tr key={rowIndex} onClick={onRowClick(rowIndex, "alloweds")}
                                                style={{ backgroundColor: getBackgroundColor(rowIndex, row.mGranted) }}>
                                                <td>{row.mApplicantName}</td>
                                                <td>{row.mPictureSet}</td>
                                            </tr>
                                        ))}
                                        {applications.map((row, rowIndex) => (
                                            <tr key={rowIndex} onClick={onRowClick(rowIndex, "applications")}
                                                style={{ backgroundColor: getBackgroundColor(rowIndex, row.mGranted) }}>
                                                <td>{row.mApplicantName}</td>
                                                <td>{row.mPictureSet}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </fieldset>
                            <fieldset>
                                <table style={{ border: "none", boxShadow: "none" }}>
                                    <tbody>
                                        <tr>
                                            <td align="center">
                                                <Button onClick={onSubmit1}>Ok</Button>
                                                <Button onClick={onCancel1}>Cancel</Button>
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

export { App };


/**
 * Alla on JavaScript luokkaversio yl‰puolen Typescript-versiosta.
 */






//class App extends React.Component {

//    constructor(props) {
//        super(props);

//        this.state = {
//            pictureSet: "",
//            images: [],
//            imageSet: [],
//            chosenImageSet: [],
//            bodyText: "",
//            applications: [],
//            alloweds: [],
//            applicationsChanges: [],
//            allowedsChanges: []
//        }
//    }

//    errorWindow(status, json) {
//        let message = `Server responded with status: ${status} \nError message: ${json}`;
//        window.alert(message);
//    }

//    /**
//     * T‰ll‰ funktiolla kirjaudutaan backendiin.
//     */
//    loginBackend = (login) => {
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(login)
//        };

//        fetch("/api/Pictures/Login", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json.mPassword && json.mName && json.mUser) {
//                sessionStorage.setItem("password", json.mPassword);
//                sessionStorage.setItem("name", json.mName);
//                sessionStorage.setItem("user", json.mUser);
//                this.getPicturesBySet();
//            } else {
//                window.alert("Invalid JSON content. Please try again.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in loginBackend: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ funktiolla uusi k‰ytt‰j‰ luo itselleen tilin.
//     */
//    subscribeBackend = (subs) => {
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(subs)
//        };

//        fetch("/api/Pictures/Subscribe", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json) {
//                sessionStorage.setItem("password", json);
//                sessionStorage.setItem("name", subs.mName);
//                sessionStorage.setItem("user", subs.mUser);
//                this.getPicturesBySet();
//            } else {
//                window.alert("Invalid JSON content. Please try to log in with your current credentials and if that doesn't work, subscribe with a new username.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in subscribeBackend: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ kirjaudutaan ulos backendist‰.
//     * */
//    logoutBackend = () => {
//        let temp = {
//            mUser: sessionStorage.getItem("user"),
//            mTemporaryID: parseInt(sessionStorage.getItem("password"))
//        };
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(temp)
//        };

//        fetch("/api/Pictures/Logout", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//        }).catch(error => {
//            console.error("Error fetching data in logoutBackend: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ haetaan kaikki tarjolla olevat kuvasetit kaikilta k‰ytt‰jilt‰ ja lis‰ksi k‰ytt‰j‰t.
//     */
//    getPicturesBySet = () => {

//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: sessionStorage.getItem("password")
//        };

//        fetch("/api/Pictures/GetSets", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
//                && json[0].mName && json[0].mAccessible > -1) {
//                let temp = [];
//                for (let i = 0; i < json.length; i++) {
//                    temp.push([json[i].mPictureSet, json[i].mPSID,
//                    json[i].mName, json[i].mAccessible]);
//                }
//                this.setState({ imageSet: temp });
//            } else {
//                window.alert("Invalid JSON data.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in getPicturesBySet: ", error);
//        });
//    }

//    /**
//     * T‰ss‰ katsotaan kuinka monta kuvaa tulee kyseisen painetun napin kuvasettiin ja vied‰‰n data 
//     * imageView.js komponenttiin
//     */
//    buttonState = (id) => {
//        dataholding.setClickedNaviButton(true);
//        let temp = {
//            mPSID: parseInt(id = id || 0),
//            mKey: parseInt(sessionStorage.getItem("password"))
//        };
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(temp)
//        };

//        fetch("/api/Pictures/GetPictures", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json && json.length > 0 && json[0].PictureId != -1 && json[0].mUserId != -1) {
//                this.setState({ chosenImageSet: json, pictureSet: json[0].mPictureSet });
//            } else {
//                this.setState({ chosenImageSet: [], pictureSet: json[0].mPictureSet });
//                window.alert("Couldn't get any pictures. Requested pictureset is either empty or you are not allowed to see pictures. If you are not allowed, the owner of the pictures may allow you to see the pictures at later time.")
//            }
//        }).catch(error => {
//            console.error("Error fetching data in buttonState: ", error);
//        });
//    }

//    /**
// * SaveData ja SavePicture yhdistelm‰ll‰ lis‰t‰‰n kuva tietokantaan haluttuun kuvasettiin ja 
// * kuvan data talletetaan k‰ytt‰j‰n koneelta Cloudinary pilvipalveluun, josta saadaan url-osoite.
// * Kuvan lis‰‰minen tietokantaan on kaksivaiheinen prosessi teknisist‰ rajoitteista johtuen ja
// * edellytt‰‰ kahta eri kutsua backendiin: Itse kuva, kuvadata, pit‰‰ tallentaa Cloudinaryyn, 
// * ja t‰m‰ suoritetaan erillisell‰ SaveData-funktiolla, jolla backend hoitaa asian Cloudinaryn 
// * kanssa ja palauttaa kuvan url-osoitteen. Sitten kyseinen kuva tallennetaan tietokantaan
// * SavePicture-funktiolla, kun url-osoite on tiedossa. Syy, miksi t‰m‰ luontaisesti yhdell‰ 
// * funktiolla suoritettava teht‰v‰ on jaettu kahteen on, ett‰ datan l‰hett‰minen bodyssa 
// * edellytt‰‰ ettei bodyssa l‰hetet‰ mit‰‰n muuta tietoa. SaveData:
// */
//    saveData = (data) => {

//        let request = {
//            method: 'POST',
//            body: data.file,
//        };
//        let id = parseInt(sessionStorage.getItem("password"));

//        fetch("/api/Pictures/SaveData/" + id, request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);

//            //Varmistutuaan ensin, ett‰ kuvadata on tallennettu Cloudinaryyn
//            if (json && json.mURL) {

//                //Sitten tallennetaan kuva tietokantaan.
//                let picture = {
//                    pictureSet: data.pictureSet,
//                    url: json.mURL,
//                    legend: data.legend
//                };
//                this.savePicture(picture);
//            } else {

//                //Jos kuvaa ei saatu tallennettua Cloudinaryyn
//                window.alert("Couldn't load image data into Cloudinary.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in saveData: ", error);
//        });
//    }

//    /**
//     * SavePicture funktiolla lis‰t‰‰n kuvan url-osoite ja kuvateksti k‰ytt‰j‰n haluamaan 
//     * kuvakokoelmaan, niin ett‰ kuva n‰kyy Picture Catalogissa jos k‰ytt‰j‰ on itse tallentanut
//     * kuvan kyseiseen url osoitteeseen tai siell‰ on kolmannen osapuolen kuva.
//     */
//    savePicture = (data) => {

//        let picture = {
//            mUserID: 0,
//            mPictureSet: data.pictureSet,
//            mURL: data.url,
//            mLegend: data.legend
//        };
//        let temp = {
//            mKey: parseInt(sessionStorage.getItem("password")),
//            mPicture: picture
//        };
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(temp)
//        };

//        fetch("/api/Pictures/SavePicture", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json && json.length > 0 && json[0].mPictureSet) {
//                this.setState({ chosenImageSet: json });
//                this.setState({ pictureSet: json[0].mPictureSet });
//            } else {
//                window.alert("Couldn't save your picture to the database. Logout, login and try again.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in savePicture: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ poistetaan kuva tietyst‰ kuvasetist‰, mutta ei poisteta kuvaa tietokannasta, 
//     * jos se esiintyy jossain toisessa kuvasetiss‰.
//     */
//    removePicture = (data) => {
//        let picture = {
//            mUserID: 0,
//            PictureId: parseInt(data.PID = data.PID || 0),
//            mPictureSet: data.pictureSet,
//            mURL: data.url,
//        };
//        let temp = {
//            mKey: parseInt(sessionStorage.getItem("password")),
//            mPicture: picture
//        };
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(temp)
//        };

//        fetch("/api/Pictures/RemovePicture", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json) {
//                this.setState({ chosenImageSet: json });
//                if (json.length > 0 && json[0].mPictureSet) {
//                    this.setState({ pictureSet: json[0].mPictureSet });
//                } else {
//                    this.setState({ pictureSet: "" });
//                }
//            } else {
//                window.alert("Invalid JSON data.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in removePicture: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ tuhotaan kuva tietokannasta ja poistetaan se kaikista kuvaseteist‰. Kuvaa etsit‰‰n
//     * tietokannasta ainoastaan annetun URL-osoitteen perusteella.
//     */
//    deletePicture = (data) => {
//        let picture = {
//            mUserID: 0,
//            mURL: data.url
//        };
//        let temp = {
//            mKey: parseInt(sessionStorage.getItem("password")),
//            mPicture: picture
//        };
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(temp)
//        };

//        fetch("/api/Pictures/DeletePicture", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//        }).catch(error => {
//            console.error("Error fetching data in deletePicture: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ lis‰t‰‰n k‰ytt‰j‰lle uusi kuvasetti tai muokataan jo olemassa olevaa.
//     * @param psName Kuvasetin nimi
//     * @param pData Jos mukaan sis‰llytet‰‰n kuvia, ne sijoitetaan t‰h‰n objektiin
//     * @param aData Jos mukaan sis‰llytet‰‰n k‰yttˆoikeuksien muutoksia, ne sijoitetaan t‰h‰n objektiin
//     */
//    addPictureSet = (psName, pData, aData) => {

//        let pictures = [];

//        if (pData !== null)
//            for (let i = 0; i < pData.length; i++) {
//                pictures.push({
//                    PictureId: parseInt(pData[i].pictureId = pData[i].pictureId || 0),
//                    mURL: pData[i].URL,
//                    mLegend: pData[i].legend
//                });
//            }

//        let allowedUsers = [];

//        if (aData !== null)
//            for (let i = 0; i < aData.length; i++) {
//                allowedUsers.push({
//                    mAllowedUser: aData[i].allowedUser,
//                    mPictureSet: aData[i].picSet
//                });
//            }
//        let pictureSet1 = {
//            mPictureSet: psName,
//            cPictures: pictures,
//            cAllowedUsers: allowedUsers
//        };
//        let temp = {
//            mKey: parseInt(sessionStorage.getItem("password")),
//            cPictureSet: pictureSet1
//        };

//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(temp)
//        };

//        fetch("/api/Pictures/AddPictureset", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
//                && json[0].mName && json[0].mAccessible > -1) {
//                let temp = [];
//                for (let i = 0; i < json.length; i++) {
//                    temp.push([json[i].mPictureSet, json[i].mPSID,
//                    json[i].mName, json[i].mAccessible]);
//                }
//                let state = {
//                    pictureSet: pictureSet1.mPictureSet,
//                    images: this.state.images,
//                    imageSet: temp,
//                    chosenImageSet: this.state.chosenImageSet,
//                    bodyText: this.state.bodyText
//                };
//                this.setState(state);
//                const picset = (q) => (q[0] === pictureSet1.mPictureSet && sessionStorage.getItem("name") === q[2]);
//                this.buttonState(temp[temp.findIndex(picset)][1]);
//            } else {
//                window.alert("Invalid JSON data.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in addPictureSet: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ poistetaan k‰ytt‰j‰lt‰ kuvasetti. Kuvasetin kuvia ei poisteta tietokannasta, jos 
//     * ne esiintyv‰t myˆs jossain toisessa kuvasetiss‰.
//     */
//    removePictureSet = (id) => {

//        let pictureSet = {

//            //Kyseess‰ on picturesetin tietokanta id, mutta sit‰ ei voi laittaa PictureSetId
//            //nimell‰, koska ASP.NET ei ehk‰ ota sit‰ vastaan silloin.
//            mUserId: parseInt(id = id || 0)
//        };
//        let temp = {
//            mKey: parseInt(sessionStorage.getItem("password")),
//            cPictureSet: pictureSet
//        };

//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: JSON.stringify(temp)
//        };

//        fetch("/api/Pictures/RemovePictureset", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//            if (json && json.length > 0 && json[0].mPictureSet && json[0].mPSID > -1
//                && json[0].mName && json[0].mAccessible > -1) {
//                let temp = new Array();
//                for (let i = 0; i < json.length; i++) {
//                    temp.push([json[i].mPictureSet, json[i].mPSID, json[i].mName, json[i].mAccessible]);
//                }
//                let state = {
//                    pictureSet: this.state.pictureSet,
//                    images: this.state.images,
//                    imageSet: temp,
//                    chosenImageSet: this.state.chosenImageSet,
//                    bodyText: this.state.bodyText
//                };
//                this.setState(state);
//                this.getPicturesBySet();
//            } else {
//                window.alert("Invalid JSON data.");
//            }
//        }).catch(error => {
//            console.error("Error fetching data in removePictureSet: ", error);
//        });
//    }

//    /**
//     * T‰ll‰ synkronisella metodilla haetaan toisten k‰ytt‰jien tekem‰t kuvasettien 
//     * k‰yttˆoikeuspyynnˆt. T‰m‰ metodi odottaa, ett‰ response on saapunut ennen jatkamista.
//     */
//    getApplications = async () => {
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: sessionStorage.getItem("password")
//        };

//        try {
//            let response = await fetch("/api/Pictures/GetApplications", request);
//            if (!response.ok) {
//                let json = response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            let json = await response.json();
//            console.log(json);
//            if (json && json.length === 0) return;
//            if (json && json.length > 0 && json[0].mApplicantUser
//                && json[0].mApplicantName && json[0].mPictureSet && json[0].mGranted) {
//                let temp = new Array();
//                for (let i = 0; i < json.length; i++) {
//                    temp.push({
//                        mApplicantUser: json[i].mApplicantUser,
//                        mApplicantName: json[i].mApplicantName,
//                        mPictureSet: json[i].mPictureSet,
//                        mGranted: json[i].mGranted
//                    });
//                }
//                this.setState({ applications: temp });
//            } else {
//                window.alert("Invalid JSON data.");
//            }
//        } catch (error) {
//            console.error("Error fetching data in getApplications: ", error);
//        }
//    }

//    /**
//     * T‰ll‰ synkronisella metodilla haetaan toisille k‰ytt‰jille myˆnnetyt kuvasettien 
//     * k‰yttˆoikeudet. T‰m‰ metodi odottaa, ett‰ response on saapunut ennen jatkamista.
//     */
//    getAlloweds = async () => {
//        let request = {
//            method: "POST",
//            headers: { "Content-type": "application/json" },
//            body: sessionStorage.getItem("password")
//        };

//        try {
//            let response = await fetch("/api/Pictures/GetAlloweds", request);
//            if (!response.ok) {
//                let json = response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            let json = await response.json();
//            console.log(json);
//            if (json && json.length === 0) return;
//            if (json && json.length > 0 && json[0].mApplicantUser
//                && json[0].mApplicantName && json[0].mPictureSet && json[0].mGranted) {
//                let temp = new Array();
//                for (let i = 0; i < json.length; i++) {
//                    temp.push({
//                        mApplicantUser: json[i].mApplicantUser,
//                        mApplicantName: json[i].mApplicantName,
//                        mPictureSet: json[i].mPictureSet,
//                        mGranted: json[i].mGranted
//                    });
//                }
//                this.setState({ alloweds: temp });
//            } else {
//                window.alert("Invalid JSON data.");
//            }
//        } catch (error) {
//            console.error("Error fetching data in getAlloweds: ", error);
//        }
//    }

//    /**
//     * T‰ll‰ metodilla tallennetaan back-endiin myˆnnetyty ja ev‰tyt k‰yttˆluvat.
//     * @param permissions
//     */
//    setPermissions = async (permissions) => {

//        let request = {
//            method: "PUT",
//            headers: {
//                "Content-type": "application/json",
//                "Password": sessionStorage.getItem("password")
//            },
//            body: JSON.stringify(permissions)
//        };

//        fetch("/api/Pictures/setPermissions/", request).then(async (response) => {
//            if (!response.ok) {
//                let json = await response.json();
//                this.errorWindow(response.status, json);
//                throw new Error(`HTTP error! Status: ${response.status}, ${json}`);
//            }
//            return response.json();
//        }).then(json => {
//            console.log(json);
//        }).catch(error => {
//            console.error("Error sending data to back-end in setPermissions: ", error);
//        });
//    }

//    logout = () => {
//        this.logoutBackend();
//        sessionStorage.setItem("user", "");
//        sessionStorage.setItem("name", "");
//        sessionStorage.setItem("password", "");
//        let state = {
//            pictureSet: "",
//            images: [],
//            imageSet: [],
//            chosenImageSet: [],
//            bodyText: ""
//        }
//        this.setState(state);
//    }

//    /**
// * T‰m‰ eventti peruuttaa kuvasetin luomisen.
// * @param event
// */
//    onCancel2 = (event) => {
//        event.preventDefault();
//        JwModal.javaScriptClose('custom-modal-2');

//        //Lopuksi nollaamme bodytekstin.
//        let state = {
//            pictureSet: this.state.pictureSet,
//            images: this.state.images,
//            imageSet: this.state.imageSet,
//            chosenImageSet: this.state.chosenImageSet,
//            bodyText: ""
//        };
//        this.setState(state);
//    }

//    /**
//     * K‰ytt‰j‰ luo kuvasetin.
//     * @param event
//     */
//    onSubmit2 = (event) => {
//        event.preventDefault();
//        JwModal.javaScriptClose('custom-modal-2');

//        // Varmistetaan, ett‰ k‰ytt‰j‰ on kirjottanut jotain.
//        if (this.state.bodyText.length > 0) {

//            this.addPictureSet(this.state.bodyText, null, null);
//        }

//        // Lopuksi nollaamme bodytekstin.
//        let state = {
//            pictureSet: this.state.pictureSet,
//            images: this.state.images,
//            imageSet: this.state.imageSet,
//            chosenImageSet: this.state.chosenImageSet,
//            bodyText: ""
//        };
//        this.setState(state);
//    }

//    /**
// * T‰m‰ eventti sulkee k‰yttˆoikeuksien hallintaikkunan ilman muutoksia k‰yttˆoikeuksiin.
// * @param event
// */
//    onCancel1 = (event) => {
//        event.preventDefault();

//        JwModal.javaScriptClose('custom-modal-1');
//        this.state.allowedsChanges = [];
//        this.state.applicationsChanges = [];
//    }

//    /**
//     * K‰ytt‰j‰ tallentaa k‰yttˆoikeuksiin tekem‰ns‰ muutokset.
//     * @param event
//     */
//    onSubmit1 = (event) => {
//        event.preventDefault();
//        JwModal.javaScriptClose('custom-modal-1');

//        // Selvitet‰‰n ja ryhmitell‰‰n, mitk‰ hakemukset on hyv‰ksytty ja mitk‰ eiv‰t ole.
//        let alloweds = [];
//        let applications = [];
//        for (let index1 = 0; index1 < this.state.alloweds.length; index1++) {
//            let allowed = this.state.alloweds[index1].mGranted;
//            for (let index2 = 0; index2 < this.state.allowedsChanges.length; index2++) {
//                if (index1 === this.state.allowedsChanges[index2]) {
//                    allowed = !allowed;
//                }
//            }
//            if (allowed) {
//                this.state.alloweds[index1].mGranted = true;
//                alloweds.push(this.state.alloweds[index1]);
//            }
//            else {
//                this.state.alloweds[index1].mGranted = false;
//                applications.push(this.state.alloweds[index1]);
//            }
//        }
//        for (let index1 = 0; index1 < this.state.applications.length; index1++) {
//            let allowed = this.state.applications[index1].mGranted;
//            for (let index2 = 0; index2 < this.state.applicationsChanges.length; index2++) {
//                if (index1 === this.state.applicationsChanges[index2]) {
//                    allowed = !allowed;
//                }
//            }
//            if (allowed) {
//                this.state.applications[index1].mGranted = true;
//                alloweds.push(this.state.applications[index1]);
//            }
//            else {
//                this.state.applications[index1].mGranted = false;
//                applications.push(this.state.applications[index1]);
//            }
//        }

//        // Tyhjennet‰‰n statesta alloweds ja applications.
//        this.state.alloweds = [];
//        this.state.applications = [];
//        this.state.allowedsChanges = [];
//        this.state.applicationsChanges = [];

//        // L‰hetet‰‰n katseluluvat backendiin.
//        this.setPermissions(alloweds.concat(applications));
//    }

//    /**
//     * T‰m‰ eventti vaihtaa kuvasetin k‰yttˆoikeuden myˆnteiseksi/kielteiseksi.
//     * @param event
//     * @param rowIndex
//     * @param row
//     */
//    onRowClick = (rowIndex, group) => (event) => {
//        event.preventDefault();

//        if (group === "alloweds") {
//            let temp = this.state.allowedsChanges;
//            temp.push(rowIndex);
//            this.setState({ allowedsChanges: temp });
//        }
//        else {
//            let temp = this.state.applicationsChanges;
//            temp.push(rowIndex);
//            this.setState({ applicationsChanges: temp });
//        }
//    }

//    /**
//     * T‰m‰ apumetodi antaa k‰yttˆoikeuksien riveille v‰rin sen mukaan, onko k‰yttˆoikeus
//     * myˆnnetty (vihre‰) vai ev‰tty (punainen). Koska muutetut k‰yttˆoikeudet vahvistetaan vasta,
//     * kun k‰ytt‰j‰ klikkaa "ok", mutta muutosten pit‰‰ n‰ky‰ heti, tarvitaan erillinen kirjanpito 
//     * muutoksista: t‰m‰ sijaitsee state-muuttujissa allowedsChanges ja applicationChanges.
//     * @param granted
//     * @returns
//     */
//    getBackgroundColor = (rowIndex, granted) => {
//        if (granted) {
//            this.state.allowedsChanges.forEach(function (index) {
//                if (index === rowIndex) {
//                    granted = !granted;
//                }
//            });
//        }
//        else {
//            this.state.applicationsChanges.forEach(function (index) {
//                if (index === rowIndex) {
//                    granted = !granted;
//                }
//            });
//        }
//        if (granted) {
//            return "Green";
//        }
//        else {
//            return "Red";
//        }
//    }

//    /**
//     * Kutsu t‰t‰ metodia n‰ytt‰‰ksesi custom-modal-1 modaalin.
//     */
//    /*
//    openCustomModal1 = () => {
//        let state = {
//            pictureSet: this.state.pictureSet,
//            images: this.state.images,
//            imageSet: this.state.imageSet,
//            chosenImageSet: this.state.chosenImageSet,
//            bodyText: this.state.bodyText
//        };
//        this.setState(state);
//    }
//    */
//    /**
//     * T‰m‰ p‰ivitt‰‰ k‰ytt‰j‰n kirjoittamat kirjaimet stateen.
//     * @param event
//     */
//    handleChange = (event) => {
//        const { name, value } = event.target;
//        this.setState({ [name]: value });
//    }

//    Render() {

//        const { bodyText } = this.state.bodyText;

//        return (
//            <div className="App">
//                <Switch>
//                    <Route exact path="/" render={() => (
//                        <div>
//                            <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet}
//                                logout={this.logout} addPictureSet={this.addPictureSet}
//                                removePictureSet={this.removePictureSet} getApplications={this.getApplications}
//                                getAlloweds={this.getAlloweds} />
//                            <Images imagesByButtonClicked={this.state.chosenImageSet} login={this.loginBackend}
//                                subscribe={this.subscribeBackend} removePicture={this.removePicture}
//                                currentPictureSet={this.state.pictureSet} />
//                        </div>
//                    )} />
//                    <Route path="/newpic" render={() => (
//                        <div>
//                            <Navi getClickedButtonId={this.buttonState} imageSets={this.state.imageSet}
//                                logout={this.logout} addPictureSet={this.addPictureSet}
//                                removePictureSet={this.removePictureSet} getApplications={this.getApplications}
//                                getAlloweds={this.getAlloweds} />
//                            <NewPic currentPictureSet={this.state.pictureSet} saveData={this.saveData}
//                                savePicture={this.savePicture} />
//                        </div>
//                    )} />
//                </Switch>

//                <JwModal id="custom-modal-2" key="custom-modal-2">
//                    <div>
//                        <h1>Create Picture Set</h1>
//                        <form className="form2" onSubmit={this.onSubmit2}>
//                            <fieldset>
//                                <label>Write below a name of your new picture set:</label>
//                                <input type="text"
//                                    name="bodyText"
//                                    onChange={this.handleChange}
//                                    value={bodyText} />
//                            </fieldset>
//                            <fieldset>
//                                <table style={{ border: "none", boxShadow: "none" }}>
//                                    <tbody>
//                                        <tr>
//                                            <td align="center">
//                                                <Button type="submit">Ok</Button>
//                                                <Button onClick={this.onCancel2}>Cancel</Button>
//                                            </td>
//                                        </tr>
//                                    </tbody>
//                                </table>
//                            </fieldset>
//                        </form>
//                    </div>
//                </JwModal>

//                <JwModal id="custom-modal-1" key="custom-modal-1">
//                    <div>
//                        <h1>Picture Viewing Permissions</h1>
//                        <form className="form1">
//                            <fieldset>
//                                <table>
//                                    <thead>
//                                        <tr>
//                                            <th style={{ width: "50%" }}>Applicant Name</th>
//                                            <th style={{ width: "50%" }}>Picture Set</th>
//                                        </tr>
//                                    </thead>
//                                    <tbody>
//                                        {this.state.alloweds.map((row, rowIndex) => (
//                                            <tr key={rowIndex} onClick={this.onRowClick(rowIndex, "alloweds")}
//                                                style={{ backgroundColor: this.getBackgroundColor(rowIndex, row.mGranted) }}>
//                                                <td>{row.mApplicantName}</td>
//                                                <td>{row.mPictureSet}</td>
//                                            </tr>
//                                        ))}
//                                        {this.state.applications.map((row, rowIndex) => (
//                                            <tr key={rowIndex} onClick={this.onRowClick(rowIndex, "applications")}
//                                                style={{ backgroundColor: this.getBackgroundColor(rowIndex, row.mGranted) }}>
//                                                <td>{row.mApplicatnName}</td>
//                                                <td>{row.mPictureSet}</td>
//                                            </tr>
//                                        ))}
//                                    </tbody>
//                                </table>
//                            </fieldset>
//                            <fieldset>
//                                <table style={{ border: "none", boxShadow: "none" }}>
//                                    <tbody>
//                                        <tr>
//                                            <td align="center">
//                                                <Button onClick={this.onSubmit1}>Ok</Button>
//                                                <Button onClick={this.onCancel1}>Cancel</Button>
//                                            </td>
//                                        </tr>
//                                    </tbody>
//                                </table>
//                            </fieldset>
//                        </form>
//                    </div>
//                </JwModal>

//            </div>
//        );
//    }
//}

//export default App;