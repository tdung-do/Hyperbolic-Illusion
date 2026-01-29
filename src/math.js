/**
 * This file contains complex number and hyperbolic model utilities.
 * This code is protected under the MIT license (see the LICENSE file).
 * @author tdung-do
 */

// import { inverse } from "three/tsl";

// Complex number class.
class Complex {
    /**
     * Creates a new complex number.
     * @param {Number} x Real part.
     * @param {Number} y Imaginary part.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Adds two complex numbers
    add(z) { return new Complex(this.x + z.x, this.y + z.y); }

    // Subtracts two complex numbers
    sub(z) { return new Complex(this.x - z.x, this.y - z.y); }

    // Multiplies two complex numbers
    mul(z) { return new Complex(this.x * z.x - this.y * z.y, this.x * z.y + this.y * z.x); }

    // Divides two complex numbers
    div(z) { return this.mul(z.reciprocal()); }

    // Scales a complex number by a real number
    mulRe(k) { return new Complex(this.x * k, this.y * k); }

    // Divides a complex number by a real number
    divRe(k) { return this.mulRe(1 / k); }

    // Conjugate of the current complex number
    conj() { return new Complex(this.x, -this.y); }

    // Squared norm of the current complex number
    normSq() { return this.x * this.x + this.y * this.y; }

    // Norm of the current complex number
    getNorm() { return Math.sqrt(this.normSq()); }

    // Normalization of a complex number to length 1
    getNormalized() { return this.divRe(this.getNorm()); }

    // Reciprocal of the current complex number
    reciprocal() { return this.conj().divRe(this.normSq()); }

    exp() { 
        // Complex exponential of current complex number (e^{this})
        return versor(this.y).mulRe(Math.exp(this.x));
    }

    tanh() { 
        // Complex hyperbolic tangent of the current complex number
        let exp = this.mulRe(2).exp();
        return exp.sub(CMP_ONE).div(exp.add(CMP_ONE));
    }

    power(n) {
        let r = this.getNorm();
        let phi = Math.atan2(this.y, this.x);

        return versor(n*phi).mulRe(Math.pow(r, n));
    }

    root(n) {
        let nthRootr = Math.pow(this.getNorm(), 1/n);
        let phi = Math.atan2(this.y, this.x);

        let roots = [];
        for (let k = 0; k < n; k++) {
            roots.push(versor((phi + 2 * k * Math.PI) / n).mulRe(nthRootr));
        }
        return roots;
    }
}

// Euler's formula e^it = cos(t) + i sin(t)
const versor = (t) => new Complex(Math.cos(t), Math.sin(t));

// Constants
const CMP_ONE = new Complex(1, 0);
const CMP_I = new Complex(0, 1);

/*
Mappings from various models of the hyperbolic plane to Poincare disk model.
*/

// Scaling factors for various models
const gansScale = 10;
const mapScale = 3;

const modelMaps = [
    (z) => z, // Poincare disk model (default)
    (z) => { // Upper half-plane model
        z.y ++;
        return z.sub(CMP_I).div(z.add(CMP_I));
    },
    (z) => z.divRe(1 + Math.sqrt(1 - z.normSq())), // Beltrami-Klein model
    (z) => z.mulRe(mapScale).reciprocal(), // Inverted Poincare model
    (z) => { // Gans model
        z = z.mulRe(gansScale);
        return z.divRe(1 + Math.sqrt(1 + z.normSq()));
    },
    (z) => {
        // Azimuthal equidistant projection
        z = z.mulRe(mapScale);
        let mag = Math.tanh(z.getNorm() * 0.5);
        return z.getNormalized().mulRe(mag);
    },
    (z) => {
        // Equal-area projection
        z = z.mulRe(mapScale);
        return z.divRe(Math.sqrt(1 + z.normSq()));
    },
    (z) => z.tanh(), // Band model
];

/*
Computing the tiling parameters for a given Schlafli symbol.
*/

const generateTilingParams = (p, q, edgeThickness) => {
    let alpha = Math.PI / p; 
    let refDir = versor(alpha);

    // Compute Euclidean distance from polygon's vertices to center
    let beta = Math.PI / q;
    let cotq = 1 / Math.tan(beta);
    let tanp = refDir.y / refDir.x;
    let rSide = Math.sqrt((cotq - tanp) / (cotq + tanp));
    
    // Inversion circle center and radius
    let cenX = .5 * (rSide * rSide + 1) / (rSide * refDir.x);
    let invRadSq = cenX * cenX + (-2 * refDir.x * cenX + rSide) * rSide;
    let invCen= new Complex(cenX, 0);
    let invRad= Math.sqrt(invRadSq);

    // --- Fundamental triangle vertices ---

    // V0: disk center
    let V0 = new Complex(0, 0);

    // V1: along radial line toward invCen, distance to inversion circle edge
    let dir = invCen.sub(V0).getNormalized();  // unit vector from origin to invCen
    let d_edge = invCen.sub(V0).getNorm() - invRad;
    let V1 = dir.mulRe(d_edge);
    // console.log("V1:",V1)

    let V2 = intersectCircleWithOriginLine(invCen, invRad, refDir);


    // Universal thickening point 
    let M_thickPoint = new Complex(0, edgeThickness);

    
    //Calculate the center and radius of the edge V0V1 thickening circle
    let P1 = new Complex(-1, 0);
    let P2 = new Complex(1, 0);

    // Find the thickening point for V0V1
    let MMap01 = MobiusMap3PointsTo_m101(P1, V0, P2);
    let newM01 = applyMobiusTrans(MMap01, M_thickPoint, true);

    // // Compute circle center (Cx, Cy) through P1, P2, newM01
    let { center: newThickEdge01CircleCenter, 
        radius: newThickEdge01CircleRadius } = circleFrom3Points(P1, P2, newM01);


    // Calculate the center and radius of the edge V1V2 thickening circle
    // Compute intersections of invCen circle with unit disk
    let intersections = circleCircleIntersections(invCen, invRad, V0, 1.0);

    // sort by y descending (top first)
    intersections.sort((a, b) => b.y - a.y);
    P1 = intersections[0]; // upper
    P2 = intersections[1]; // lower

    // Find the thickening point for V1V2
    let MMap12 = MobiusMap3PointsTo_m101(P2, V1, P1);
    let newM12 = applyMobiusTrans(MMap12, M_thickPoint, true);

    // Compute circle center (Cx, Cy) through P1, P2, newM12
    let { center: newThickEdge12CircleCenter, 
        radius: newThickEdge12CircleRadius } = circleFrom3Points(P1, P2, newM12);
    
    
    //Calculate the center and radius of the edge V2V0 thickening circle
    P1 = V2.divRe(V2.getNorm());
    P2 = V2.divRe(-V2.getNorm());

    // Find the thickening point for V2V0
    let MMap20 = MobiusMap3PointsTo_m101(P1, V0, P2);
    let newM20 = applyMobiusTrans(MMap20, M_thickPoint, true);

    // Compute circle center (Cx, Cy) through P1, P2, newM01
    let { center: newThickEdge20CircleCenter, 
        radius: newThickEdge20CircleRadius } = circleFrom3Points(P1, P2, newM20);
    

    // DONE! (CHECK THE REORDERING THING)
    // let { center: newThickEdge01CircleCenter, 
    //     radius: newThickEdge01CircleRadius } = circleFrom3Points(P1, P2, M_thickPoint);

    // newThickEdge01CircleCenter = applyMobiusTrans(MMap01, newThickEdge01CircleCenter, true);
    // newThickEdge01CircleRadius = (newThickEdge01CircleCenter.sub(P2)).getNorm();

    // let { center: newThickEdge12CircleCenter, 
    //     radius: newThickEdge12CircleRadius } = circleFrom3Points(P1, P2, M_thickPoint);

    // newThickEdge12CircleCenter = applyMobiusTrans(MMap12, newThickEdge12CircleCenter, true);
    // newThickEdge12CircleRadius = (newThickEdge12CircleCenter.sub(P1)).getNorm();

    
    // Find the enlarged circle at triV0
    // Intersections of thick edge 20 circle with thick edge 01 circle
    let thickEdgeIntersection_20_01 =
        circleCircleIntersections(
            newThickEdge20CircleCenter,
            newThickEdge20CircleRadius,
            newThickEdge01CircleCenter,
            newThickEdge01CircleRadius
        ).filter(p => isInsideTriangle(p, V0, V1, V2))[0];

    // Compute circle enlarged triV0
    let { center: triV0EnlargedCircleCenter, 
        radius: triV0EnlargedCircleRadius } = enlargedCircleAtPoint(thickEdgeIntersection_20_01,
                                                            MMap20,
                                                            MMap01);


    // Find the enlarged circle at triV1
    // Intersections of thick edge 01 circle with thick edge 12 circle
    let thickEdgeIntersection_01_12 =
        circleCircleIntersections(
            newThickEdge01CircleCenter,
            newThickEdge01CircleRadius,
            newThickEdge12CircleCenter,
            newThickEdge12CircleRadius
        ).filter(p => isInsideTriangle(p, V0, V1, V2))[0];

    // Compute circle enlarged triV1
    let { center: triV1EnlargedCircleCenter, 
        radius: triV1EnlargedCircleRadius } = enlargedCircleAtPoint(thickEdgeIntersection_01_12,
                                                            MMap01,
                                                            MMap12);


    // Find the enlarged circle at triV2
    // Intersections of thick edge 12 circle with thick edge 20 circle
    let thickEdgeIntersection_12_20 =
        circleCircleIntersections(
            newThickEdge12CircleCenter,
            newThickEdge12CircleRadius,
            newThickEdge20CircleCenter,
            newThickEdge20CircleRadius
        ).filter(p => isInsideTriangle(p, V0, V1, V2))[0];


    // Compute circle enlarged at V2
    let { center: triV2EnlargedCircleCenter, 
        radius: triV2EnlargedCircleRadius } = enlargedCircleAtPoint(thickEdgeIntersection_12_20,
                                                            MMap12,
                                                            MMap20);


    // Find the enlarged circle at V2
    // Intersections of thick edge 12 circle with edge V2V0
    // This is thickEdgeIntersection_12_V2V0
    let V2a = intersectCircleWithOriginLine(newThickEdge12CircleCenter,
                                            newThickEdge12CircleRadius,
                                            refDir);
    
    // --- Point reflected of V2a via MMap12 ---
    let V2a_trans_12 = applyMobiusTrans(MMap12, V2a, false);
    // V2b is V2a reflected via V1V2
    let V2b_trans_12 = new Complex(V2a_trans_12.x, -V2a_trans_12.y);
    let V2b = applyMobiusTrans(MMap12, V2b_trans_12, true);
    // --- Point reflected of V2b via MMap20 ---
    let V2b_trans_20 = applyMobiusTrans(MMap20, V2b, false);
    // V2c is V2b reflected via V2V0
    let V2c_trans_20 = new Complex(V2b_trans_20.x, -V2b_trans_20.y);
    let V2c = applyMobiusTrans(MMap20, V2c_trans_20, true);
    // Compute circle enlarged V2
    let { center: V2EnlargedCircleCenter, 
        radius: V2EnlargedCircleRadius } = circleFrom3Points(V2a, V2b, V2c);

    
    // Find the enlarged circle at V0
    // Intersections of thick edge 01 circle with edge V2V0
    // This is thickEdgeIntersection_01_V2V0
    let V0a = intersectCircleWithOriginLine(newThickEdge01CircleCenter,
                                            newThickEdge01CircleRadius,
                                            refDir);
    
    // --- Point reflected of V0a via MMap01 ---
    let V0b = new Complex(V0a.x, -V0a.y);
    // --- Point reflected of V0b via MMap20 ---
    let V0b_trans_20 = applyMobiusTrans(MMap20, V0b, false);
    let V0c_trans_20 = new Complex(V0b_trans_20.x, -V0b_trans_20.y);
    let V0c = applyMobiusTrans(MMap20, V0c_trans_20, true);
    // Compute circle enlarged V2
    let { center: V0EnlargedCircleCenter, 
        radius: V0EnlargedCircleRadius } = circleFrom3Points(V0a, V0b, V0c);
    
    let len_rat = 0.6;
    let angle_rat = 0.6;
    let D = new Complex(edgeThickness * 4., 0.);
    let E = ornament(D, V2, len_rat, angle_rat);

    let MMap2 = MobiusMap3PointsTo_m101(intersections[1], V2, intersections[0]);
    let tmp_E2 = ornament(new Complex(-D.x, D.y), applyMobiusTrans(MMap2, V0, false), len_rat, angle_rat);
    let D2 = applyMobiusTrans(MMap2, new Complex(-D.x, D.y), true);
    let E2 = applyMobiusTrans(MMap2, tmp_E2, true);

    // let tmp_E1 = ornament(D, applyMobiusTrans(MMap12, V0, false), len_rat, 1 - angle_rat);
    // let E1 = applyMobiusTrans(MMap12, tmp_E1, true);
    let D1 = applyMobiusTrans(MMap12, D, true);
    let E1 = applyMobiusTrans(MMap12, E, true);
    

    let MMap1 = MobiusMap3PointsTo_m101(new Complex(-1., 0.), V1, new Complex(1., 0.));
    let D1p = applyMobiusTrans(MMap1, new Complex(-D.x, D.y), true);
    let E1p = applyMobiusTrans(MMap1, new Complex(-E.x, E.y), true);

    // Compute circle "center" at V2 with "radius" V2V1
    let V1_trans_20 = applyMobiusTrans(MMap20, V1, false);
    let V1_trans_20_ref_20 = new Complex(V1_trans_20.x, -V1_trans_20.y);
    let V1_ref_20 = applyMobiusTrans(MMap20, V1_trans_20_ref_20, true);

    let V1_ref_20_trans_12 = applyMobiusTrans(MMap12, V1_ref_20, false);
    let V1_ref_20_trans_12_ref_12 = new Complex(V1_ref_20_trans_12.x, -V1_ref_20_trans_12.y);
    let V1_ref_20_ref_12 = applyMobiusTrans(MMap12, V1_ref_20_trans_12_ref_12, true);
    
    let { center: C2RotSnakesCenter, 
        radius: C2RotSnakesRadius } = circleFrom3Points(V1, V1_ref_20, V1_ref_20_ref_12);

    return {
        invCen,
        invRad,
        refNrm: new Complex(refDir.y, -refDir.x),
        V0,
        V1,
        V2,
        D,
        E,
        D1,
        E1,
        D1p,
        E1p,
        D2,
        E2,
        triV0EnlargedCircleCenter,
        triV0EnlargedCircleRadius,
        triV1EnlargedCircleCenter,
        triV1EnlargedCircleRadius,
        triV2EnlargedCircleCenter,
        triV2EnlargedCircleRadius,
        V0EnlargedCircleCenter,
        V0EnlargedCircleRadius,
        V2EnlargedCircleCenter,
        V2EnlargedCircleRadius,
        newThickEdge12CircleCenter,
        newThickEdge12CircleRadius,
        newThickEdge01CircleCenter,
        newThickEdge01CircleRadius,
        newThickEdge20CircleCenter,
        newThickEdge20CircleRadius,
        C2RotSnakesCenter,
        C2RotSnakesRadius
    };
}

// This function takes in 3 non-colinear points p1, p2, p3
// and return the center and radius of the unique circle passes through them
const circleFrom3Points = (p1, p2, p3) => {
    // Compute circle center (Cx, Cy) through p1, p2, p3
    let A = p1.x - p2.x;
    let B = p1.y - p2.y;
    let C = p1.x - p3.x;
    let D = p1.y - p3.y;
    let E = (p1.x*p1.x - p2.x*p2.x + p1.y*p1.y - p2.y*p2.y) * 0.5;
    let F = (p1.x*p1.x - p3.x*p3.x + p1.y*p1.y - p3.y*p3.y) * 0.5;
    let det = A*D - B*C;

    let center = new Complex((D*E - B*F)/det, (-C*E + A*F)/det);
    let radius = center.sub(p1).getNorm();

    return {
        center,
        radius
    };
}

// This function takes in 3 points P, Q, R in Complex coords
// and return a "2x2 matrix" that represent the Mobius transformation that
// map P, Q, R to -1, 0, 1 in Complex plane
const MobiusMap3PointsTo_m101 = (P, Q, R) => {
    let denoms = (P.sub(R).mul(Q.sub(P)).mul(Q.sub(R)).mulRe(2)).root(2);
    let denom = denoms[0];

    return {
        a: (P.sub(R)).div(denom),
        b: (Q.mulRe(-1).mul(P.sub(R))).div(denom),
        c: ((Q.sub(P)).add(Q.sub(R))).div(denom),
        d: ((P.mulRe(-1).mul(Q.sub(R))).sub(R.mul(Q.sub(P)))).div(denom)
    }
}

// This function takes in a "2x2 matrix" that represent the Mobius transformation mapMat,
// a point z, and bool whether the matrix is inverted 
// and return the point when mapMat is applied to z
const applyMobiusTrans = (MMap, z, inverted = false) => {
    if (inverted) {
        // (dz - b)/(-cz + a)
        return (MMap.d.mul(z).sub(MMap.b)).div(MMap.a.sub(MMap.c.mul(z)));
    } else {
        // (az + b)/(cz + d)
        return (MMap.a.mul(z).add(MMap.b)).div(MMap.d.add(MMap.c.mul(z)));
    }
}

// Return intersection points of two circles (or [] if none)
// Based on https://mathworld.wolfram.com/Circle-CircleIntersection.html
const circleCircleIntersections = (c1, r1, c2, r2) => {
    let dVec = c2.sub(c1);
    let d = dVec.getNorm();

    // no intersections (separate, contained, or coincident)
    if (d > r1 + r2 || d < Math.abs(r1 - r2) || d < 1e-12) return [];

    // distance from c1 to chord midpoint
    let x = (r1*r1 - r2*r2 + d*d) / (2*d);
    let h2 = r1*r1 - x*x;
    if (h2 < 0) h2 = 0;

    let p = c1.add(dVec.mulRe(x / d)); // chord midpoint

    // perpendicular direction
    let perp = new Complex(-dVec.y, dVec.x).getNormalized();
    let h = Math.sqrt(h2);

    let i1 = p.add(perp.mulRe(h));
    let i2 = p.sub(perp.mulRe(h));

    return h < 1e-12 ? [i1] : [i1, i2];
};

// https://www.geeksforgeeks.org/dsa/check-whether-a-given-point-lies-inside-a-triangle-or-not/
const isInsideTriangle = (p, a, b, c) => {
    // Denominator of barycentric coordinates
    let denominator =
        (b.y - c.y) * (a.x - c.x) +
        (c.x - b.x) * (a.y - c.y);

    // Degenerate triangle safety
    if (Math.abs(denominator) < 1e-12) return false;

    // Barycentric coordinates
    let alpha =
        ((b.y - c.y) * (p.x - c.x) +
         (c.x - b.x) * (p.y - c.y)) / denominator;

    let beta =
        ((c.y - a.y) * (p.x - c.x) +
         (a.x - c.x) * (p.y - c.y)) / denominator;

    let gamma = 1 - alpha - beta;

    // Inside (or on boundary)
    return alpha >= 0 && beta >= 0 && gamma >= 0;
};

function enlargedCircleAtPoint(P, MMapA, MMapB) {
    // --- Point reflected via MMapA ---
    const P_trans_A = applyMobiusTrans(MMapA, P, false);

    const P_reflect_trans_A = new Complex(P_trans_A.x, -P_trans_A.y);

    const P_reflect_A = applyMobiusTrans(MMapA, P_reflect_trans_A, true);

    // --- Point reflected via MMapB ---
    const P_trans_B = applyMobiusTrans(MMapB, P, false);

    const P_reflect_trans_B = new Complex(P_trans_B.x, -P_trans_B.y);

    const P_reflect_B = applyMobiusTrans(MMapB, P_reflect_trans_B, true);

    // --- Circle from 3 points ---
    return circleFrom3Points(P, P_reflect_A, P_reflect_B);
}

function ornament(D, refDir, len_rat, angle_rat) {
    // Angle of V0D (should be 0, but we compute it for robustness)
    const thetaD = Math.atan2(D.y, D.x);

    // Angle of V0V2 (refDir gives direction)
    const thetaV2 = Math.atan2(refDir.y, refDir.x);

    // Interpolated angle for V0E
    const thetaE = thetaD + angle_rat * (thetaV2 - thetaD);

    // Radius of V0E
    const rE = len_rat * D.getNorm();

    // Construct E
    return versor(thetaE).mulRe(rE);
}

function intersectCircleWithOriginLine(invCen, invRad, refDir) {
    // line normal n = (refDir.y, -refDir.x)
    const nx = refDir.y;
    const ny = -refDir.x;

    const cenX = invCen.x;
    const cenY = invCen.y;

    let V = null;

    // Non-vertical line
    if (Math.abs(ny) > 1e-12) {
        // line: nx*x + ny*y = 0  →  y = slope * x
        const slope = -nx / ny;

        // Substitute into circle equation
        // (x - cx)^2 + (slope*x - cy)^2 = r^2
        const A = 1 + slope * slope;
        const B = -2 * (cenX + slope * cenY);
        const C = cenX * cenX + cenY * cenY - invRad * invRad;

        const disc = B * B - 4 * A * C;
        if (disc < 0) return null;

        const x1 = (-B + Math.sqrt(disc)) / (2 * A);
        const y1 = slope * x1;

        const x2 = (-B - Math.sqrt(disc)) / (2 * A);
        const y2 = slope * x2;

        const cand1 = new Complex(x1, y1);
        const cand2 = new Complex(x2, y2);

        // pick the intersection inside the unit disk
        V = cand1.getNorm() < cand2.getNorm() ? cand1 : cand2;
    }
    // Vertical line: x = 0
    else {
        // (0 - cx)^2 + (y - cy)^2 = r^2
        let radTerm = invRad * invRad - cenX * cenX;
        if (radTerm < 0) radTerm = 0; // numerical safety

        const y = cenY + Math.sqrt(radTerm);
        const cand1 = new Complex(0, y);
        const cand2 = new Complex(0, cenY - Math.sqrt(radTerm));

        V = cand1.getNorm() < cand2.getNorm() ? cand1 : cand2;
    }

    return V;
}

export { Complex, generateTilingParams, modelMaps };