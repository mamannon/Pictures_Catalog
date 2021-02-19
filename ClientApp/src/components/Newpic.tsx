import * as React from "react";
import Dropzone  from 'react-dropzone';
import { Form, Button, Table } from "semantic-ui-react";
import { withRouter } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';

class Newpic extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            file: [],
            legend: "",
            url: ""
        };
    }

    /**
     * Tämä on Dropzonen kutsuma funktio, joka tallentaa stateen käyttäjän valitseman tiedoston
     * jonkilaisen viittauksen, jolla ei kuitenkaan pääse itse tiedoston dataan käsiksi.
     * @param file
     */
    dropping = (file) => {
        let state = {
            file: file,
            legend: this.state.legend,
            url: this.state.url
        };
        this.setState(state);
    };

    /**
     * Käyttäjä haluaa tallentaa tietokantaan kuvan. 
     * */
    savePicture = () => {

        //Ensin varmistamme, että käyttäjällä on kuva valittuna.
        if (this.state.file.length !== 0) {

            //Sitten tallennamme kuvan tietokantaan.
            let picture = {
                file: this.state.file[0],
                pictureSet: this.props.currentPictureSet,
                legend: this.state.legend
            };
            this.props.saveData(picture);
        } else {

            //Jos käyttäjällä ei ole kuvaa valittuna, katsotaan, onko hän kirjoittanut
            //url-kenttään kuvan osoitteen.
            if (this.state.url) {

                let picture = {
                    url: this.state.url,
                    pictureSet: this.props.currentPictureSet,
                    legend: this.state.legend
                };
                this.props.savePicture(picture);
            } else {

                //Jos mitään ei ole valmiina, ei tehdä mitään.
                return;
            }

        }

        //Lopuksi nollaamme staten ja palaamme kuvasettinäkymään.
        let state = {
            file: [],
            legend: "",
            url: ""
        };
        this.setState(state);
        this.props.history.push("/");
    };

    /**
     * Tämä päivittää käyttäjän kirjoittamat kirjaimet stateen.
     * @param event
     */
    onChangeLegend = (event) => {
        let state = {
            file: this.state.file,
            legend: event.target.legend,
            url: this.state.url
        };
        this.setState(state);
    }

    /**
     * Tämä päivittää käyttäjän kirjoittamat kirjaimet stateen.
     * @param event
     */
    onChangeUrl = (event) => {
        let state = {
            file: this.state.file,
            legend: this.state.legend,
            url: event.target.url
        };
        this.setState(state);
    }

    /**
     * Käyttäjä muutti mieltään eikä haluakaan tallentaa tietokantaan mitään.
     * @param event
     */
    onCancel = (event) => {
        let state = {
            file: [],
            legend: "",
            url: ""
        };
        this.setState(state);
        this.props.history.push("/");
    }
    /*

    */
    render() {
        
        const file = this.state.file.map(file => (
            <p key={file.name}>
                {file.name} - {file.size} bytes
            </p>
        ));

        //Jotta rivinvaihdot näkyisivät näytöllä, tarvitaan tämä:
        //const legend = this.state.legend.replace('\\n', '\n');
        //const legend = this.state.legend.replace('a', 'b');
        
        return (
            <div className="newpic">
                <Dropzone
                    onDrop={this.dropping}
                    accept="image/jpeg, image/jpg, image/png, image/gif"
                    multiple={false}>
                    {({ getRootProps, getInputProps }) => (
                        <section className="container">
                            <div {...getRootProps({ className: "dropzone" })}>
                                <input {...getInputProps()} />
                                <p>To upload a picture drag 'n' drop an image file here or click me...</p>
                                {file}
                            </div>
                        </section>
                    )}
                </Dropzone>
                <br/>
                <Form onSubmit={this.savePicture}>
                    <Form.Field>
                        <label>...or if you want to point some picture in internet, write its url-address below:</label>
                        <input type="text"
                            name="url"
                            onChange={this.onChangeUrl}
                            value={this.state.url} />
                    </Form.Field>
                    <Form.Field>
                        <label>Write below a story about your picture:</label>
                        <TextField variant="outlined"
                            multiline
                            name="legend"
                            onChange={this.onChangeLegend}
                            value={this.state.legend} />
                    </Form.Field>
                    <Table style={{border: "none", boxShadow: "none"}}>
                        <Table.Row textAlign="center">
                            <Button type="submit">Ok</Button>
                            <Button onClick={this.onCancel}>Cancel</Button>
                        </Table.Row>
                    </Table>
                </Form>
            </div>
        )  
    }
}

export default withRouter(Newpic);