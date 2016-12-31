// WCAG Terminal Color Scheme Checker
//
// Outputs contrast values between colors in a 
// supplied color scheme against it's own
// background and foreground colors.
//
// Information of contrast tests:
// http://accessibility.psu.edu/color/contrasthtml/
//
// Example:
// node index.js filename

// Node.js requires
var FS = require('fs');
var Util = require('util');

var Color = require('color');

// Minimum values for contrast categories
var minimums = {
    aaLarge: 3,
    aa: 4.5,
    aaaLarge: 4.5,
    aaa: 7
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

// Read file contents from argument
var args = process.argv.slice(2);
var file = args[0];
FS.readFile(file, 'utf8', function(err, data) {
    if (err)
        throw err;

    // Save all matches of color codes
    var invertRegex = new RegExp(".*\\*reverseVideo.*true", "gi");
    var invertColors = invertRegex.exec(data);
    var baseColors = [];
    var bgRegex = new RegExp(".*\\*background.*(#[0-9a-f]{6})", "gi");
    var fgRegex = new RegExp(".*\\*foreground.*(#[0-9a-f]{6})", "gi");
    baseColors.push({
        name: "Background",
        match: (invertColors) ? fgRegex.exec(data) : bgRegex.exec(data)
    });
    baseColors.push({
        name: "Foreground",
        match: (invertColors) ? bgRegex.exec(data) : fgRegex.exec(data)
    });
    var regex = new RegExp(".*\\*(color[0-9]+).*(#[0-9a-f]{6})", "gi");
    var match;
    var matches = [];
    while ((match = regex.exec(data))) {
        matches.push(match);
    }

    var extractContrastsForBaseColor = function(base, matches) {
        console.log(base.name + " color: " + base.match[1]);
        console.log("Contrast ratings:");
        matches.forEach(function(match) {
            var results = extractContrasts([base.match[1], match[2]]);
            var resultsString = "  " + match[1];
            while (resultsString.length < (2 + 9)) {
                resultsString += " ";
            }
            resultsString += match[2];
            while (resultsString.length < (2 + 8 + 9)) {
                resultsString += " ";
            }
            resultsString += results[1].combinations[0].accessibility;
            while (resultsString.length < (2 + 8 + 9 + 9)) {
                resultsString += " ";
            }
            resultsString += results[1].combinations[0].contrast.toFixed(4);
            console.log(resultsString);
        });
    };

    baseColors.forEach(function(base) {
        extractContrastsForBaseColor(base, matches);
    });
});
