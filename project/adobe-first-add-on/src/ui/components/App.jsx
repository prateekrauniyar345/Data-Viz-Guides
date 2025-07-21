// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import '@spectrum-web-components/theme/spectrum-two/scale-large.js';
// import the light theme:
import "@spectrum-web-components/theme/express/theme-light.js";
// import the dark theme
import '@spectrum-web-components/theme/spectrum-two/theme-dark.js';


/**
 * Bootstrap styling for the add-on UI.
 */
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Includes Popper.js

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React from "react";
import "./App.css";

/**
 * components imports
 */
import Intro from "./Intro.jsx";
import FileUpload from "./FileUpload.jsx";

const App = ({ addOnUISdk, sandboxProxy }) => {
    function handleClick() {
        sandboxProxy.createRectangle();
    }

    function handleAddChartToDocument(blob, styles){
        if(sandboxProxy && sandboxProxy.addChartToDocument) {
            sandboxProxy.addChartToDocument(blob, styles)
                .then(result =>{
                    if(result.success) {
                        console.log('SVG chart added to document!');
                    } else {
                        console.error('Failed to add SVG to document:', result.error);
                    }
                })
                .catch(error => {
                    console.error('Error adding SVG to document:', error);
                });
        } else{
            console.error('Sandbox proxy or addChartToDocument function is not available.');
        }
    }

    return (
        // Please note that the below "<Theme>" component does not react to theme changes in Express.
        // You may use "addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        <Theme system="express" scale="large" color="light">
            <div
                className="d-flex flex-column align-items-center justify-content-start"
                style={{
                    width: '320px',
                    // height: '100vh',
                    backgroundColor: '#fff',
                    padding: '16px',
                    borderRight: '1px solid #e0e0e0',
                    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                    overflow: 'hidden', // Use overflow instead of overflowY
                }}
            >
                {/* intro component */}
                <Intro />
                {/* file upload component */}
                <FileUpload 
                    drawFunction={handleAddChartToDocument}
                />
                {/* button to create a rectangle */}
                <Button size="m" onClick={handleClick}>
                    Create Rectangle
                </Button>
            </div>
        </Theme>
    );
};

export default App;
