import React, { useState, FC } from "react";
//import ".././main.css";
import "../main.css";
import * as rs from 'react-bootstrap';
import { Plus, XCircle, InfoCircle } from 'react-bootstrap-icons';
import { JwModal, useModalSharedState } from './Modal';
import { Button, Table } from "@mui/material";
import { useForm } from "react-hook-form";
import { ImageSetType } from '../App'; 
/*
type ImageSetType = {
    mImageSet: string, mPSID: number, mName: string, mAccess: number 
}
*/
interface Props {
    imageSets: ImageSetType[],
    getClickedButtonId: (id: number) => void,
    logout: () => void,
    removePictureSet: (id: number) => void,
    getApplications: () => Promise<void>,
    getAlloweds: () => Promise<void>
}

const Navi: FC<Props> = ({ imageSets, getClickedButtonId, logout, removePictureSet,
    getApplications, getAlloweds }) => {
    const [current, setCurrent] = useState<string>("");
    const [index, setIndex] = useState<number>(0);
    let sets: React.JSX.Element[] = [];
    let names: ImageSetType[] = [];
    const {
        addModal, removeModal,
        jsxOpen, jsxClose, javaScriptOpen, javaScriptClose
    } = useModalSharedState();

    /**
     * Tämä eventti avaa käyttäjän valitseman nimen sisältämät kuvasetit alasvetovalikkona.
     * @param event
     */
    const onClick1 = (event: any) => {
        let clickedButton = event.target.getAttribute("data-id");
        let i = event.target.id;
        setCurrent(clickedButton);
        setIndex(Number(i));
    }

    /**
     * Tämä eventti avaa käyttäjän valitseman kuvasetin, jos käyttäjällä on siihen käyttöoikeus.
     * @param event
     */
    const onClick2 = (event: any) => {      
        let clickedButton: number = event.currentTarget.getAttribute("data-id");
        getClickedButtonId(clickedButton);
    }

    /**
     * Tämä eventti kirjaa käyttäjän ulos palvelusta.
     * */
    const logoutService = () => {
        logout();
        setCurrent("");
        setIndex(0);
    }

    /**
     * Tämä eventti poistaa kuvasetin.
     * @param event
     */
    const removeSet = (event: any) => {
        let clickedButton: number = event.target.getAttribute("data-id");
        removePictureSet(clickedButton);
    }

    /**
     * Tällä eventillä käyttäjä valitsee, ketkä toiset käyttäjät voivat/eivät voi nähdä kuvasettiä, vaikka eivät olisi 
     * anoneet sitä.
     * @param event
     */
    const editSet = (event: any) => {
        let clickedButton: number = event.target.getAttribute("data-id");
        window.alert("This is not implemented yet!");
    }

    /**
     * Tällä käyttäjä voi myöntää ja evätä katselulupia kuvaseteilleen.
     * @param event
     */
    const manage = (event: any) => {
        getApplications().then(() => {
             getAlloweds().then(() => {
                 javaScriptOpen("custom-modal-1"); 
            });
        });  
    }

    //Käyttäjä on kirjautunut sisään, mutta ei ole avannut yhdenkään 
    //käyttäjän drop - down kuvasettilistaa.
    if (imageSets.length > 0 && !current) {

        // Otamme vain imagesetit, jotka eivät sisällä imagesettiä, vaan ainoastaan nimen: silloin
        // PSID on nolla.
        names = imageSets.filter(o => o.mPSID === 0);
        sets = names.map((name: ImageSetType, index: number) =>
            <rs.Button className="buttonstyle"
                onClick={onClick1}
                id={index.toString()}
                key={index}
                data-id={name.mPictureSet}>{(name.mName)}</rs.Button>
        );
        return (
            <div className="navbarstyle">
                <rs.Button className="buttonStyle" onClick={logoutService}>Logout</rs.Button>
                <br/>
                <rs.Button className="buttonStyle" onClick={manage}>Permits</rs.Button>
                {sets}
            </div>
        );

    //Käyttäjä on kirjautunut sisään ja avannut jonkun käyttäjän kuvasetit.
    } else if (current) {

        //Otamme vain imagesetit, jotka eivät sisällä imagesettiä, vaan ainoastaan nimen.
        names = imageSets.filter(o => o.mPSID === 0);

        //Täytetään listaan käyttäjänapit siihen asti, kunnes olemme sen käyttäjän kohdalla,
        //jonka kuvasetit on valittu näytettäviksi.
        for (let i = 0; i < index + 1; i++) {
            sets.push(
                <rs.Button className="buttonstyle"
                    onClick={onClick1}
                    id={i.toString()}
                    key={i}
                    data-id={names[i].mPictureSet}>{(names[i].mName)}</rs.Button>
            );
        }

        //Lisätään nappula uuden kuvasetin lisäämiseksi, jos käyttäjä on omissa seteissään.
        if (current === sessionStorage.getItem("user")) {
            sets.push(
                <rs.Button className="buttonstyle" key="add-imageset-button"
                    onClick={jsxOpen("custom-modal-2")}><Plus size={32} /></rs.Button>
            );
        }

        //Seuraavaksi lisätään listaan kuvasettien sub-napit, eli otamme valitun käyttäjän imagesetit:
        let location = imageSets.findIndex(o => o.mPictureSet === current && o.mPSID === 0);
        if (location > -1) {
            location++;
            let index = 1;
            while (location < imageSets.length && imageSets[location].mPSID !== 0) {
                let style = "buttonstyle";
                if (imageSets[location].mAccessible == 1) {
                    style = "buttonstyle_green";
                }
                if (imageSets[location].mAccessible == 0) {
                    style = "buttonstyle_red";
                }   
                if (current === sessionStorage.getItem("user")) {

                    //Jos käyttäjä on omissa seteissään...
                    sets.push(
                        <div key={"sub-button-" + index}>
                            <rs.Button className={style}
                                onClick={onClick2}
                                data-id={imageSets[location].mPSID}>
                                 
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%'
                                }}>
                                    <span>
                                        {(imageSets[location].mPictureSet)}
                                    </span>
                                    <span>
                                        <XCircle size={16}
                                                className="deleteIconSmall"
                                                onClick={(e) => { e.stopPropagation(); removeSet(e) }}
                                                data-id={imageSets[location].mPSID}/>
                                        <InfoCircle size={16}
                                                className="editIconSmall"
                                                onClick={(e) => { e.stopPropagation(); editSet(e) }}
                                                data-id={imageSets[location].mPSID} />
                                    </span>
                                </div>
                               
                            </rs.Button>
                        </div>
                    );
                } else {

                    //Jos käyttäjä tarkastelee toisen käyttäjän settejä...
                    sets.push(
                        <rs.Button className={style}
                            key={"sub-button-" + index}
                            onClick={onClick2}
                            data-id={imageSets[location].mPSID}>
                            {(imageSets[location].mPictureSet)}
                        </rs.Button>
                    );
                }
                location++;
                index++;
            }
        }

        //Sitten lisätään loput käyttäjänapit.
        for (let i = index+1; i < names.length; i++) {
            sets.push(
                <rs.Button className="buttonstyle"
                    onClick={onClick1}
                    id={i.toString()}
                    key={i}
                    data-id={names[i].mPictureSet}>{(names[i].mName)}</rs.Button>
            );
        }

        //Loppujen lopuksi palautetaan jotain renderoitavaa.
        return (
            <div className="navbarstyle">
                <rs.Button className="buttonStyle" onClick={logoutService}>Logout</rs.Button>
                <br/>
                <rs.Button className="buttonStyle" onClick={manage}>Permits</rs.Button>
                {sets}
            </div>
        );

     //Käyttäjä ei ole kirjautunut sisään.
    } else {
        return (
            <div className="navbarstyle">

            </div>
        );
    }
}
export default Navi;



