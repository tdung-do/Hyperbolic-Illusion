/**
 * This is the fragment shader, responsible for rendering the tiling.
 * This code is protected under the MIT license (see the LICENSE file).
 * Author: tdung-do
 */

uniform vec2 resolution;
uniform float time;
uniform float scale;

// Tiling parameters
uniform vec2 invCen;
uniform vec2 refNrm;
uniform vec2 mousePos;
uniform float invRad;

uniform float pValue;
uniform float qValue;


// Appearance settings
uniform vec3 polygonCol;
uniform vec3 invPolygonCol;
uniform vec3 edgeCol;
uniform vec3 vertCol;
uniform vec3 invVertCol;
uniform vec3 bgCol;

uniform int modelIdx;
uniform bool doEdges;
uniform bool doVerts;
uniform bool doOrns;
uniform bool doInvVerts;
uniform bool doSolidColor;
uniform bool doParity;
uniform bool doInvPol;

uniform bool doSnake;
uniform float expRatioRings;
uniform float ringLayerNum;
uniform float centerCutoff;
uniform float nRepeatPerSectV0;
uniform float nRepeatPerSectV2;

uniform bool doV0V1;
uniform bool doV1V2;
uniform bool doV2V0;


// Rendering settings
uniform int nSamples;
uniform float invSamples;
uniform int nIterations;

// uniform float eThickness; // 👈 new line
uniform bool preciseEdges; // 👈 new line
uniform vec2 V0;    //Point on the center of disk        // 👈 new line
uniform vec2 V1;    //Point on the x-axis        // 👈 new line
uniform vec2 V2;    //The other point        // 👈 new line
uniform vec2 D;        // 👈 new line
uniform vec2 E;        // 👈 new line
uniform vec2 D1;        // 👈 new line
uniform vec2 E1;        // 👈 new line
uniform vec2 D1p;        // 👈 new line
uniform vec2 E1p;        // 👈 new line
uniform vec2 D2;        // 👈 new line
uniform vec2 E2;        // 👈 new line

uniform vec2 triV0EnlargedCircleCenter;         // 👈 new line
uniform float triV0EnlargedCircleRadius;        // 👈 new line
uniform vec2 triV1EnlargedCircleCenter;         // 👈 new line
uniform float triV1EnlargedCircleRadius;        // 👈 new line
uniform vec2 triV2EnlargedCircleCenter;         // 👈 new line
uniform float triV2EnlargedCircleRadius;        // 👈 new line
uniform vec2 V0EnlargedCircleCenter;         // 👈 new line
uniform float V0EnlargedCircleRadius;        // 👈 new line
uniform vec2 V2EnlargedCircleCenter;         // 👈 new line
uniform float V2EnlargedCircleRadius;        // 👈 new line
// uniform vec2 C2RotSnakesCenter;         // 👈 new line
// uniform float C2RotSnakesRadius;        // 👈 new line


uniform vec2 newThickEdge12CircleCenter;         // 👈 new line
uniform float newThickEdge12CircleRadius;        // 👈 new line
uniform vec2 newThickEdge20CircleCenter;         // 👈 new line
uniform float newThickEdge20CircleRadius;        // 👈 new line
uniform vec2 newThickEdge01CircleCenter;         // 👈 new line
uniform float newThickEdge01CircleRadius;        // 👈 new line


out vec4 outputCol;

// #define BG_COLOR vec3(.07)
#define THICKNESS .05
#define COLOR_COEFF 3.
#define PARITY_COEFF .6

/*
Complex utility functions and transformations.
*/

#define CMP_I vec2(0., 1.)
#define CMP_ONE vec2(1., 0.)

float normSq(vec2 v) { return dot(v, v); } // Squared norm of a vector

vec2 cinv(vec2 z) {
    // Complex reciprocal
    return vec2(z.x, -z.y) / normSq(z);
}

