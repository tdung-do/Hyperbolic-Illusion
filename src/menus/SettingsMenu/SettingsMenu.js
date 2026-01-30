/**
 * This is the settings menu component. It manages the settings menu.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author tdung-do
 */

import React from 'react';
import { Drawer, Select, Alert } from 'antd';
import { useState, useContext, useCallback } from 'react';

import LabelledToggle from './sliders/LabelledToggle.js';
import LabelledSlider from './sliders/LabelledSlider.js';
import { generateTilingParams } from '../../math.js';
import { ParamContext } from '../../App.js';
import { ColorPicker } from './colorpicker/ColorPicker.js';
import { Button } from 'antd';



// Names of hyperbolic models and indices
const modelNames = [
    { label: "Poincar\u00E9 disk", value: 0 },
    { label: "Upper half-plane model", value: 1 },
    { label: "Beltrami-Klein disk", value: 2 },
    { label: "Poincar\u00E9 disk complement", value: 3 },
    { label: "Gans model", value: 4 },
    { label: "Azimuthal equidistant projection", value: 5 },
    { label: "Equal-area projection", value: 6 },
    { label: "Band model", value: 7 }
];

/*
This is the Tiling section of the Settings menu.
*/

const maxSides = 20;

function TilingSelector() {
    const params = useContext(ParamContext);   

    // Whether or not to show the error message
    const [hasError, setError] = useState(false);

    // Temporary storage for slider values
    const [pVal, setPVal] = useState(params[0].pValue); 
    const [qVal, setQVal] = useState(params[0].qValue); 
    const [eThickVal, setEThickVal] = useState(params[0].eThickness); 

    const setValues = useCallback((p, q, edgeThickness) => {
        // Check for valid tiling
        if ((p - 2) * (q - 2) <= 4) {
            setError(true);
            return;
        }

        // If valid, compute parameters and store Schlafli symbol
        setError(false);
        params[1]({
            ...params[0],
            ...generateTilingParams(p, q, edgeThickness),
            pValue: p,
            qValue: q,
            eThickness: edgeThickness});
    }, [params]);

    return (<>
        <h2>Tiling</h2>
        <LabelledSlider 
            lbl="Number of Sides" 
            min={3} max={maxSides} value={params[0].pValue}
            onChange={(val) => { 
                setPVal(val);
                setValues(val, qVal, eThickVal);
            }} />
        <LabelledSlider 
            lbl="Number of Polygons Around a Vertex" 
            min={3} max={maxSides} value={params[0].qValue}
            onChange={(val) => { 
                setQVal(val);
                setValues(pVal, val, eThickVal);
            }} />
        { hasError && (
            <Alert 
                message="This is not a valid hyperbolic tiling. Try changing the parameters." 
                type="error" />
        ) }
        <hr/>
        <h2>Illusion preset</h2>
        <LabelledToggle
            lbl="Kitaoka's Rotating Snakes illusion" toggled={params[0].doSnake}
            onChange={(toggled) =>
                params[1]({
                    ...params[0],
                    ...setPVal(5),
                    ...setQVal(5),
                    ...generateTilingParams(5, 5, eThickVal),
                    pValue: 5,
                    qValue: 5,

                    modelIdx: 0,

                    doVerts: toggled ? false : params[0].doVerts,
                    doOrns: toggled ? false : params[0].doOrns,

                    doEdges: toggled ? false : true,

                    doInvPol: toggled ? false : params[0].doInvPol,
                    doParity: false,
                    
                    doSolidColor: true,
                    doSnake: toggled
                })
            }
        />
        {params[0].doSnake && (
            <>
                <h3>Kitaoka's Rotating Snakes Parameters</h3>

                <LabelledSlider
                    lbl="Exponential Ratio (Rings)"
                    min={0.005} max={2.0} step={0.005} value={params[0].expRatioRings}
                    onChange={(val) =>
                        params[1]({ ...params[0], expRatioRings: val })
                    }
                />

                <LabelledSlider
                    lbl="Number of Ring Layers"
                    min={1.0} max={50.0} step={1.0} value={params[0].ringLayerNum}
                    onChange={(val) =>
                        params[1]({ ...params[0], ringLayerNum: val })
                    }
                />

                <LabelledSlider
                    lbl="Center Cutoff"
                    min={0.0} max={1.0} step={0.01} value={params[0].centerCutoff}
                    onChange={(val) =>
                        params[1]({ ...params[0], centerCutoff: val })
                    }
                />

                <LabelledSlider
                    lbl="Front rings' number of patterns per PI/p arc"
                    min={1.0} max={10.0} step={1.0} value={params[0].nRepeatPerSectV0}
                    onChange={(val) =>
                        params[1]({ ...params[0], nRepeatPerSectV0: val })
                    }
                />

                <LabelledSlider
                    lbl="Behind rings' number of patterns per PI/q arc"
                    min={1.0} max={10.0} step={1.0} value={params[0].nRepeatPerSectV2}
                    onChange={(val) =>
                        params[1]({ ...params[0], nRepeatPerSectV2: val })
                    }
                />
            </>
        )}  

        <div style={{ marginBottom: "var(--small-spacing)" }}>
        <Button
            type={"primary"} size="large"
            onClick={() => 
                params[1]({
                    ...params[0],
                    ...setPVal(4),
                    ...setQVal(6),
                    ...setEThickVal(0.02),
                    ...generateTilingParams(4, 6, 0.02),
                    pValue: 4,
                    qValue: 6,
                    eThickness: 0.02,

                    modelIdx: 0,

                    doVerts: false,
                    doInvVerts: true,
                    doOrns: true,

                    doEdges: false,

                    doInvPol: true,
                    doParity: false,
                    
                    doSolidColor: true,
                    doSnake: false,

                    polygonColIdx: 7,
                    invPolygonColIdx: 8,
                    vertColIdx: 0,
                    invVertColIdx: 9,
                })
            }
        >
            Kitaoka's Primrose Field illusion
        </Button>
        </div>

        <div style={{ marginBottom: "var(--small-spacing)" }}>
        <Button
            type={"primary"} size="large"
            onClick={() => 
                params[1]({
                    ...params[0],
                    ...setPVal(3),
                    ...setQVal(7),
                    ...setEThickVal(0.015),
                    ...generateTilingParams(3, 7, 0.015),
                    pValue: 3,
                    qValue: 7,
                    eThickness: 0.015,

                    modelIdx: 0,

                    doVerts: true,
                    doInvVerts: false,
                    doOrns: false,

                    doEdges: true,
                    doV0V1: true,
                    doV1V2: false,
                    doV2V0: true,

                    doInvPol: false,
                    doParity: false,
                    
                    doSolidColor: true,
                    doSnake: false,

                    edgeColIdx: 6,
                    polygonColIdx: 2,
                    vertColIdx: 0
                })
            }
        >
            Scintillating Grid illusion
        </Button>
        </div>

        <div style={{ marginBottom: "var(--small-spacing)" }}>
        <Button
            type={"primary"} size="large"
            onClick={() => 
                params[1]({
                    ...params[0],
                    ...setPVal(4),
                    ...setQVal(5),
                    ...setEThickVal(0.020),
                    ...generateTilingParams(4, 5, 0.020),
                    pValue: 4,
                    qValue: 5,
                    eThickness: 0.020,

                    modelIdx: 0,

                    doVerts: false,
                    doInvVerts: false,
                    doOrns: false,

                    doEdges: true,
                    doV0V1: true,
                    doV1V2: true,
                    doV2V0: false,

                    doInvPol: false,
                    doParity: false,
                    
                    doSolidColor: true,
                    doSnake: false,

                    edgeColIdx: 0,
                    polygonColIdx: 2
                })
            }
        >
            Hermann Grid illusion
        </Button>
        </div>
        

        <hr />
        <h2>Edge</h2>
        <LabelledToggle
            lbl="Show Edges" toggled={params[0].doEdges} 
            onChange={(toggled) => params[1]({...params[0], doEdges: toggled})} 
        />
        {params[0].doEdges && (
            <LabelledSlider 
            lbl="Edge Thickness" 
            min={0.005} max={0.145} step={0.005} value={params[0].eThickness}
            onChange={(val) => { 
                setEThickVal(val);
                setValues(pVal, qVal, val);
            }} />
        )}
        {params[0].doEdges && (
            <>
                <LabelledToggle
                    lbl="Show Edge a" toggled={params[0].doV1V2} 
                    onChange={(toggled) => params[1]({...params[0], doV1V2: toggled})} />
                <LabelledToggle
                    lbl="Show Edge b" toggled={params[0].doV0V1} 
                    onChange={(toggled) => params[1]({...params[0], doV0V1: toggled})} />
                <LabelledToggle
                    lbl="Show Edge c" toggled={params[0].doV2V0} 
                    onChange={(toggled) => params[1]({...params[0], doV2V0: toggled})} />   
                <p>Edge Color</p>
                <ColorPicker 
                    selIdx={params[0].edgeColIdx} 
                    onChange={(idx) => params[1]({...params[0], edgeColIdx: idx})}/>    
            </>
        )}
        <hr />
        <h2>Vertex</h2>
        <LabelledToggle
            lbl="Show Circular Vertices" toggled={params[0].doVerts} 
            onChange={(toggled) => params[1](
                {...params[0], 
                doVerts: toggled,
                doOrns: toggled ? false : params[0].doOrns,
                doInvVerts: toggled ? params[0].doInvVerts : false})} 
        /> 

        {params[0].doVerts && (
            <>
                <p>Vertex Color</p>
                <ColorPicker 
                    selIdx={params[0].vertColIdx} 
                    onChange={(idx) => params[1]({...params[0], vertColIdx: idx})}/>
            </>
        )}   

        {params[0].doVerts && (
            <LabelledSlider 
            lbl="Vertex Size" 
            min={0.005} max={0.145} step={0.005} value={params[0].eThickness}
            onChange={(val) => { 
                setEThickVal(val);
                setValues(pVal, qVal, val);
            }} />
        )} 

        <LabelledToggle
            lbl="Show Ornamented Vertices" toggled={params[0].doOrns} 
            onChange={(toggled) => params[1](
                {...params[0], 
                doOrns: toggled,
                doVerts: toggled ? false : params[0].doVerts,
                doInvVerts: toggled ? params[0].doInvVerts : false}
            )} 
        />
        {params[0].doOrns && (
            <>
                <p>Vertex Color</p>
                <ColorPicker 
                    selIdx={params[0].vertColIdx} 
                    onChange={(idx) => params[1]({...params[0], vertColIdx: idx})}/>
            </>
        )}   

        {params[0].doOrns && (
            <LabelledSlider 
            lbl="Vertex Size" 
            min={0.005} max={0.145} step={0.005} value={params[0].eThickness}
            onChange={(val) => { 
                setEThickVal(val);
                setValues(pVal, qVal, val);
            }} />
        )} 

        {(params[0].doVerts || params[0].doOrns) && (
            <LabelledToggle
                lbl="Show Primrose Field Style Colored Vertices" toggled={params[0].doInvVerts} 
                onChange={(toggled) => params[1](
                    {...params[0], 
                    doInvVerts: toggled}
                )} 
            />
        )}
        {params[0].doInvVerts && (
            <>
                <p>Second Vertex Color</p>
                <ColorPicker 
                    selIdx={params[0].invVertColIdx} 
                    onChange={(idx) => params[1]({...params[0], invVertColIdx: idx})}/>
                <hr />
            </>
        )}
        
        <hr />   
    </>);
}