/**
 * Alla on JavaScript luokkaversio yläpuolen Typescript-versiosta.
 */



//export default class Navi extends React.Component {

//    constructor(props) {
//        super(props);
//        this.state = {
//            current: "",
//            index: 0,
//        };
//    }

//    /**
//     * Tämä eventti avaa käyttäjän valitseman nimen sisältämät kuvasetit alasvetovalikkona.
//     * @param event
//     */
//    onClick1 = (event) => {
//        let clickedButton = event.target.getAttribute("data-id");
//        let i = event.target.id;
//        let state = {
//            current: clickedButton,
//            index: i,
//        }
//        this.setState(state);
//    }

//    /**
//     * Tämä eventti avaa käyttäjän valitseman kuvasetin, jos käyttäjällä on siihen käyttöoikeus.
//     * @param event
//     */
//    onClick2 = (event) => {

//        let clickedButton = event.target.getAttribute("data-id");
//        this.props.getClickedButtonId(clickedButton);
//    }

//    /**
//     * Tämä eventti kirjaa käyttäjän ulos palvelusta.
//     * */
//    logout = () => {
//        this.props.logout();
//        let state = {
//            current: "",
//            index: 0,
//            bodyText: ""
//        }
//        this.setState(state);
//    }

//    /**
//     * Tämä eventti poistaa kuvasetin.
//     * @param event
//     */
//    removeSet = (event) => {
//        let clickedButton = event.target.getAttribute("data-id");
//        this.props.removePictureSet(clickedButton);
//    }

//    /**
//     * Tällä käyttäjä voi myöntää ja evätä katselulupia kuvaseteilleen.
//     * @param event
//     */
//    manage = (event) => {
//        this.props.getApplications().then(() => {
//            this.props.getAlloweds().then(() => {
//                JwModal.javaScriptOpen("custom-modal-1");
//            });
//        });
//    }
//    /*
//    openModalWindow = (event) => {
//        JwModal.open("custom-modal-2");
//    }
//    */
//    render() {