vec2 cmul(vec2 a, vec2 b) {
    // Complex number multiplication
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
    // Complex number division
    return cmul(a, cinv(b)); 
}

vec2 cexp(vec2 z) { 
    // Complex exponential
    return vec2(cos(z.y), sin(z.y)) * exp(z.x);
}

vec2 ctanh(vec2 z) {
    // Complex hyperbolic tangent
    z = cexp(2. * z);
    return cdiv(z - CMP_ONE, z + CMP_ONE);
}

#define PI 3.14159265358
#define MAP_SCALE 3.
#define GANS_SCALE 10.

vec2 remapToDisk(vec2 z) {
    // Remaps the point from the given model to the Poincare disk
    
    switch (modelIdx) {
        case 0:
            // Poincare disk model
            // float theta = time * 1.1;
            // mat2 M = mat2(cos(theta), sin(theta), -sin(theta), cos(theta));
            // z = M * z; // Make the model spin around origin
            return z;
        case 1:
            // Half-plane model
            z.y++;
            // z.x += time * 2.; //Make the model drift
            return cdiv(z - CMP_I, z + CMP_I);
        case 2:
            // Klein model
            return z / (1. + sqrt(1. - normSq(z)));
        case 3:
            // Inverted Poincare disk model
            return cinv(z * MAP_SCALE);
        case 4:
            // Gans model
            z *= GANS_SCALE;
            return z / (1. + sqrt(1. + normSq(z)));
        case 5:
            // Azimuthal equidistant projection
            z *= MAP_SCALE;
            float len = tanh(.5 * length(z));
            return normalize(z) * len;
        case 6:
            // Equal-area projection
            z *= MAP_SCALE;
            return z / sqrt(1. + normSq(z));
        case 7:
            // Band model
            return ctanh(z);
    }
    return z;
}

vec2 shift(vec2 z, vec2 a) {
    // Transform point in unit disk
    return cdiv(z - a, vec2(1., 0.) - cmul(z, a * vec2(1., -1.)));
}

bool isInsideTriangle(vec2 p, vec2 a, vec2 b, vec2 c)
{
    // Denominator of barycentric coordinates
    float denominator =
          (b.y - c.y) * (a.x - c.x)
        + (c.x - b.x) * (a.y - c.y);

    // Degenerate triangle safety
    if (abs(denominator) < 1e-12)
        return false;

    // Barycentric coordinates
    float alpha =
        ((b.y - c.y) * (p.x - c.x)
       + (c.x - b.x) * (p.y - c.y)) / denominator;

    float beta =
        ((c.y - a.y) * (p.x - c.x)
       + (a.x - c.x) * (p.y - c.y)) / denominator;

    float gamma = 1.0 - alpha - beta;

    // Inside (or on boundary)
    return (alpha >= 0.0 && beta >= 0.0 && gamma >= 0.0);
}

vec3 rotatingSnakeColor(vec2 p, float R, float oddParity, float nRepeats, float thetaMax) {
    float r = length(p) / R;

    // Nonlinear radial warp
    float rr = pow(r, expRatioRings) * ringLayerNum; // pow value - ratio of r between outer and immediate inner; num - number of rings
    float ring = floor(rr);
    float rf = pow(fract(rr), 1.0 / 1.5);

    // Compute angular phase that repeats nRepeats times over thetaMax
    float ang = atan(p.y, p.x);           
    ang = ang / thetaMax * nRepeats * 2.; 

    ang += ring - thetaMax/nRepeats/3.5; // radial phase shift

    float phase = fract(ang);

    // Snake body mask
    float d = length(vec2(phase * 1.25, rf) - vec2(0.5)) - 0.5;

    vec3 col;
    if (d <= 0.0) {
        col = mix(
            vec3(0.825, 0.825, 0.0),   // yellow
            vec3(0.0, 0.399, 1.0),     // blue
            step(mod(ang + oddParity, 2.0), 1.0)
        );
    } else {
        col = mix(
            vec3(0.0),
            vec3(1.0),
            step(mod(ang + 0.535, 2.0), 1.0)
        );
    }
    return col;
}