/*
This is the Appearance section of the Settings menu.
*/

function AppearanceMenu() {
    const params = useContext(ParamContext);    
    return (
        <>
            <h2>Additional Appearance</h2>
            <h3>Model</h3>
            <Select 
                defaultValue={params[0].modelIdx} style={{ 
                    width: "100%", 
                    marginBottom: "var(--small-spacing)" }}
                options={modelNames} onChange={(val) => params[1]({...params[0], modelIdx: val})} />

            <h3>Polygon</h3>
            <LabelledToggle
                lbl="Use Static Polygon Color" toggled={params[0].doSolidColor} 
                onChange={(toggled) => params[1](
                    {...params[0], 
                    doSolidColor: toggled,
                    doInvPol: toggled ? params[0].doInvPol : false})} 
            />
            {params[0].doSolidColor && (
                <>
                    <p>Polygon Color</p>

                    <ColorPicker 
                        selIdx={params[0].polygonColIdx} 
                        onChange={(idx) => params[1]({...params[0], polygonColIdx: idx})}/>
                    <hr />               
                </>
            )}

            <LabelledToggle
                lbl="Checkerboard-colored Polygon" toggled={params[0].doInvPol} 
                onChange={(toggled) => params[1](
                    {...params[0], 
                    doInvPol: toggled,
                    doSolidColor: toggled ? true : params[0].doSolidColor})} 
            />
            {params[0].doInvPol && (
                <>
                    <p>Second Polygon Color</p>
                    <ColorPicker 
                        selIdx={params[0].invPolygonColIdx} 
                        onChange={(idx) => params[1]({...params[0], invPolygonColIdx: idx})}/>
                    <hr />             
                </>
            )}

            <LabelledToggle
                lbl="Show Embedded Triangles" toggled={params[0].doParity} 
                onChange={(toggled) => params[1]({...params[0], doParity: toggled})} />
            

            <p>Background Color</p>
            <ColorPicker 
                selIdx={params[0].bgColIdx} 
                onChange={(idx) => params[1]({...params[0], bgColIdx: idx})}/>
            <hr /> 
        </>);
}

/*
This is the Rendering section of the settings menu.
*/

function RenderingMenu() {
    const params = useContext(ParamContext);   
    return (<>
        <h2>Rendering</h2>
        <LabelledSlider 
            lbl="Number of Iterations" min={20} max={100} value={params[0].nIterations}
            onChange={(val) => params[1]({...params[0], nIterations: val})} />
        <LabelledSlider
            lbl="Number of Antialiasing Steps" min={1} max={50} value={params[0].nSamples}
            onChange={(val) => params[1]({...params[0], nSamples: val})} />
    </>);
}

/*
This is the settings menu itself.
*/

function SettingsMenu(props) {
    return (
        <>
            <Drawer title="Settings" placement="left" width="35vw"
                onClose={props.onClose} open={props.isOpen} key="helpDrawer">
                    <TilingSelector />
                    <AppearanceMenu />
                    <RenderingMenu />
            </Drawer>
        </>);
}

export default SettingsMenu;