import React, { useState, FC } from "react";
import { useNavigate } from "react-router-dom"; 
import Dropzone, { Accept } from 'react-dropzone';
import { Button, Table, TableBody, TableRow } from "@mui/material";
import { useForm } from "react-hook-form";
//import { withRouter } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { ImageType1 } from "../App";

interface Props {
    currentPictureSet: string,
    saveData: (data: ImageType1) => Promise<void>,
    savePicture: (data: ImageType1) => Promise<void>
}

const Newpic: FC<Props> = ({ currentPictureSet, saveData, savePicture }) => {
    const [files, setFiles] = useState<any>([]);
    const [legend, setLegend] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    const navigate = useNavigate();

    /**
     * Tämä on Dropzonen kutsuma funktio, joka tallentaa stateen käyttäjän valitseman tiedoston
     * jonkilaisen viittauksen, jolla ei kuitenkaan pääse itse tiedoston dataan käsiksi.
     * @param file
     */
    const dropping = (files: any) => {
        setFiles(files);
    };

    /**
     * Käyttäjä haluaa tallentaa tietokantaan kuvan.
     * */
    const onSubmit = (event: any) => {
        event.preventDefault();

        //Ensin varmistamme, että käyttäjällä on kuva valittuna.
        if (files.length > 0) {

            //Sitten tallennamme kuva(t) tietokantaan.
            files.forEach((temp: any) => {
                let picture: ImageType1 = {
                    pic: temp,
                    pictureSet: currentPictureSet,
                    legend: legend
                };
                saveData(picture).then(() => {

                    //Lopuksi nollaamme staten ja palaamme kuvasettinäkymään.
                    setFiles([]);
                    setLegend("");
                    setUrl("");
                    navigate("/");
                });
            })
        } else {

            //Jos käyttäjällä ei ole kuvaa valittuna, katsotaan, onko hän kirjoittanut
            //url-kenttään kuvan osoitteen.
            if (url) {

                let picture: ImageType1 = {
                    pic: url,
                    pictureSet: currentPictureSet,
                    legend: legend
                };
                savePicture(picture).then(() => {

                    //Lopuksi nollaamme staten ja palaamme kuvasettinäkymään.
                    setFiles([]);
                    setLegend("");
                    setUrl("");
                    navigate("/");
                });
            } else {

                //Jos mitään ei ole valmiina, ei tehdä mitään.
                return;
            }
        }
    };

    /**
     * Tämä päivittää käyttäjän kirjoittamat kirjaimet stateen.
     * @param event
     */
    const onChangeLegend = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLegend(event.target.value);
    };

    /**
     * Tämä päivittää käyttäjän kirjoittamat kirjaimet stateen.
     * @param event
     */
    const onChangeUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    /**
     * Käyttäjä muutti mieltään eikä haluakaan tallentaa tietokantaan mitään.
     * @param event
     */
    const onCancel = () => {
        setFiles([]);
        setLegend("");
        setUrl("");
        navigate("/");
    };

    const imageTypes: Accept = {
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/png': ['.png'],
        'image/gif': ['.gif']
    };

    return (
        
        <div className="main_page">

            <Dropzone
                onDrop={dropping}
                accept={imageTypes}
                multiple={false}>
                {({ getRootProps, getInputProps }) => (
                    <section className="form2">
                        <div {...getRootProps({ className: "dropzone" })}>
                            <input {...getInputProps()} />
                            <p>To upload a picture drag 'n' drop an image file here or click me...</p>
                            {files.map((file: any) => (
                                <p key={file.name}>
                                    {file.name} - {file.size} bytes
                                </p>
                            ))}
                        </div>
                    </section>
                )}
            </Dropzone>
           
            <form className="form2" onSubmit={onSubmit}>
                <fieldset>
                    <label>...or if you want to point some picture in internet, write its url-address below:</label>
                    <input type="text"
                        name="url"
                        onChange={onChangeUrl}
                        value={url} />
                </fieldset>
                
                <fieldset>
                    <label>Write below a story about your picture:</label>
                    <TextField variant="outlined"
                        className="form3"
                        multiline
                        rows={6}
                        name="legend"
                        onChange={onChangeLegend}
                        value={legend}/>
                </fieldset>
                
                <Table style={{ border: "none", boxShadow: "none" }}>
                    <tbody>
                        <tr>
                            <td>
                                <Button type="submit">Ok</Button>
                            </td>
                            <td>
                                <Button type="button" onClick={onCancel}>Cancel</Button>
                            </td>
                        </tr>
                    </tbody>         
                </Table>

            </form>

        </div>
    );
};
export { Newpic };




