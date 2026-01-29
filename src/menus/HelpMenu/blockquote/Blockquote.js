/**
 * This is a generic blockquote component.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author tdung-do
 */

import './Blockquote.css';

import React from 'react';

function Blockquote(props) {
    return (
        <>
            <blockquote>
                <p className="blockquote-text">{props.children}</p>
                <p className="blockquote-attr">&mdash; {props.attr}</p>
            </blockquote>
        </>
    );
}

export default Blockquote;