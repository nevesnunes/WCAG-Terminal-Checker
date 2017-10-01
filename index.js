// WCAG Terminal Color Scheme Checker
//
// Outputs contrast values between colors in a 
// Xresources color scheme against it's
// background and foreground colors.
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

var toUpperCaseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

var extractColorCode = function(match, definitions) {
    var matchIndex = 2;
    if (!match) {
        return match;
    }
    if (!match[2]) {
        matchIndex = 1;
    }

    // Translate colors formatted as rgb:rr/gg/bb
    var formatRegex = new RegExp("rgb:([0-9a-f]{2})/([0-9a-f]{2})/([0-9a-f]{2})");
    var formatMatch = formatRegex.exec(match[matchIndex]);
    if (formatMatch) {
        match[matchIndex] = "#" + 
            formatMatch[1] + formatMatch[2] + formatMatch[3];
    }

    // Translate definitions
    var definitionOptions = Object.keys(definitions).join("|");
    var definitionRegex = new RegExp(".*\(" + definitionOptions  + "\)");
    if (definitionRegex.test(match[matchIndex]) && 
            definitions[match[matchIndex]]) {
        match[matchIndex] = definitions[match[matchIndex]];
    }

    return match;
};

// Read file contents from argument
var args = process.argv.slice(2);
var file = args[0];
FS.readFile(file, 'utf8', function(err, data) {
    if (err)
        throw err;

    // Save definitions
    var defineRegex = new RegExp("[^!]\\s*#define\\s*([a-zA-Z0-9_-]+)\\s*(#[0-9a-f]{6})", "gi");
    var match;
    var definitions = {};
    while ((match = defineRegex.exec(data))) {
        definitions[match[1]] = match[2];
    }

    // Save all matches of color codes
    var invertRegex = new RegExp("[^!].*\\*reverseVideo.*true", "gi");
    var invertColors = invertRegex.exec(data);
    var bgRegex = new RegExp("[^!].*\\*background[^#a-zA-Z0-9_-]*([#a-zA-Z0-9:/_-]+)", "gi");
    var fgRegex = new RegExp("[^!].*\\*foreground[^#a-zA-Z0-9_-]*([#a-zA-Z0-9:/_-]+)", "gi");
    var bgResult = {
        name: "Background",
        match: (invertColors) ? 
            extractColorCode(fgRegex.exec(data), definitions) : 
            extractColorCode(bgRegex.exec(data), definitions)
    };
    var fgResult = {
        name: "Foreground",
        match: (invertColors) ? 
            extractColorCode(bgRegex.exec(data), definitions) : 
            extractColorCode(fgRegex.exec(data), definitions)
    };

    var regex = new RegExp("[^!].*\\*(color[0-9]+)[^#a-zA-Z0-9_-]*([#a-zA-Z0-9:/_-]+)", "gi");
    var matches = [];
    while ((match = regex.exec(data))) {
        matches.push(extractColorCode(match, definitions));
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
            var fgContrast = Color(fgBase.match[1]).contrast(Color(match[2]));
            var fgName = (fgContrast >= minimums.aaLarge) ?
                'white' :
                'black';
            if (colorName === 'black') {
                fgName = 'white';
            } else if (colorName === 'white') {
                fgName = 'black';
            }
            var text = match[1];
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
    console.log('');
});