/*
The coloring function.
*/

#define invRadSq invRad * invRad

vec3 tilingSample(vec2 pt) {
    // Remap point to screen and move it around
    vec2 z = (2. * pt - resolution) / scale;
    z = remapToDisk(z);

    if (dot(z, z) > 1.) return bgCol; // outside of the Poincare disk

    z = shift(z, mousePos);

    // Repeatedly invert and reflect until we are within the fundamental domain
    bool fund;
    float distSq, dotProd;
    vec2 diff;
    float n = 0.;

    float a = 0.;

    float col0 = 0.;
    float col1 = 0.;
    float col2 = 0.;
    float pol_col = 0.;
    

    for (int i = 0; i < nIterations; i ++) {
        fund = true;

        // Edge (polEdgeCenter-to-polVertex edge)
        diff = z - invCen;
        distSq = normSq(diff);
        if (distSq < invRadSq) {
            fund = false;
            z = invCen + (invRadSq * diff) / distSq;
            n ++;
            a++;
            pol_col++;
            col0++;
        }

        // Sectional line (polVertex-to-polCenter edge)
        dotProd = dot(z, refNrm);
        if (dotProd < 0.) {
            fund = false;
            z -= 2. * dotProd * refNrm;
            n ++;
            col1++;
        }

        // Edge bisector (polCenter-to-polEdgeCenter edge)
        if (z.y < 0.) {
            fund = false;
            z.y *= -1.;
            n ++;
            pol_col++;
            col2++;
        }
        
        if (fund) break; // We are in the fundamental domain; no need to keep going
    }
    
  
    // Distance to the tile edge
    float brt = 1.;
    float distToEdgeCircle01 = distance(z, newThickEdge01CircleCenter) - newThickEdge01CircleRadius;
    float distToEdgeCircle12 = distance(z, newThickEdge12CircleCenter) - newThickEdge12CircleRadius;
    float distToEdgeCircle20 = distance(z, newThickEdge20CircleCenter) - newThickEdge20CircleRadius;

    float distToTriV0 = distance(z, triV0EnlargedCircleCenter) - triV0EnlargedCircleRadius;
    float distToTriV1 = distance(z, triV1EnlargedCircleCenter) - triV1EnlargedCircleRadius;
    float distToTriV2 = distance(z, triV2EnlargedCircleCenter) - triV2EnlargedCircleRadius;
    float distToV0 = distance(z, V0EnlargedCircleCenter) - V0EnlargedCircleRadius;
    float distToV2 = distance(z, V2EnlargedCircleCenter) - V2EnlargedCircleRadius;

    if (doOrns) {
        if (isInsideTriangle(z, V0, D, E)) {
            if (!doInvVerts){
                return vertCol;
            } else {
                if (mod(col0, 4.) == 0.) {
                    return vertCol;
                } else {
                    return invVertCol;
                }
            }
        }
        if (isInsideTriangle(z, V1, D1, E1) || isInsideTriangle(z, V1, D1p, E1p)) {
            if (!doInvVerts){
                return vertCol;
            } else {
                if (mod(col1, 4.) == 0. || mod(col1, 4.) == 1. || mod(col1, 4.) == 2.) {
                    return vertCol;
                } else {
                    return invVertCol;
                }
            }
        }
        if (isInsideTriangle(z, V2, D2, E2)) {
            if (!doInvVerts){
                return vertCol;
            } else {
                return invVertCol;
                if (mod(col2, 3.) == 2. || mod(col2, 3.) == 1. ) {
                    return vertCol;
                } else {
                    return invVertCol;
                }
            }
        }
    }

    if (doVerts) {
        if (doV0V1 && doV1V2 && doV2V0 && 
            (distToTriV0 < 0.0 || distToTriV1 < 0.0 || distToTriV2 < 0.0)) {
            if (!doInvVerts){
                return vertCol;
            } else {
                if (mod(a, 2.) == 0.) {
                    return vertCol;
                } else {
                    return invVertCol;
                }
            }
        }
        else if (doV0V1 && doV1V2 && 
            (distToV0 < 0.0 || distToTriV1 < 0.0 || distToV2 < 0.0)) {
            if (!doInvVerts){
                return vertCol;
            } else {
                if (mod(a, 4.) == 0. || mod(a, 4.) == 1.) {
                    return vertCol;
                } else {
                    return invVertCol;
                }
            }
            }
        else if (doV1V2 && doV2V0 && 
            (distToV0 < 0.0 || distToTriV2 < 0.0)) return vertCol;
        else if (doV2V0 && doV0V1 && 
            (distToTriV0  < 0.0 || distToV2 < 0.0)) return vertCol;
        else if (doV0V1 && distToV0  < 0.0) {
            if (!doInvVerts){
                return vertCol;
            } else {
                if (mod(a, 4.) == 0. || mod(a, 4.) == 1.) {
                    return vertCol;
                } else {
                    return invVertCol;
                }
            }
        }
        else if (doV1V2 && distToV2  < 0.0) {
            if (!doInvVerts){
                return vertCol;
            } else {
                if (mod(a, 4.) == 0. || mod(a, 4.) == 1.) {
                    return vertCol;
                } else {
                    return invVertCol;
                }
            }
        } 
        else if (doV2V0 && (distToV0 < 0.0 || distToV2 < 0.0)) return vertCol;
    }

    if (doEdges) {
            if (doV0V1 && distToEdgeCircle01 < 0.0) {
                return edgeCol;
            }
            if (doV1V2 && distToEdgeCircle12 < 0.0) {
                return edgeCol;
            }
            if (doV2V0 && distToEdgeCircle20 < 0.0) {
                return edgeCol;
            }            
    } 

    // Show parity
    if (doParity)
        brt = min(brt, mix(1., mod(n, 2.), PARITY_COEFF));

    if (doInvPol) {
        if (mod(pol_col, 2.) == 1.) {
            return polygonCol;
        } else {
            return invPolygonCol;
        } 
    }

    if (doSnake) {
        float R0 = length(V1);  // since V0 = (0,0)
        float r  = length(z);

        // parity from reflections (illusion enhancement)
        float odd = mod(n, 2.0);

        // --- center selection ---
        if (r <= R0) {
            if (length(z) <= centerCutoff*R0) return bgCol;
            // Snake centered at V0
            return brt * rotatingSnakeColor(z, R0, odd, nRepeatPerSectV0, PI/pValue);
        } else {
            // Outside → re-center snake at V2
            z = shift(z, V2);
            vec3 tmp = brt * rotatingSnakeColor(z, R0, odd, nRepeatPerSectV2, PI/qValue);
            if (length(z) <= centerCutoff*R0) tmp = bgCol;
            z = shift(z, -V2);
            return tmp;
        }
    }

    // Coloring
    vec3 texCol = polygonCol;
    if (!doSolidColor) {
        float t = COLOR_COEFF * z.x - time;
        texCol = .5 + .5 * cos(6.283 * (t + vec3(0, .1, .2)));
    }

    return brt * texCol;
}

/*
Antialiasing and output.
*/

void main(void) {
    vec2 pt = gl_FragCoord.xy;

    // Antialiasing
    vec3 color;
    if (nSamples > 1) {
        vec2 diff;
        for (int i = 0; i < nSamples; i ++) {
            for (int j = 0; j < nSamples; j ++) {
                diff = vec2(
                    float(i) * invSamples - .5, 
                    float(j) * invSamples - .5);
                color += tilingSample(pt + diff);
            }
        }
        color *= invSamples * invSamples;
    } else {
        color = tilingSample(pt);
    }

    outputCol = vec4(color, 1.);
}