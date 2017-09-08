// WCAG Terminal Color Scheme Checker
//
// Outputs contrast values between colors in a 
// supplied color scheme against it's own
// background and foreground colors.
//
// Information of contrast tests:
// http://accessibility.psu.edu/color/contrasthtml/
//
// Usage:
// node index.js file

// Node.js requires
var FS = require('fs');
var Util = require('util');

var Color = require('color');
var Colors = require('colors/safe');

// Minimum values for contrast categories
var minimums = {
    aaLarge: 3,
    aa: 4.5,
    aaa: 7
};

var colorCodes = {
    0: 'black',
    1: 'red',
    2: 'green',
    3: 'yellow',
    4: 'blue',
    5: 'magenta',
    6: 'cyan',
    7: 'white',
    8: 'black',
    9: 'red',
    10: 'green',
    11: 'yellow',
    12: 'blue',
    13: 'magenta',
    14: 'cyan',
    15: 'white'
};

var extractContrasts = function(colors) {
    'use strict';

    var arr = [];
    var results = [];
    var combinations = [];

    colors.forEach(function(color) {
        arr.push(Color(color));
    });

    arr.forEach(function(color) {
        var result = {};
        result.hex = color.hexString();
        result.combinations = [];
        arr.forEach(function(bg) {
            if (color === bg) {
                return false;
            }
            var combination = {};
            combination.hex = bg.hexString();
            combination.contrast = color.contrast(bg);
            combination.accessibility =
                (combination.contrast >= minimums.aaa) ?
                    "AAA" :
                (combination.contrast >= minimums.aa) ?
                    "AA" :
                (combination.contrast >= minimums.aaLarge) ?
                    "AA Large" :
                    "Fail";
            if (combination.contrast > 0) {
                result.combinations.push(combination);
            }
        });
        results.push(result);
    });

    return results;
};

var arrayObjectIndexOf = function(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

var toUpperCaseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Read file contents from argument
var args = process.argv.slice(2);
var file = args[0];
FS.readFile(file, 'utf8', function(err, data) {
    if (err)
        throw err;

    // Save all matches of color codes
    var invertRegex = new RegExp(".*\\*reverseVideo.*true", "gi");
    var invertColors = invertRegex.exec(data);
    var bgRegex = new RegExp(".*\\*background.*(#[0-9a-f]{6})", "gi");
    var fgRegex = new RegExp(".*\\*foreground.*(#[0-9a-f]{6})", "gi");
    var bgResult = {
        name: "Background",
        match: (invertColors) ? fgRegex.exec(data) : bgRegex.exec(data)
    };
    var fgResult = {
        name: "Foreground",
        match: (invertColors) ? bgRegex.exec(data) : fgRegex.exec(data)
    };
    var regex = new RegExp(".*\\*(color[0-9]+).*(#[0-9a-f]{6})", "gi");
    var match;
    var matches = [];
    while ((match = regex.exec(data))) {
        matches.push(match);
    }

    var extractContrastsForBaseColor = function(base, fgBase, matches) {
        console.log(base.name + " color: " + base.match[1]);
        console.log("Contrast ratings:");
        matches.forEach(function(match) {
            var results = extractContrasts([base.match[1], match[2]]);

            // Use a fg color with good contrast
            var regex = new RegExp('color', 'gi');
            var colorCode = match[1].replace(regex, '');
            var colorName = colorCodes[colorCode];
            var fgContrast = Color(fgBase.match[1])
                .contrast(Color(match[2]));
            var fgName = (fgContrast >= minimums.aaLarge) ?
                ((invertColors) ? 'white' : 'black') :
                ((invertColors) ? 'black' : 'white');
            if (colorName === 'black' && invertColors) {
                fgName = 'white';
            } else if (colorName === 'white' && invertColors) {
                fgName = 'black';
            }
            var text = match[1]
            while (text.length < 8) {
                text += " ";
            }
            var coloredName = Colors
                ['bg' + toUpperCaseFirstLetter(colorName)]
                [fgName]
                (text);

            // Build results
            var resultsString = "  " + coloredName;
            var escapeCodesLength = coloredName.length - text.length;
            var resultsTextLength = resultsString.length - escapeCodesLength;
            var spacing = 3;
            while (resultsTextLength < (text.length + spacing)) {
                resultsString += " ";
                resultsTextLength++;
            }
            oldResultsStringLength = resultsString.length;
            resultsString += match[2];
            resultsTextLength += resultsString.length - oldResultsStringLength;
            spacing++;
            while (resultsTextLength < (text.length + spacing + 7)) {
                resultsString += " ";
                resultsTextLength++;
            }
            oldResultsStringLength = resultsString.length;
            resultsString += results[1].combinations[0].accessibility;
            resultsTextLength += resultsString.length - oldResultsStringLength;
            spacing++;
            while (resultsTextLength < (text.length + spacing + 7 + 8)) {
                resultsString += " ";
                resultsTextLength++;
            }
            if (results[1].combinations[0].contrast.toFixed(4) < 10)
                resultsString += " ";
            resultsString += results[1].combinations[0].contrast.toFixed(4);
            console.log(resultsString);
        });
    };

    extractContrastsForBaseColor(bgResult, fgResult, matches);
    extractContrastsForBaseColor(fgResult, fgResult, matches);
});