/**
 * Alla on JavaScript luokkaversio yläpuolen Typescript-versiosta.
 */



//class Newpic extends React.Component {

//    constructor(props) {
//        super(props);
//        this.state = {
//            file: [],
//            legend: "",
//            url: ""
//        };
//    };

//    /**
//     * Tämä on Dropzonen kutsuma funktio, joka tallentaa stateen käyttäjän valitseman tiedoston
//     * jonkilaisen viittauksen, jolla ei kuitenkaan pääse itse tiedoston dataan käsiksi.
//     * @param file
//     */
//    dropping = (file) => {
//        let state = {
//            file: file,
//            legend: this.state.legend,
//            url: this.state.url
//        };
//        this.setState(state);
//    };

//    /**
//     * Käyttäjä haluaa tallentaa tietokantaan kuvan.
//     * */
//    onSubmit = (event) => {
//        event.preventDefault();

//        //Ensin varmistamme, että käyttäjällä on kuva valittuna.
//        if (this.state.file.length > 0) {

//            //Sitten tallennamme kuvan tietokantaan.
//            let picture = {
//                file: this.state.file[0],
//                pictureSet: this.props.currentPictureSet,
//                legend: this.state.legend
//            };
//            this.props.saveData(picture);
//        } else {

//            //Jos käyttäjällä ei ole kuvaa valittuna, katsotaan, onko hän kirjoittanut
//            //url-kenttään kuvan osoitteen.
//            if (this.state.url) {

//                let picture = {
//                    url: this.state.url,
//                    pictureSet: this.props.currentPictureSet,
//                    legend: this.state.legend
//                };
//                this.props.savePicture(picture);
//            } else {

//                //Jos mitään ei ole valmiina, ei tehdä mitään.
//                return;
//            }

//        }

//        //Lopuksi nollaamme staten ja palaamme kuvasettinäkymään.
//        let state = {
//            file: [],
//            legend: "",
//            url: ""
//        };
//        this.setState(state);
//        this.props.history.push("/");
//    };

//    /**
//     * Tämä päivittää käyttäjän kirjoittamat kirjaimet stateen.
//     * @param event
//     */
//    onChangeLegend = (event) => {
//        let state = {
//            file: this.state.file,
//            legend: event.target.value,
//            url: this.state.url
//        };
//        this.setState(state);
//    };

//    /**
//     * Tämä päivittää käyttäjän kirjoittamat kirjaimet stateen.
//     * @param event
//     */
//    onChangeUrl = (event) => {
//        let state = {
//            file: this.state.file,
//            legend: this.state.legend,
//            url: event.target.value
//        };
//        this.setState(state);
//    };

//    /**
//     * Käyttäjä muutti mieltään eikä haluakaan tallentaa tietokantaan mitään.
//     * @param event
//     */
//    onCancel = (event) => {
//        let state = {
//            file: [],
//            legend: "",
//            url: ""
//        };
//        this.setState(state);
//        this.props.history.push("/");
//    };

//    render() {

//        const file = this.state.file.map(file => (
//            <p key={file.name}>
//                {file.name} - {file.size} bytes
//            </p>
//        ));

//        return (
//            <div className="main_page">
//                <Dropzone
//                    onDrop={this.dropping}
//                    accept="image/jpeg, image/jpg, image/png, image/gif"
//                    multiple={false}>
//                    {({ getRootProps, getInputProps }) => (
//                        <section className="form2">
//                            <div {...getRootProps({ className: "dropzone" })}>
//                                <input {...getInputProps()} />
//                                <p>To upload a picture drag 'n' drop an image file here or click me...</p>
//                                {file}
//                            </div>
//                        </section>
//                    )}
//                </Dropzone>
//                <Form className="form2" onSubmit={this.onSubmit}>
//                    <Form.Field>
//                        <label>...or if you want to point some picture in internet, write its url-address below:</label>
//                        <input type="text"
//                            name="url"
//                            onChange={this.onChangeUrl}
//                            value={this.state.url} />
//                    </Form.Field>
//                    <Form.Field>
//                        <label>Write below a story about your picture:</label>
//                        <TextField variant="outlined"
//                            className="form3"
//                            multiline
//                            rows="6"
//                            name="legend"
//                            onChange={this.onChangeLegend}
//                            value={this.state.legend} />
//                    </Form.Field>
//                    <Table style={{ border: "none", boxShadow: "none" }}>
//                        <Table.Row textAlign="center">
//                            <Button type="submit">Ok</Button>
//                            <Button onClick={this.onCancel}>Cancel</Button>
//                        </Table.Row>
//                    </Table>
//                </Form>
//            </div>
//        );
//    }
//}

//export default withRouter(Newpic);