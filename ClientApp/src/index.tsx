//import 'bootstrap/dist/css/bootstrap.css';
//import 'semantic-ui-css/semantic.min.css';

import React from 'react';
//import * as ReactDOM from 'react-dom';
import ReactDOM from 'react-dom/client';
//import { Provider } from 'react-redux';
//import { ConnectedRouter } from 'connected-react-router';
//import { createBrowserHistory } from 'history';
//import configureStore from './store/configureStore';
import { App } from './App';
import './main.css';
import registerServiceWorker from './registerServiceWorker';
import { ClickedNaviButtonProvider } from "./components/Dataholding";

// Create browser history to use in the Redux store
//const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') as string;
//const history = createBrowserHistory({ basename: baseUrl });

// Get the application-wide store instance, prepopulating with state from the server where available.
//const store = configureStore(history);

//const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <ClickedNaviButtonProvider>
        <App />
    </ClickedNaviButtonProvider>
);

 registerServiceWorker();
