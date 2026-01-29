/**
 * This is the index file, which initializes the app. Most of the stuff 
 * below is just style attributes for Ant Design components.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author Zenzicubic
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ConfigProvider theme={{
        token: {
            fontFamily: "var(--font-family)",
            colorText: "var(--light-col-1)",
            colorTextLightSolid: "var(--light-col-1)",
            colorIcon: "var(--light-col-1)"
        },
        components: {
            Tooltip: { 
                fontSize: "1em",
                colorBgSpotlight: "var(--dark-col-2)"
            },
            Drawer: {
                colorBgElevated: "var(--dark-col-2)",
                colorSplit: "var(--light-col-1)",
                fontSize: "1em",
                fontSizeLG: "2rem"
            },
            Collapse: {
                borderRadiusLG: "var(--border-radius);",
                colorBgContainer: "var(--dark-col-3)",
                colorFillAlter: "var(--dark-col-3)",
                colorBorder: "var(--light-col-1)",
                contentPadding: "0px 16px",
                fontSize: "1em"
            },
            Slider: {
                fontSize: "1em",
                railBg: "var(--light-col-2)",
                railHoverBg: "var(--light-col-1)",
                trackBg: "var(--elt-col-1)",
                trackHoverBg: "var(--elt-col-3)",
                handleColor: "var(--elt-col-1)",
                handleActiveColor: "var(--elt-col-3)",
                colorPrimaryBorderHover: "var(--elt-col-2)"
            },
            Switch: {
                handleBg: "var(--light-col-1)",
                colorPrimary: "var(--elt-col-1)",
                colorPrimaryHover: "var(--elt-col-3)",
                colorPrimaryBorder: "var(--elt-col-3)",
                colorTextTertiary: "var(--dark-col-4)",
                colorTextQuaternary: "var(--dark-col-3)"
            },
            Select: {
                colorTextPlaceholder: "var(--light-col-1)",
                colorTextQuaternary: "var(--light-col-1)",
                colorPrimary: "var(--elt-col-1)",
                colorPrimaryHover: "var(--elt-col-3)",
                colorBgElevated: "var(--dark-col-3)",
                optionSelectedBg: "var(--elt-col-1)",
                optionActiveBg: "var(--elt-col-3)",
                optionFontSize: "1rem",
                selectorBg: "var(--dark-col-3)"
            },
            Alert: {
                colorErrorBorder: "var(--error-col-1)",
                colorErrorBg: "var(--error-col-2)",
                fontSize: "1rem"
            }
        }
    }}>
        <App />
    </ConfigProvider>);