
// color is a 3-entry array of base-ten numbers
// in both of the next 2 functions
function backToHex(color) {
    var hexColor = '', singleColor = '';
    for (var i = 0; i < 3; i++) {
        singleColor = parseInt(color[i], 10).toString(16);
        hexColor += (singleColor.length === 1) ? '0' : '';
        hexColor += singleColor;
    }
    return hexColor;
}
function realityCheck(color) {
    for (var i = 0; i < 3; i++) {
        color[i] = Math.max(0, Math.min(255, color[i]));
    }
    return color;
}

// RBGcolor is an array of integers 0-255
// returns array of values 0-360, 0-1, 0-1
function RGBtoHSL(RGBcolor) {
    var R = RGBcolor[0]/255, G = RGBcolor[1]/255, B = RGBcolor[2]/255;
    var H = 0, S = 0, L = 0;

    var M = Math.max(R,G,B);
    var m = Math.min(R,G,B);
    var C = M - m;

    // Find H
    if (C !== 0) {
        switch (M) {
            case R:
                H = ((G-B)/C);
                if (H < 0) { H = H + 6; }
                break;
            case G:
                H = ((B-R)/C) + 2;
                break;
            case B:
                H = ((R-G)/C) + 4;
                break;
        }
        H = 60 * H;
    }

    // Find L
    L = (M + m)/2;
    L = Math.max(0, Math.min(L, 1));

    // find S
    if (0 < L && L < 1) {
        // if L is exactly 0 or 1, S remains 0
        S = C/(1 - Math.abs(2*L - 1));
    }
    S = Math.max(0, Math.min(S, 1));

    var HSLcolor = [H,S,L];
    return HSLcolor;
}

// HSLcolor is an array of values 0-360, 0-1, 0-1
// returns array of integers 0-255
function HSLtoRGB(HSLcolor) {
    var H = HSLcolor[0], S = HSLcolor[1], L = HSLcolor[2];
    // find C from S and L
    var C = S * (1 - Math.abs(2*L - 1));
    // find m from C and L
    var m = L - C/2;
    // find H' from H
    var Hp = H / 60;
    // intermediate value X
    var X = C * (1 - Math.abs((Hp % 2) - 1));

    var R = 0, G = 0, B = 0;
    switch (Math.floor(Hp)) {
        case 0:
            R = C;
            G = X;
            break;
        case 1:
            R = X;
            G = C;
            break;
        case 2:
            G = C;
            B = X;
            break;
        case 3:
            G = X;
            B = C;
            break;
        case 4:
            R = X;
            B = C;
            break;
        case 5:
            R = C;
            B = X;
            break;
    }
    R = Math.round((m + R) * 255);
    G = Math.round((m + G) * 255);
    B = Math.round((m + B) * 255);
    return [R,G,B];
}

// assume color is an array of 3 integers 0-255
// and steps is an integer from 1 to 20
function findIntermediatesLinear(color, steps) {
    var HSLshades = [], RGBshades = [];
    // step 1: convert to HSL
    var HSL = RGBtoHSL(color);

    // step 2: step S toward 0 and L toward 1 
    var Sstep = HSL[1]/steps;
    var Lstep = (1 - HSL[2])/steps;

    for (var i = 0; i <= steps; i++) {
        HSLshades.push([HSL[0], HSL[1] - i*Sstep, HSL[2] + i*Lstep]);
    }

    // step 3: convert results back to RGB
    HSLshades.forEach(function(shade) {
        RGBshades.push(HSLtoRGB(shade));
    });

    return RGBshades;
}

// assume color is an array of 3 integers 0-255
// and steps is an integer from 1 to 20
function findIntermediates(color, steps) {
    var HSLshades = [], RGBshades = [];
    // step 1: convert to HSL
    var HSL = RGBtoHSL(color);

    // step 2: step S toward 0 and L toward 1 
    var Lstep = (1 - HSL[2])/steps;

    // but do S exponentially
    function Sstep(i) {
        if (HSL[1] === 0) { return 0; }
        var minSat = 0.05;
        if (HSL[1] < 0.55) {
            minSat = 0.01*HSL[1];
        }
        if (HSL[1] < 0.35) {
            minSat = 0.001*HSL[1];
        }
        var b = Math.pow(minSat, 1/steps)/HSL[1];
        return Math.min(HSL[1], Math.max(0, HSL[1] * Math.pow(b, i)));
    }
    
    for (var i = 0; i <= steps; i++) {
        HSLshades.push([HSL[0], Sstep(i), HSL[2] + i*Lstep]);
    }

    // step 3: convert results back to RGB
    HSLshades.forEach(function(shade) {
        RGBshades.push(HSLtoRGB(shade));
    });

    return RGBshades;
}

function extractHex(inputColor) {
    var convertedColor = [0,0,0];
    var matches = inputColor.match(/([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
    if (matches) {
        for (var i = 1; i <= 3; i++) {
            convertedColor[i-1] = parseInt(matches[i], 16);
        }
    } else {
        matches = inputColor.match(/([a-f\d])([a-f\d])([a-f\d])/i);
        if (matches) {
            for (var i = 1; i <= 3; i++) {
                convertedColor[i-1] = parseInt(matches[i], 16) + 16 * parseInt(matches[i], 16);
            }
        } else {
            console.log("Error: could not extract 3 or 6-digit hex color code from input.")
        }
    }
    return convertedColor;
}

// colorArray is an array of length-3 arrays of integers 0-255
function displayColors(colorArray, destination) {
    document.getElementById(destination).innerHTML = '';
    var hexCodes = [];
    colorArray.forEach(function(color) {
        hexCodes.push(backToHex(color));
    });
    hexCodes.forEach(function(color) {
        document.getElementById(destination).innerHTML += '<div class="cns-shade-preview"><div style="background:#' + color + ';"></div><div>#' + color.toUpperCase() + '</div></div>';
    });
}

function handleInput() {
    var color = extractHex(document.getElementById('cns-color-input').value);
    var steps = parseInt(document.getElementById('cns-steps-input').value, 10);
    steps = Math.max(1, Math.min(20, steps)) + 1;
    if (document.getElementById('cns-linear-scale').checked) {
        displayColors(findIntermediatesLinear(color, steps), 'cns-linear-shades-preview');
    }
    displayColors(findIntermediates(color, steps), 'cns-shades-preview');
    return false;
}

(function () {
    // start it up!
    var container = document.getElementById('cns-container');
    var css = '<style>.cns-color-form {margin: 12px;} .cns-color-form label {display: block; line-height: 1.5;} .cns-color-form button {margin: 12px 25px;} .cns-shade-preview {display: inline-block; position: relative; width: 5.5em; text-align: center;} .cns-shade-preview div:first-child {padding: 20px; width: 100%; box-sizing: border-box;}</style>';
    var html = '<form class="cns-color-form" id="cns-color-form">';
    html += '<label for="cns-color-input">Color, in 3- or 6-digit hex RGB: <input type="text" id="cns-color-input"></label>';
    html += '<label for="cns-steps-input">Number of intermediate shades (1-20): <input type="text" id="cns-steps-input"></label>';
    html += '<label for="cns-linear-scale"><input id="cns-linear-scale" type="checkbox">Also include linear saturation scale (appears second)</label>';
    html +='<button type="submit">Compute Shades</button></form>';
    html += '<div id="cns-shades-preview"></div><div id="cns-linear-shades-preview"></div>';
    container.innerHTML = css + html;
    document.getElementById('cns-color-form').onsubmit = function(e) {
        e.preventDefault();
        handleInput();
    };
})();
