import * as React from "react";
import ".././main.css";
import * as rs from 'react-bootstrap';

export default class Overlay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            content: this.props.contentId
        }
    }

    onClick = (event) => {
        event.preventDefault();
        let name = event.target.parentElement.firstChild.value;//vaatii, että input kenttä on ensimmäinen tagi formin sisällä. Kökkö toteutus. Pitää miettiä parempi tapa
        //Tässä viedään uusi kuvasetti tietokantaan
        let set = {
            mPictureSet: name,
            cUser: { mName: "Simo" }
        }

        let request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(set)
        }
        fetch("/api/Pictures/AddPictureset", request).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    //console.log(data);
                    this.closeAll();
                }).catch(error => {
                    console.log("Error parsing JSON:", error);
                })
            } else {
                console.log("Server responded with status:", response.status);
            }
        }).catch(error => {
            console.log("Server responded with error:", error);
        });
        //this.closeAll();
    }

    closeAll = () => {
        //this.setState({ content: 0 });
        this.props.closeOverlay(0);
    }

    render() {
        if (this.state.content === 1) {
        return (
            <div className="overlay">
                <h2>Lisää kuvasetti</h2>
                <hr />
                <form>
                    <input type="text" placeholder="Anna kuvasetin nimi"/>
                    <rs.Button variant="success" type="submit" onClick={this.onClick} style={{float:"left"}}>Lisää</rs.Button>
                    <rs.Button variant="danger" onClick={this.closeAll} style={{ float: "right" }}>Sulje</rs.Button>
                </form>
            </div>    
            )
        }
        if (this.state.content === 2) {
            return (
                <div className="overlay">

                </div>
            )
        }
        if (this.state.content === 3) {
            return (
                <div className="overlay">

                </div>
            )
        }
    }
}