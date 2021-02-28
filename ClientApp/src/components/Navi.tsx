import * as React from "react";
import ".././main.css";
import * as rs from 'react-bootstrap';
import { Plus, XCircle } from 'react-bootstrap-icons';

export default class Navi extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current: "",
            index: 0
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
            index: i
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
            index: 0
        }
        this.setState(state);
    }

    /**
     * Tämä eventti antaa käyttäjälle mahdollisuuden kuvasetin.
     * @param event
     */
    addSet = (event) => {
        let koe = 1;
    }

    /**
     * Tämä eventti poistaa kuvasetin.
     * @param event
     */
    removeSet = (event) => {
        let koe = 1;
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
                    data-id={name[0]}>{(name[2])}</rs.Button>
            );
            return (
                <div className="navbarstyle">
                    <rs.Button className="buttonStyle" onClick={this.logout}>Logout</rs.Button>
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
                        data-id={names[i][0]}>{(names[i][2])}</rs.Button>
                );
            }

            //Lisätään nappula uuden kuvasetin lisäämiseksi, jos käyttäjä on omissa seteissään.
            if (this.state.current === sessionStorage.getItem("user")) {
                sets.push(
                    <rs.Button className="buttonstyle" onClick={this.addSet}><Plus size={32} /></rs.Button>
                );
            }

            //Sitten lisätään listaan kuvasettien sub-napit, eli otamme valitun käyttäjän imagesetit:
            let index = this.props.imageSets.findIndex(o => o[0] === this.state.current && o[1] === 0);
            if (index > -1) {
                index++;
                while (index < this.props.imageSets.length && this.props.imageSets[index][1] !== 0) {
                    let style = "buttonstyle";         
                    if (this.props.imageSets[index][3] == 1) {
                        style = "buttonstyle_green";
                    }
                    if (this.props.imageSets[index][3] == 0) {
                        style = "buttonstyle_red";
                    }   
                    if (this.state.current === sessionStorage.getItem("user")) {

                        //Jos käyttäjä on omissa seteissään...
                        sets.push(
                            <div>
                                <rs.Button className={style}
                                    onClick={this.onClick2}
                                    data-id={this.props.imageSets[index][1]}>
                                    <XCircle size={16}
                                        className="deleteIcon"
                                        onClick={(e) => { e.stopPropagation(); this.removeSet(e) }}
                                        data-id={this.props.imageSets[index][1]} />
                                    {(this.props.imageSets[index][0])}
                                </rs.Button>
                            </div>
                        );
                    } else {

                        //Jos käyttäjä tarkastelee toisen käyttäjän settejä...
                        sets.push(
                            <rs.Button className={style}
                                onClick={this.onClick2}
                                data-id={this.props.imageSets[index][1]}>
                                {(this.props.imageSets[index][0])}
                            </rs.Button>
                        );
                    }
                    index++;
                }
            }

            //Lopuksi lisätään loput käyttäjänapit.
            for (let i = parseInt(this.state.index)+1; i < names.length; i++) {
                sets.push(
                    <rs.Button className="buttonstyle"
                        onClick={this.onClick1}
                        id={i}
                        data-id={names[i][0]}>{(names[i][2])}</rs.Button>
                );
            }

            //Loppujen lopuksi palautetaan jotain renderoitavaa.
            return (
                <div className="navbarstyle">
                    <rs.Button className="buttonStyle" onClick={this.logout}>Logout</rs.Button>
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

/**
 * 
 * Tulevaisuutta varten talteen
 * 
 */ 
/*Alanappien html rakenne korvan taakse
 * <div className="NaviSubButtons" id="b1">
        <rs.Button className="buttonstyle buttonstyle_small">Kuvasetti 1</rs.Button>
        <rs.Button className="buttonstyle buttonstyle_small">Kuvasetti 2</rs.Button>
        <rs.Button className="buttonstyle buttonstyle_small">Kuvasetti 3</rs.Button>
    </div>
 */
/*EI TARVITA ENNENKUIN ALETAAN KÄYTTÄMÄÄN ALANAPPEJA####
   componentDidMount() {//astetaan kaikille alanapeille display:none;
      
       let allSubButtons = document.getElementsByClassName("NaviSubButtons");
       for (let i = 0; i < allSubButtons.length; i++) allSubButtons[i].style.display = "none";
   }
   */

/*EI TARVITA ENNENKUIN ALETAAN KÄYTTÄMÄÄN ALANAPPEJA######onClickin sisällä aiemmin
        let small_buttons = document.getElementById(clickedButton);//main napin alanapit

        //suljetaan kaikki muut alanapit kun painetaan uutta main nappia
        let allSubButtons = document.getElementsByClassName("NaviSubButtons");
        for (let i = 0; i < allSubButtons.length; i++) {
            if (allSubButtons[i] === small_buttons) {
                if (small_buttons.style.display === "none") small_buttons.style.display = "block";
                else small_buttons.style.display = "none";
                continue;
            }
            allSubButtons[i].style.display = "none";
        }
        */