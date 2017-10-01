# WCAG-Terminal-Checker

Outputs contrast values between colors in a Xresources color scheme against it's background and foreground colors.

Information of contrast tests: http://accessibility.psu.edu/color/contrasthtml/

## Requirements

All dependencies are provided, you only need [Node.js](https://nodejs.org/) to run the script.

## Usage

```
node index.js file
```

## Examples

**Xterm**:

![](xterm.png)

Notice how the blue color fails the contrast test against the black background. This matches with the general difficulty in reading blue text with this theme.

**Tango**:

![](tango.png)

**Solarized Light**:

![](solarized.png)
