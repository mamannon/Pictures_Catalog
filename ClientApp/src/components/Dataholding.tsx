import React, { createContext, useState, useContext,  ReactNode } from 'react';

type ClickedNaviButtonContextType = {
    clickedNaviButton: boolean;
    setClickedNaviButton: (value: boolean) => void;
};

export const ClickedNaviButtonContext = createContext<ClickedNaviButtonContextType | undefined>(undefined);


export function ClickedNaviButtonProvider({ children }: { children: ReactNode }) {
    const [clickedNaviButton, setClickedNaviButton] = useState<boolean>(true);

    return (
        <ClickedNaviButtonContext.Provider value={{ clickedNaviButton, setClickedNaviButton }}>
            {children}
        </ClickedNaviButtonContext.Provider>
    );
};

export const useClickedNaviButton = () => {
    const context = useContext(ClickedNaviButtonContext);
    if (!context) {
        throw new Error("useClickedNaviButton must be used within ClickedNaviButtonProvider");
    }
    return context;
};


/**
 * Alla on JavaScript luokkaversio yläpuolen Typescript-versiosta.
 */


//class Dataholding {

//    clickedNaviButton: boolean;

//    constructor() {
////        this.clickedNaviButton = false;
//        this.clickedNaviButton = true;
//    }

//    setClickedNaviButton(data) {
//        this.clickedNaviButton = data;
//    }

//    getClickedNaviButton() {
//        return this.clickedNaviButton;
//    }

//}
//export default new Dataholding();