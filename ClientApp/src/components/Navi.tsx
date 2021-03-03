import * as React from "react";
import ".././main.css";
import * as rs from 'react-bootstrap';
import { Plus, XCircle } from 'react-bootstrap-icons';
import { JwModal } from './Modal';
import { Form, Button, Table } from "semantic-ui-react";

export default class Navi extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current: "",
            index: 0,
        };
    }

    /**
     * Tämä eventti avaa käyttäjän valitseman nimen sisältämät kuvasetit alasvetovalikkona.
     * @param event
     */
    onClick1 = (event) => {
        let clickedButton = event.target.getAttribute("data-id");
        let i = event.target.id;
        let state = {
            current: clickedButton,
            index: i,
        }
        this.setState(state);
    }

    /**
     * Tämä eventti avaa käyttäjän valitseman kuvasetin, jos käyttäjällä on siihen käyttöoikeus.
     * @param event
     */
    onClick2 = (event) => {
        
        let clickedButton = event.target.getAttribute("data-id");
        this.props.getClickedButtonId(clickedButton);
    }

    /**
     * Tämä eventti kirjaa käyttäjän ulos palvelusta.
     * */
    logout = () => {
        this.props.logout();
        let state = {
            current: "",
            index: 0,
            bodyText: ""
        }
        this.setState(state);
    }

    /**
     * Tämä eventti poistaa kuvasetin.
     * @param event
     */
    removeSet = (event) => {
        let clickedButton = event.target.getAttribute("data-id");
        this.props.removePictureSet(clickedButton);
    }

    /**
     * Tällä käyttäjä voi myöntää ja evätä katselulupia kuvaseteilleen.
     * @param event
     */
    manage = (event) => {
        window.alert("This is not implemented yet!");
    }
    
    render() {

        let sets = [];
        let names = [];

        //Käyttäjä on kirjautunut sisään, mutta ei ole avannut yhdenkään 
        //käyttäjän drop - down kuvasettilistaa.
        if (this.props.imageSets.length > 0 && !this.state.current) {

            //Otamme vain imagesetit, jotka eivät sisällä imagesettiä, vaan ainoastaan nimen.
            names = this.props.imageSets.filter(o => o[1] === 0);
            sets = names.map((name, index) =>
                <rs.Button className="buttonstyle"
                    onClick={this.onClick1}
                    id={index}
                    key={index}
                    data-id={name[0]}>{(name[2])}</rs.Button>
            );
            return (
                <div className="navbarstyle">
                    <rs.Button className="buttonStyle" onClick={this.logout}>Logout</rs.Button>
                    <br/>
                    <rs.Button className="buttonStyle" onClick={this.manage}>Permits</rs.Button>
                    {sets}
                </div>
            );

        //Käyttäjä on kirjautunut sisään ja avannut jonkun käyttäjän kuvasetit.
        } else if (this.state.current) {

            //Otamme vain imagesetit, jotka eivät sisällä imagesettiä, vaan ainoastaan nimen.
            names = this.props.imageSets.filter(o => o[1] === 0);

            //Täytetään listaan käyttäjänapit siihen asti, kunnes olemme sen käyttäjän kohdalla,
            //jonka kuvasetit on valittu näytettäviksi.
            for (let i = 0; i < parseInt(this.state.index)+1; i++) {
                sets.push(
                    <rs.Button className="buttonstyle"
                        onClick={this.onClick1}
                        id={i}
                        key={i}
                        data-id={names[i][0]}>{(names[i][2])}</rs.Button>
                );
            }

            //Lisätään nappula uuden kuvasetin lisäämiseksi, jos käyttäjä on omissa seteissään.
            if (this.state.current === sessionStorage.getItem("user")) {
                sets.push(
                    <rs.Button className="buttonstyle"
                        key="custom-modal-1-button-key"
                        onClick={JwModal.open("custom-modal-1")}><Plus size={32} /></rs.Button>
                );
            }

            //Seuraavaksi lisätään listaan kuvasettien sub-napit, eli otamme valitun käyttäjän imagesetit:
            let location = this.props.imageSets.findIndex(o => o[0] === this.state.current && o[1] === 0);
            if (location > -1) {
                location++;
                let index = 1;
                while (location < this.props.imageSets.length && this.props.imageSets[location][1] !== 0) {
                    let style = "buttonstyle";         
                    if (this.props.imageSets[location][3] == 1) {
                        style = "buttonstyle_green";
                    }
                    if (this.props.imageSets[location][3] == 0) {
                        style = "buttonstyle_red";
                    }   
                    if (this.state.current === sessionStorage.getItem("user")) {

                        //Jos käyttäjä on omissa seteissään...
                        sets.push(
                            <div key={"sub-button-" + index}>
                                <rs.Button className={style}
                                    onClick={this.onClick2}
                                    data-id={this.props.imageSets[location][1]}>
                                    <XCircle size={16}
                                        className="deleteIcon"
                                        onClick={(e) => { e.stopPropagation(); this.removeSet(e) }}
                                        data-id={this.props.imageSets[location][1]} />
                                    {(this.props.imageSets[location][0])}
                                </rs.Button>
                            </div>
                        );
                    } else {

                        //Jos käyttäjä tarkastelee toisen käyttäjän settejä...
                        sets.push(
                            <rs.Button className={style}
                                key={"sub-button-" + index}
                                onClick={this.onClick2}
                                data-id={this.props.imageSets[location][1]}>
                                {(this.props.imageSets[location][0])}
                            </rs.Button>
                        );
                    }
                    location++;
                    index++;
                }
            }

            //Sitten lisätään loput käyttäjänapit.
            for (let i = parseInt(this.state.index)+1; i < names.length; i++) {
                sets.push(
                    <rs.Button className="buttonstyle"
                        onClick={this.onClick1}
                        id={i}
                        key={i}
                        data-id={names[i][0]}>{(names[i][2])}</rs.Button>
                );
            }

            //Loppujen lopuksi palautetaan jotain renderoitavaa.
            return (
                <div className="navbarstyle">
                    <rs.Button className="buttonStyle" onClick={this.logout}>Logout</rs.Button>
                    <br/>
                    <rs.Button className="buttonStyle" onClick={this.manage}>Permits</rs.Button>
                    {sets}
                </div>
            );

        //Käyttäjä ei ole kirjautunut sisään.
        } else {
            return (
                <div className="navbarstyle">
                    
                </div>
            )
        }
    }
}

