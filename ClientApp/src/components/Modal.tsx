import React, { useState, useRef, ReactNode, createContext, useContext, FC, useEffect } from "react";
import { createPortal } from 'react-dom';
import "../main.css";

type Modal = {
    modal: HTMLDivElement;
    id: string;
    setIsModalOpen: (open: boolean) => void;
}

// Tämä on modaalipalvelu, joka pitää kirjaa kaikista avatuista ja suljetuista modeista.
const modals: Modal[] = [];

const useModalSharedState = () => {

    const addModal = (modal: Modal) => modals.push(modal);
    const removeModal = (modal: Modal) => modals.splice(modals.indexOf(modal), 1);

    /**
     *
     * Kutsu tätä metodia HTML -koodista käsin, esim. onClick eventissä.
     * @param id
     * @returns
     */
    const jsxOpen = (id: string) => (e: any) => {
        e.preventDefault();

        const modal = modals.find((modal: Modal) => modal && modal.id === id);
        if (modal) {
            modal.setIsModalOpen(true);
            document.body.classList.add("jw-modal-open");
        }
    }

    /**
     *
     * Kutsu tätä metodia HTML -koodista käsin, esim. onClick eventissä.
     * @param id
     * @returns
     */
    const jsxClose = (id: string) => (e: any) => {
        e.preventDefault();

        const modal = modals.find((modal: Modal) => modal && modal.id === id);
        if (modal) {
            modal.setIsModalOpen(false);
            document.body.classList.remove('jw-modal-open');
        }
    }

    /**
     * Kutsu tätä metodia JavaScript -koodista käsin.
     * @param id
     */
    const javaScriptOpen = (id: string) => {
        const modal = modals.find((modal: Modal) => modal && modal.id === id);
        if (modal) {
            modal.setIsModalOpen(true);
            document.body.classList.add("jw-modal-open");
        }
    }

    /**
     * Kutsu tätä metodia JavaScript -koodista käsin.
     * @param id
     */
    const javaScriptClose = (id: string) => {
        const modal = modals.find((modal: Modal) => modal && modal.id === id);
        if (modal) {
            modal.setIsModalOpen(false);
            document.body.classList.remove('jw-modal-open');
        }
    }

    return {
        addModal, removeModal,
        jsxOpen, jsxClose, javaScriptOpen, javaScriptClose
    };
};


interface Props {
    id: string;
    children: any;
}

const JwModal: FC<Props> = ({ id, children }) => {

    const elementRef = useRef<HTMLDivElement | null>(null);
    const { addModal, removeModal,
        jsxOpen, jsxClose, javaScriptOpen, javaScriptClose } = useModalSharedState();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    if (!elementRef.current) {
        const div = document.createElement('div');
        div.id = id;
        elementRef.current = div;
    }

    useEffect(() => {

        // Varmista ettei elementRef ei ole null ennen kuin se lisätään bodyyn.
        if (elementRef.current) {

            // Siirrä elementti sivun loppuun (juuri ennen </body>), jotta se voidaan näyttää kaiken muun yli.
            document.body.appendChild(elementRef.current);

            // Lisätään tämä modaali palvelimeen, jotta se on käytettävissä muista komponenteista.
            let temp: Modal = { modal: elementRef.current, id: id, setIsModalOpen: setIsModalOpen };
            addModal(temp);

            return () => {

                if (elementRef.current) {

                    // Poistetaan modaali DOMista
                    document.body.removeChild(elementRef.current);

                    // Poistetaan tämä modaali modaalipalvelimesta.
                    let temp: Modal = { modal: elementRef.current, id: id, setIsModalOpen: setIsModalOpen };
                    removeModal(temp);
                }
            };
        }
    }, []);

    const handleClick = (e: any) => {

        // Sulje modaali kun käyttäjä klikkaa taustaa.
        if (e.target.className === 'jw-modal' && elementRef.current) {
            javaScriptClose(elementRef.current.id);
        }
    }

    if (!isModalOpen) return null;

    return createPortal(
        <div onClick={handleClick}>
            <div className="jw-modal-background"></div>
            <div className="jw-modal">
                <div className="jw-modal-body" onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </div>            ,
        elementRef.current
    );
};

export { JwModal, useModalSharedState };



/**
 * Alla on JavaScript luokkaversio yläpuolen Typescript-versiosta.
 */




//const propTypes = {
//    id: PropTypes.string.isRequired
//};

//class JwModal extends React.Component {
//    static modals = [];

//    /**
//     * 
//     * Kutsu tätä metodia HTML -koodista käsin, esim. onClick eventissä.
//     * @param id
//     * @returns
//     */
//    static jsxOpen = (id) => (e) => {
//        e.preventDefault();

//        let modal = JwModal.modals.find(x => x.props.id === id);
//        modal.setState({ isOpen: true });
//        document.body.classList.add('jw-modal-open');
//    }

//    /**
//     * 
//     * Kutsu tätä metodia HTML -koodista käsin, esim. onClick eventissä.
//     * @param id
//     * @returns
//     */
//    static jsxClose = (id) => (e) => {
//        e.preventDefault();

//        let modal = JwModal.modals.find(x => x.props.id === id);
//        modal.setState({ isOpen: false });
//        document.body.classList.remove('jw-modal-open');
//    }

//    /**
//     * Kutsu tätä metodia JavaScript -koodista käsin.
//     * @param id
//     */
//    static javaScriptOpen = (id) => {
//        let modal = JwModal.modals.find(x => x.props.id === id);
//        modal.setState({ isOpen: true });
//        document.body.classList.add('jw-modal-open');
//    }

//    /**
//     * Kutsu tätä metodia JavaScript -koodista käsin.
//     * @param id
//     */
//    static javaScriptClose = (id) => {
//        let modal = JwModal.modals.find(x => x.props.id === id);
//        modal.setState({ isOpen: false });
//        document.body.classList.remove('jw-modal-open');
//    }

//    constructor(props) {
//        super(props);

//        this.state = { isOpen: false };

//        this.handleClick = this.handleClick.bind(this);
//    }

//    componentDidMount() {
//        // move element to bottom of page (just before </body>) so it can be displayed above everything else
//        document.body.appendChild(this.element);

//        // add this modal instance to the modal service so it's accessible from other components
//        JwModal.modals.push(this);
//    }

//    componentWillUnmount() {
//        // remove this modal instance from modal service
//        JwModal.modals = JwModal.modals.filter(x => x.props.id !== this.props.id);
//        this.element.remove();
//    }

//    handleClick(e) {
//        // close modal on background click
//        if (e.target.className === 'jw-modal') {
//            JwModal.close(this.props.id)(e);
//        }
//    }

//    render() {
//        return (
//            <div style={{ display: + this.state.isOpen ? '' : 'none' }} onClick={this.handleClick} ref={el => this.element = el}>
//                <div className="jw-modal">
//                    <div className="jw-modal-body">
//                        {this.props.children}
//                    </div>
//                </div>
//                <div className="jw-modal-background"></div>
//            </div>
//        );
//    }
//}

//JwModal.propTypes = propTypes;

//export { JwModal };