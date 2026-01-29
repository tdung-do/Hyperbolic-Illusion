/**
 * This is the help menu component. It contains the expanding 
 * help sections.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author tdung-do
 */

import React from 'react';
import { Drawer, Collapse } from 'antd';

import Blockquote from './blockquote/Blockquote.js';

/*
All of this is text for the help menu's sections.
*/

const items = [
    {
        key: "help1",
        label: "What is hyperbolic geometry?",
        children: <p>To be brief, the standard geometry most of us are used to is called Euclidean geometry, and is defined by a set of basic rules. When we break these rules, we obtain fascinating and often unimaginable geometries called non-Euclidean geometries.<br /><br />
        
        One example of this is hyperbolic, or Lobachevskian geometry. In hyperbolic geometry, parallel lines diverge or spread apart, rather than staying the same distance apart. In fact, infinitely many parallel lines through a given point to a given line exist. This makes the hyperbolic world &quot;bigger&quot; than the normal Euclidean world, allowing us to do a plethora of counterintutive things.<br /><br />
        
        Just like mapping the Earth, we cannot make a flat map of the hyperbolic world which preserves both angle and relative size, so we have to employ &quot;projections&quot; or &quot;models&quot; which preserve only some of the original geometric information. In Curvascope&apos;s case, two of the models supported (the <a href="https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model" target="_blank" rel="noreferrer">Poincar&eacute; disk</a> and <a href="https://en.wikipedia.org/wiki/Beltrami%E2%80%93Klein_model" target="_blank" rel="noreferrer">Beltrami-Klein</a> models) map the infinite hyperbolic world to a finite space (a disk), but don&apos;t be fooled &mdash; the hyperbolic world is infinite, no matter how we represent it.</p>
    },
    {
        key: "help2",
        label: "What can Hyperbolic Illusion do?",
        children: <p>Hyperbolic Illusion is a web app allowing the exploration of visual illusions in the hyperbolic plane. Hyperbolic Illusion allows you to cover various grid-based visual illusions models of the hyperbolic world/plane. You can use a number of parameters to generate unique mesmerizing images in this strange mathematical world.</p>,
    },
    {
        key: "help3",
        label: "How do I use this?",
        children: <p>The main window of Hyperbolic Illusion displays the tiling. To move it around in the hyperbolic plane, drag your mouse around inside the disk. To change the settings and tiling (i.e. model of the hyperbolic plane, coloring, and rendering settings), click on <strong>Settings</strong>. Note that larger antialiasing step counts or using larger iteration counts may have an impact on performance. To save an image of your tiling, click on <strong>Save Image</strong>. To copy a shareable link to your clipboard, click on <strong>Copy Shareable Link</strong>.</p>,
    },
    {
        key: "help4",
        label: "How does Hyperbolic Illusion work?",
        children: <p>Hyperbolic Illusion employs a technique called the &quot;kaleidoscopic technique&quot;. Like the real-world toy, this program employs reflections (more specifically their hyperbolic analogs called <a href="https://en.wikipedia.org/wiki/Inversive_geometry" target="_blank" rel="noreferrer">circle inversions</a>) to create the patterns from specific triangles, which you can see by enabling <strong>Show Triangles</strong> in the Settings menu. For more details on the algorithm used, see <a href="https://doi.org/10.1080/17513472.2021.1943998" target="_blank" rel="noreferrer">this paper by K. Nakamura.</a></p>,
    },
    {
        key: "help5",
        label: "Who made this?",
        children: <p>Hyperbolic Illusion was written by <a href="https://cs.uwaterloo.ca/~bdo/" target="_blank" rel="noreferrer">Tuan Dung Do</a>. Hyperbolic Illusion is built using React, employing Three.js and WebGL to render the tiling, and Ant Design for the UI. See <a href="https://github.com/tdung-do/hyperbolicIllusion" target="_blank" rel="noreferrer">the source code</a> on GitHub.</p>
    }
];

/*
This is the help menu component itself.
*/

function HelpMenu(props) {
    return (
        <>
            <Drawer title="Help" placement="left" width="35vw"
                onClose={props.onClose} open={props.isOpen} key="helpDrawer">
                {/* <Blockquote attr={<>William Shakespeare, <i>Hamlet</i></>}>
                    I could be bounded in a nutshell and count myself a king of infinite space.
                </Blockquote> */}
                <p>Welcome to Hyperbolic Illusion, a web-based exploring tool for visual illusions in the hyperbolic plane.</p>
                {/* <p>See <a href="https://github.com/tdung-do/hyperbolicIllusion" target="_blank" rel="noreferrer">the source code</a> on GitHub.</p> */}
                <Collapse items={items} />
                <p>This is an adaptation of <a href="https://curvascope.zenzicubic.dev/" target="_blank" rel="noreferrer">Curvascope</a> by <a href="https://zenzicubic.dev" target="_blank" rel="noreferrer">Zenzicubic</a>.</p>
            </Drawer>
        </>
    );
}

export default HelpMenu;