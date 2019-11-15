#!/bin/bash
(
    cd front/css
    [ -f pure-min.css ] || ln -s ../../node_modules/purecss/build/pure-min.css .
    [ -f grids-responsive-min.css ] || ln -s ../../node_modules/purecss/build/grids-responsive-min.css .
)
(
    cd front/js
    [ -f vue.esm.browser.js ] || ln -s ../../node_modules/vue/dist/vue.esm.browser.js .
    [ -f moment.min.js ] || ln -s ../../node_modules/moment/min/moment.min.js .
)

