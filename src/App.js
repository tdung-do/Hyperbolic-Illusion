/**
 * This is the main app component. It manages the canvas and all interaction
 * and animation directly, and calls components for everything else.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author tdung-do
 */

import './App.css';

import { useRef, useState, useEffect, useCallback, createContext } from 'react';
import { WebGLRenderer, Scene, OrthographicCamera, Vector2, Vector3, 
         ShaderMaterial, PlaneGeometry, GLSL3, Mesh } from 'three';

import ScreenError from './menus/ScreenError/ScreenError.js';
import TopbarMenu from './menus/TopbarMenu/TopbarMenu.js';
import HelpMenu from './menus/HelpMenu/HelpMenu.js';
import SettingsMenu from './menus/SettingsMenu/SettingsMenu.js';
import { colors } from './menus/SettingsMenu/colorpicker/ColorPicker.js';
import { Complex, generateTilingParams, modelMaps } from './math.js'; 

// Assorted constants
const timeFactor = 2e-4;
const minWidth = 768;
const ZERO = new Complex(0, 0);

// Lists of parameters to share and copy
const sharedParams = ["modelIdx", "doEdges", "doVerts", "doParity",  "doSolidColor", "pValue", "qValue", 
                        "eThickness", "doInvPol", "doInvVerts", "doOrns", 
                        "doSnake", "expRatioRings", "ringLayerNum", "centerCutoff", "nRepeatPerSectV0", "nRepeatPerSectV2", "doForeRev", "doBackRev",
                        "doV0V1", "doV1V2", "doV2V0",
                        "polygonColIdx", "invPolygonColIdx", "edgeColIdx", "vertColIdx", "invVertColIdx", "bgColIdx",
                        "preciseEdges", "V0", "V1", "V2", "D", "E", "D1", "E1", "D1p", "E1p", "D2", "E2",
                        "triV0EnlargedCircleCenter", "triV0EnlargedCircleRadius",
                        "triV1EnlargedCircleCenter", "triV1EnlargedCircleRadius",
                        "triV2EnlargedCircleCenter", "triV2EnlargedCircleRadius",
                        "V0EnlargedCircleCenter", "V0EnlargedCircleRadius",
                        "V2EnlargedCircleCenter", "V2EnlargedCircleRadius",
                        "C2RotSnakesCenter", "C2RotSnakesRadius",
                        "newThickEdge12CircleCenter", "newThickEdge12CircleRadius",
                        "newThickEdge20CircleCenter", "newThickEdge20CircleRadius",
                        "newThickEdge01CircleCenter", "newThickEdge01CircleRadius"];
const uniformNames = ["doEdges", "doVerts", "doParity", "doSolidColor", "modelIdx", "nIterations", "invRad", "nSamples", 
                        "eThickness", "doInvPol", "doInvVerts", "doOrns", "pValue", "qValue",
                        "doSnake", "expRatioRings", "ringLayerNum", "centerCutoff", "nRepeatPerSectV0", "nRepeatPerSectV2", "doForeRev", "doBackRev",
                        "doV0V1", "doV1V2", "doV2V0",
                        "preciseEdges", "V0", "V1", "V2", "D", "E", "D1", "E1", "D1p", "E1p", "D2", "E2",
                        "triV0EnlargedCircleCenter", "triV0EnlargedCircleRadius",
                        "triV1EnlargedCircleCenter", "triV1EnlargedCircleRadius",
                        "triV2EnlargedCircleCenter", "triV2EnlargedCircleRadius",
                        "V0EnlargedCircleCenter", "V0EnlargedCircleRadius",
                        "V2EnlargedCircleCenter", "V2EnlargedCircleRadius",
                        "C2RotSnakesCenter", "C2RotSnakesRadius",
                        "newThickEdge12CircleCenter", "newThickEdge12CircleRadius",
                        "newThickEdge20CircleCenter", "newThickEdge20CircleRadius",
                        "newThickEdge01CircleCenter", "newThickEdge01CircleRadius"];

const ParamContext = createContext();

