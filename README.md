# WCAG-Terminal-Checker

Outputs contrast values between colors in a supplied color scheme against it's own background and foreground colors.

Information of contrast tests: http://accessibility.psu.edu/color/contrasthtml/

## Requirements

All dependencies are provided, you only need [Node.js](https://nodejs.org/) to run the script.

## Example

Output for the classic xterm color scheme:

```
$ node index.js xterm

Background color: #000000
Contrast ratings:
  color0   #000000 Fail     1.0000
  color8   #666666 AA Large 3.6574
  color1   #990000 Fail     2.3545
  color9   #e50000 AA Large 4.3316
  color2   #00a600 AA       6.4545
  color10  #00d900 AAA      10.9251
  color3   #999900 AA       6.9110
  color11  #e5e500 AAA      15.5393
  color4   #0000b2 Fail     1.6429
  color12  #0000ff Fail     2.4440
  color5   #b200b2 AA Large 3.5359
  color13  #e500e5 AA       5.4630
  color6   #00a6b2 AAA      7.0974
  color14  #00e5e5 AAA      13.3392
  color7   #e5e5e5 AAA      16.6708
  color15  #bfbfbf AAA      11.4199
Foreground color: #ffffff
Contrast ratings:
  color0   #000000 AAA      21.0000
  color8   #666666 AA       5.7418
  color1   #990000 AAA      8.9192
  color9   #e50000 AA       4.8481
  color2   #00a600 AA Large 3.2536
  color10  #00d900 Fail     1.9222
  color3   #999900 AA Large 3.0387
  color11  #e5e500 Fail     1.3514
  color4   #0000b2 AAA      12.7825
  color12  #0000ff AAA      8.5925
  color5   #b200b2 AA       5.9391
  color13  #e500e5 AA Large 3.8440
  color6   #00a6b2 Fail     2.9588
  color14  #00e5e5 Fail     1.5743
  color7   #e5e5e5 Fail     1.2597
  color15  #bfbfbf Fail     1.8389
```
