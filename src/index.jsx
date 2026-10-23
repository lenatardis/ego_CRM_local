import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import App from './App';
import {BrowserRouter} from "react-router-dom"

import {store} from './store/store';
import {startMockBackend} from './mocks/browser';

if (process.env.NODE_ENV === "production") {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
}

// Demo mode: the mock backend must be running before the app's first request (user check in App.jsx)
startMockBackend()
    .catch((error) => console.error('Mock backend failed to start:', error))
    .then(() => {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Provider store={store}>
                    <App/>
                </Provider>
            </BrowserRouter>
        );
    });