function App() {
    // Parameters
    const [params, setParams] = useState({
        pValue: 4,
        qValue: 5,
        eThickness: 0.015,          // 👈 new line

        modelIdx: 0,

        doVerts: false,
        doInvVerts: false, 
        doOrns: false,

        preciseEdges: true,         // 👈 new line
        doV0V1: true,
        doV1V2: true,
        doV2V0: false,
        doEdges: true,

        doInvPol: false,
        doParity: false,
        doSolidColor: true,
        doSnake: false,

        doForeRev: false,
        doBackRev: false,
        expRatioRings: 0.115,
        ringLayerNum: 30,
        centerCutoff: 0.05,
        nRepeatPerSectV0: 2,
        nRepeatPerSectV2: 2,

        polygonColIdx: 0,
        invPolygonColIdx: 8,
        edgeColIdx: 2,
        vertColIdx: 3,
        invVertColIdx: 9,
        bgColIdx: 2,
        
        nIterations: 50,
        nSamples: 5,
        
        invCen: ZERO,
        invRad: 0,
        refNrm: ZERO
    });

    // Menus
    const [helpOpen, setHelpOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Elements
    const parentRef = useRef(null);
    const canvasRef = useRef(null);

    // Three components, shader, and uniforms
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const [fragmentShader, setShader] = useState(null);

    const uniformsRef = useRef({        
        pValue: {value: 0},
        qValue: {value: 0},
        resolution: {value: new Vector2()},
        refNrm: {value: new Vector2()},
        mousePos: {value: new Vector2(0, 0)},
        offset: {value: new Vector2(0, 0)},      // 👈 new line
        virtMouse: {value: new Vector2(0, 0)},      // 👈 new line
        invCen: {value: new Vector2()},
        time: {value: 0},
        scale: {value: 0},
        invRad: {value: 0},
        modelIdx: {value: 0},
        nIterations: {value: 0},
        invSamples: {value: 1},
        nSamples: {value: 1},
        doEdges: {value: false},
        doVerts: {value: false},
        doOrns: {value: false},
        doInvVerts: {value: false},
        doSolidColor: {value: false},
        doParity: {value: false},
        doInvPol: {value: false},
        doSnake: {value: false},

        doForeRev: {value: false},
        doBackRev: {value: false},
        expRatioRings: {value: 0.115},
        ringLayerNum: {value: 30.0},
        centerCutoff: {value: 0.05},
        nRepeatPerSectV0: {value: 2.0},
        nRepeatPerSectV2: {value: 2.0},

        doV0V1: {value: false},
        doV1V2: {value: false},
        doV2V0: {value: false},

        polygonCol: {value: new Vector3()},
        invPolygonCol: {value: new Vector3()},
        edgeCol: {value: new Vector3()},
        vertCol: {value: new Vector3()},
        invVertCol: {value: new Vector3()},
        bgCol: {value: new Vector3()},

        eThickness: {value: 0.045},   // 👈 new line

        preciseEdges: {value: true},  // 👈 new line
        V0: {value: new Vector2()},     // 👈 new line
        V1: {value: new Vector2()},     // 👈 new line
        V2: {value: new Vector2()},      // 👈 new line
        D: {value: new Vector2()},     // 👈 new line
        E: {value: new Vector2()},     // 👈 new line
        D1: {value: new Vector2()},     // 👈 new line
        E1: {value: new Vector2()},     // 👈 new line
        D1p: {value: new Vector2()},     // 👈 new line
        E1p: {value: new Vector2()},     // 👈 new line
        D2: {value: new Vector2()},     // 👈 new line
        E2: {value: new Vector2()},     // 👈 new line

        triV0EnlargedCircleCenter: {value: new Vector2()},  // 👈 new line
        triV0EnlargedCircleRadius: {value: 0},               // 👈 new line
        triV1EnlargedCircleCenter: {value: new Vector2()},  // 👈 new line
        triV1EnlargedCircleRadius: {value: 0},               // 👈 new line
        triV2EnlargedCircleCenter: {value: new Vector2()},  // 👈 new line
        triV2EnlargedCircleRadius: {value: 0},               // 👈 new line
        V0EnlargedCircleCenter: {value: new Vector2()},  // 👈 new line
        V0EnlargedCircleRadius: {value: 0}, 
        V2EnlargedCircleCenter: {value: new Vector2()},  // 👈 new line
        V2EnlargedCircleRadius: {value: 0},               // 👈 new line
        C2RotSnakesCenter: {value: new Vector2()},  // 👈 new line
        C2RotSnakesRadius: {value: 0},               // 👈 new line
        newThickEdge01CircleCenter: {value: new Vector2()},  // 👈 new line
        newThickEdge01CircleRadius: {value: 0},               // 👈 new line
        newThickEdge12CircleCenter: {value: new Vector2()},  // 👈 new line
        newThickEdge12CircleRadius: {value: 0},               // 👈 new line
        newThickEdge20CircleCenter: {value: new Vector2()},  // 👈 new line
        newThickEdge20CircleRadius: {value: 0}               // 👈 new line
    });
    
    // Window size and mouse things
    const isMobile = useRef(false);
    const [size, setSize] = useState(ZERO);
    const [scale, setScale] = useState(0);
    const [isDragging, setDragging] = useState(false);
    
    // Animation frame things
    const prevTime = useRef(0);
    const timeVal = useRef(0);
    const frameRef = useRef(null);

    /*
    Utility functions.
    */

    // Sets a uniform's value 
    const setUniform = (name, val) => { uniformsRef.current[name].value = val; }

    // Sets a 2D vector uniform's value
    const setVector2Uniform = (name, v) => { uniformsRef.current[name].value.set(v.x, v.y); }

    // Sets a 3D vector uniform's value
    const setVector3Uniform = (name, x, y, z) => { uniformsRef.current[name].value.set(x, y, z); }

    /*
    Saving the canvas to an image.
    */
   
    const downloadTiling = useCallback(() => {
        let dataUrl = canvasRef.current.toDataURL();
        let link = document.createElement("a");

        link.setAttribute("download", "tiling.png");
        link.setAttribute("href", dataUrl);
        link.click();
    }, [canvasRef]);

    /*
    Loading and saving tilings by URL.
    */

    const copyShareableLink = useCallback(() => {
        // Copy a shareable link to the clipboard
        let dat = {};
        for (let param of sharedParams) {
            dat[param] = params[param];
        }
        navigator.clipboard.writeText(window.location.origin + window.location.pathname + "#" + btoa(JSON.stringify(dat)));   
    }, [params]);

    const loadLinkIfAny = useCallback(() => {
        // Check if URL contains data
        let tokens = window.location.href.split("#");
        if (tokens.length > 1) {
            try {
                // Extract it if possible
                let dat = JSON.parse(atob(tokens[1]));
                setParams(prevParams => ({...prevParams, ...dat}));
            } catch(e) {
                console.error("Incorrectly formatted link");
            }
        }
    }, []);

    /*
    Main animation frame.
    */

    const mainLoop = useCallback((time) => {
        // Get time delta since last frame update
        let delta = 0;
        if (prevTime.current) {
            delta = time - prevTime.current;
        }
        prevTime.current = time;

        // Rerender the scene every frame
        setUniform("time", timeVal.current);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        
        // Update time
        // timeVal.current = (timeVal.current + timeFactor * delta) % 1;
        timeVal.current = (timeVal.current + timeFactor * delta);
        frameRef.current = requestAnimationFrame(mainLoop);
    }, []);

    /*
    Resize logic.
    */

    const setCanvasSize = useCallback((width, height) => {
        // Get size
        if (!rendererRef.current) {
            return;
        }
        let sizeVec = new Complex(width, height);
        let nScale = Math.min(width, height);

        // Set uniforms
        rendererRef.current.setSize(width, height);
        setVector2Uniform("resolution", sizeVec);
        setUniform("scale", nScale);
        setScale(nScale);
        setSize(sizeVec);
    }, [rendererRef]);

    const checkScreenSize = useCallback(() => {
        if (window.innerWidth < minWidth) {
            isMobile.current = true;
            cancelAnimationFrame(frameRef.current);
        } else {
            if (isMobile.current) {
                frameRef.current = requestAnimationFrame(mainLoop);
            }
            isMobile.current = false;
        }
    }, [mainLoop]);

    /*
    Mouse handlers.
    */

    const getMouseCoord = (evt) => {
        // Get touch if event is a touchscreen
        if (evt.touches && evt.touches.length > 0) {
            evt = evt.touches.item(0);
        }
        
        // Gets the mouse position relative to the canvas
        let rect = canvasRef.current.getBoundingClientRect();
        return new Complex(
            evt.clientX - rect.left,
            evt.clientY - rect.top);
    }


    // Start dragging on click or touch
    const onInteractionStart = () => { setDragging(true); }

    const onInteractionMove = useCallback((evt) => {
        // Update the display when the mouse is moved
        evt.preventDefault();
        if (!isDragging) {
            return;
        }

        // Remap mouse position to screen/disk
        let modelMap = modelMaps[params.modelIdx];
        let currPos = getMouseCoord(evt);
        let scrnPos = new Complex(
            (2 * currPos.x - size.x) / scale,
            (size.y - 2 * currPos.y) / scale);
        let diskPos = modelMap(scrnPos);

        // Update disk position
        if (diskPos.normSq() < 1) {
            setVector2Uniform("mousePos", diskPos);
        } else { 
            endInteraction();
        }
    }, [isDragging, scale, size, params]);
    
    // Stop dragging when the user releases the mouse
    const endInteraction = () => { setDragging(false); }


    //////////////////////////
    // // const dragOffset = useRef(new Complex(0, 0));

    // const onInteractionStart = (evt) => {
    //     // setVector2Uniform("offset", new Complex(0, 0));
    //     setDragging(true);


    //     // Calculate the offset of the mouse at the time the mouse is pressed
    //     let modelMap = modelMaps[params.modelIdx];
    //     let currPos = getMouseCoord(evt);
    //     let scrnPos = new Complex(
    //         (2 * currPos.x - size.x) / scale,
    //         (size.y - 2 * currPos.y) / scale
    //     );
    //     let diskPos = modelMap(scrnPos);

    //     // current center (from uniform)
    //     let currCenter = modelMap(uniformsRef.current.mousePos.value).add(modelMap(uniformsRef.current.offset.value));

    //     // store offset = center - mouse position
    //     // dragOffset.current = new Complex(currCenter.x, currCenter.y).sub(diskPos);
    //     let dragOffset = new Complex(currCenter.x, currCenter.y).sub(diskPos);
    //     // setVector2Uniform("offset", dragOffset);
    //     setVector2Uniform("offset", currCenter);
    // };

    // const onInteractionMove = useCallback((evt) => {
    //     evt.preventDefault();
    //     if (!isDragging) return;

    //     let modelMap = modelMaps[params.modelIdx];
    //     let currPos = getMouseCoord(evt);
    //     let scrnPos = new Complex(
    //         (2 * currPos.x - size.x) / scale,
    //         (size.y - 2 * currPos.y) / scale
    //     );
    //     let diskPos = modelMap(scrnPos);

    //     // setVector2Uniform("offset", uniformsRef.current.mousePos.value.sub(diskPos));

    //     // add the offset so dragging feels smooth
    //     let newCenter = diskPos.add(modelMap(uniformsRef.current.offset.value));

    //     if (diskPos.normSq() < 1) {
    //         setVector2Uniform("mousePos", newCenter);
    //         // setVector2Uniform("mousePos", diskPos);
    //     } else {
    //         endInteraction();
    //     }
    // }, [isDragging, scale, size, params]);

    // // Stop dragging when the user releases the mouse
    // const endInteraction = () => { 
    //     setDragging(false); 
    // }
    /////////////////////////////////////

    /*
    First useEffect: add resize listeners, prepare tiling, and load shader.
    */

    const initialize = useCallback(() => {
        // Add resize observer
        const observer = new ResizeObserver((entries) => {
            let newBox = entries[0].contentRect;
            setCanvasSize(newBox.width, newBox.height);
        });
        window.addEventListener("resize", checkScreenSize);
        observer.observe(parentRef.current);
        loadLinkIfAny();

        // Initialize tiling parameters
        setParams(paras => ({
            ...paras, 
            ...generateTilingParams(paras.pValue, paras.qValue, paras.eThickness)
        }));

        // Load shader
        fetch("shader.glsl")
            .then(resp => resp.text())
            .then(resp => setShader(resp));
        
        // Remove event listeners
        return () => {
            window.removeEventListener("resize", checkScreenSize);
            observer.unobserve(parentRef.current);
        }
    }, [setCanvasSize, checkScreenSize, loadLinkIfAny]);

    /*
    Second useEffect: build shader.
    */

    const prepareThree = useCallback(() => {
        // Check if shader is loaded
        checkScreenSize();
        if (!fragmentShader) {
            return;
        }

        // Initialize Three components
        rendererRef.current = new WebGLRenderer({
            canvas: canvasRef.current,
            preserveDrawingBuffer: true
        });
        sceneRef.current = new Scene();
        cameraRef.current = new OrthographicCamera(-1, 1, 1, -1, -1, 1);

        // Build shader and plane
        let mat = new ShaderMaterial({
            fragmentShader, 
            uniforms: uniformsRef.current,
            glslVersion: GLSL3
        });
        let pln = new PlaneGeometry(2, 2);
        sceneRef.current.add(new Mesh(pln, mat));

        // Set initial size and run if screen is big enough
        if (!isMobile.current) {
            let box = parentRef.current.getBoundingClientRect();
            setCanvasSize(box.width, box.height);
            mainLoop();
        }
    }, [setCanvasSize, mainLoop, checkScreenSize, isMobile, fragmentShader]);

    /*
    Third useEffect: update uniforms.
    */

    const updateUniforms = useCallback(() => {
        // Updates the uniforms
        for (let name of uniformNames) {
            setUniform(name, params[name]);
        }
        setUniform("invSamples", 1 / params.nSamples);
        setVector2Uniform("refNrm", params.refNrm);
        setVector2Uniform("invCen", params.invCen);

        // Get preset color
        let col = colors[params.polygonColIdx];
        setVector3Uniform("polygonCol", col[0] / 255, col[1] / 255, col[2] / 255);
        col = colors[params.invPolygonColIdx];
        setVector3Uniform("invPolygonCol", col[0] / 255, col[1] / 255, col[2] / 255);
        col = colors[params.edgeColIdx];
        setVector3Uniform("edgeCol", col[0] / 255, col[1] / 255, col[2] / 255);
        col = colors[params.vertColIdx];
        setVector3Uniform("vertCol", col[0] / 255, col[1] / 255, col[2] / 255);
        col = colors[params.invVertColIdx];
        setVector3Uniform("invVertCol", col[0] / 255, col[1] / 255, col[2] / 255);
        col = colors[params.bgColIdx];
        setVector3Uniform("bgCol", col[0] / 255, col[1] / 255, col[2] / 255);
        
    }, [params]);

    // Add useEffects
    useEffect(initialize, [initialize]);
    useEffect(prepareThree, [prepareThree]);
    useEffect(updateUniforms, [updateUniforms]);

    return (
        <ParamContext.Provider value={[params, setParams]}>
            <HelpMenu 
                isOpen={helpOpen} onClose={() => { setHelpOpen(false); }} />
            <SettingsMenu 
                isOpen={settingsOpen} onClose={() => { setSettingsOpen(false); }} />
            <ScreenError />
            <div id="app-parent">
                <TopbarMenu 
                    onHelp={() => { setHelpOpen(true); }} onSettings={()=>{ setSettingsOpen(true); }}
                    onSaveImg={downloadTiling} onShare={copyShareableLink}/>
                <div id="canvas-container" ref={parentRef}>
                    <canvas id="main-canvas" className={(isDragging ? "dragging" : "")} ref={canvasRef} 
                    onMouseDown={onInteractionStart} onTouchStart={onInteractionStart}
                    onMouseMove={onInteractionMove} onTouchMove={onInteractionMove}
                    onMouseUp={endInteraction} onMouseOut={endInteraction} 
                    onTouchEnd={endInteraction} onTouchCancel={endInteraction}></canvas>
                </div>
            </div>
        </ParamContext.Provider>
    )
}

export default App;
export { ParamContext };