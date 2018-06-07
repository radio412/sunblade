# sunblade



This is a quick and working, but unfinished project to show an efficient 4 port display of a single scene with individual controls.

A date/time controller is implemented via moment.js: https://momentjs.com/

The sun position then uses the date/time to position the sun in the scene using suncalc.js: https://github.com/mourner/suncalc

Built using Three alpha 0.87: https://threejs.org/

If you have a WebGL enabled browser, see it working: https://radio412.github.io/sunblade/index.html

The example uses the latitude and longitude of Chicago. Change this in js/project_scripts/kansas.js: https://github.com/radio412/sunblade/blob/master/js/project_scripts/kansas.js

Code layout:

*oz.js: My own boiler-plate for creating a time and location enabled Three.js environment. It's super easy to use. See kansas.js for an example. Oz uses moment, three.js and suncalc.js to do its thing.
*Kansas.js: Implements Oz.js to create a time and location based world. 
*tin.js: I'm just sick of HTML frameworks. Use whatever floats your boat. or div. whatever.
*index.html: duh
*main.css: duh

![](https://radio412.github.io/sunblade/media/shogun.png)


