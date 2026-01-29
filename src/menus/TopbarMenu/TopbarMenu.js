/**
 * This is the topbar component. It contains buttons to open all submenus.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author tdung-do
 */

import './TopbarMenu.css';
import logo from '../../logo.svg';

import { Tooltip } from 'antd';
import React from 'react';

function TopbarMenu(props) {
    return (
        <div id="topbar-menu">
            {/* <div id="logo-container">
                <img src={logo} alt="Logo" id="topbar-logo"/>
            </div> */}
            <button className="topbar-button" onClick={props.onHelp}>Help</button>
            <button className="topbar-button" onClick={props.onSettings}>Settings</button>
            <button className="topbar-button" onClick={props.onSaveImg}>Save Image</button>
            <Tooltip title="Copied to clipboard" trigger="click">
                <button className="topbar-button" onClick={props.onShare}>Get Shareable Link</button>
            </Tooltip>
        </div>
    );
}

export default TopbarMenu;