//        let sets = [];
//        let names = [];

//        //Käyttäjä on kirjautunut sisään, mutta ei ole avannut yhdenkään 
//        //käyttäjän drop - down kuvasettilistaa.
//        if (this.props.imageSets.length > 0 && !this.state.current) {

//            //Otamme vain imagesetit, jotka eivät sisällä imagesettiä, vaan ainoastaan nimen.
//            names = this.props.imageSets.filter(o => o[1] === 0);
//            sets = names.map((name, index) =>
//                <rs.Button className="buttonstyle"
//                    onClick={this.onClick1}
//                    id={index}
//                    key={index}
//                    data-id={name[0]}>{(name[2])}</rs.Button>
//            );
//            return (
//                <div className="navbarstyle">
//                    <rs.Button className="buttonStyle" onClick={this.logout}>Logout</rs.Button>
//                    <br />
//                    <rs.Button className="buttonStyle" onClick={this.manage}>Permits</rs.Button>
//                    {sets}
//                </div>
//            );

//            //Käyttäjä on kirjautunut sisään ja avannut jonkun käyttäjän kuvasetit.
//        } else if (this.state.current) {

//            //Otamme vain imagesetit, jotka eivät sisällä imagesettiä, vaan ainoastaan nimen.
//            names = this.props.imageSets.filter(o => o[1] === 0);

//            //Täytetään listaan käyttäjänapit siihen asti, kunnes olemme sen käyttäjän kohdalla,
//            //jonka kuvasetit on valittu näytettäviksi.
//            for (let i = 0; i < parseInt(this.state.index) + 1; i++) {
//                sets.push(
//                    <rs.Button className="buttonstyle"
//                        onClick={this.onClick1}
//                        id={i}
//                        key={i}
//                        data-id={names[i][0]}>{(names[i][2])}</rs.Button>
//                );
//            }

//            //Lisätään nappula uuden kuvasetin lisäämiseksi, jos käyttäjä on omissa seteissään.
//            if (this.state.current === sessionStorage.getItem("user")) {
//                sets.push(
//                    <rs.Button className="buttonstyle"
//                        onClick={JwModal.jsxOpen("custom-modal-2")}><Plus size={32} /></rs.Button>
//                );
//            }

//            //Seuraavaksi lisätään listaan kuvasettien sub-napit, eli otamme valitun käyttäjän imagesetit:
//            let location = this.props.imageSets.findIndex(o => o[0] === this.state.current && o[1] === 0);
//            if (location > -1) {
//                location++;
//                let index = 1;
//                while (location < this.props.imageSets.length && this.props.imageSets[location][1] !== 0) {
//                    let style = "buttonstyle";
//                    if (this.props.imageSets[location][3] == 1) {
//                        style = "buttonstyle_green";
//                    }
//                    if (this.props.imageSets[location][3] == 0) {
//                        style = "buttonstyle_red";
//                    }
//                    if (this.state.current === sessionStorage.getItem("user")) {

//                        //Jos käyttäjä on omissa seteissään...
//                        sets.push(
//                            <div key={"sub-button-" + index}>
//                                <rs.Button className={style}
//                                    onClick={this.onClick2}
//                                    data-id={this.props.imageSets[location][1]}>
//                                    <XCircle size={16}
//                                        className="deleteIcon"
//                                        onClick={(e) => { e.stopPropagation(); this.removeSet(e) }}
//                                        data-id={this.props.imageSets[location][1]} />
//                                    {(this.props.imageSets[location][0])}
//                                </rs.Button>
//                            </div>
//                        );
//                    } else {

//                        //Jos käyttäjä tarkastelee toisen käyttäjän settejä...
//                        sets.push(
//                            <rs.Button className={style}
//                                key={"sub-button-" + index}
//                                onClick={this.onClick2}
//                                data-id={this.props.imageSets[location][1]}>
//                                {(this.props.imageSets[location][0])}
//                            </rs.Button>
//                        );
//                    }
//                    location++;
//                    index++;
//                }
//            }

//            //Sitten lisätään loput käyttäjänapit.
//            for (let i = parseInt(this.state.index) + 1; i < names.length; i++) {
//                sets.push(
//                    <rs.Button className="buttonstyle"
//                        onClick={this.onClick1}
//                        id={i}
//                        key={i}
//                        data-id={names[i][0]}>{(names[i][2])}</rs.Button>
//                );
//            }

//            //Loppujen lopuksi palautetaan jotain renderoitavaa.
//            return (
//                <div className="navbarstyle">
//                    <rs.Button className="buttonStyle" onClick={this.logout}>Logout</rs.Button>
//                    <br />
//                    <rs.Button className="buttonStyle" onClick={this.manage}>Permits</rs.Button>
//                    {sets}
//                </div>
//            );

//            //Käyttäjä ei ole kirjautunut sisään.
//        } else {
//            return (
//                <div className="navbarstyle">

//                </div>
//            )
//        }
//    }
//}


