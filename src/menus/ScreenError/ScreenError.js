/**
 * This is the error component. It shows when the viewport is too small.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author tdung-do
 */

import './ScreenError.css';
import logo from '../../logo.svg';

import React from 'react';

function ScreenError(props) {
    return (
        <div id="error-div">
            <div id="error-bg"></div>
            <div id="error-center">
                <div id="logo-div">
                    <img id="logo" src={logo} alt="Logo" />
                </div>
                <h1>Error!</h1>
                <p>Unfortunately, your screen is too small. Curvascope does not support mobile devices. Please try again on a computer, or resize your window if possible.</p>
            </div>
        </div>
    );
}

export default ScreenError;