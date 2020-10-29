import * as React from "react";
import ".././main.css";
import * as rs from 'react-bootstrap';
import {Plus} from 'react-bootstrap-icons';

export default class Navi extends React.Component {

    constructor(props) {
        super(props);
        
    }
   
    onClick = (event) => {
        
        let clickedButton = event.target.getAttribute("data-id");//klikattu main nappi
        this.props.getClickedButtonId(clickedButton);
    }

    openOverlay = () => {
        this.props.overlay(1);
    }

    
    render() {
        
        if (this.props.imageSets.length > 0) {
            let sets = this.props.imageSets.map((name, index) => <rs.Button className="buttonstyle" onClick={this.onClick} key={index} data-id={ name[1]}>{name[0]}</rs.Button>);
            return (
                <div className="navbarstyle">
                    {sets}
                    <rs.Button className="buttonstyle" onClick={this.openOverlay}><Plus size={ 32} /></rs.Button>
                </div>
            );
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