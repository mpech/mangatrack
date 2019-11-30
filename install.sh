#!/bin/bash
(
    cd front/css/vendors
    [ -f pure-min.css ] || ln -s ../../../node_modules/purecss/build/pure-min.css .
    [ -f grids-responsive-min.css ] || ln -s ../../../node_modules/purecss/build/grids-responsive-min.css .
)
(
    cd front/js/vendors
    [ -f vue.esm.browser.min.js ] || ln -s ../../../node_modules/vue/dist/vue.esm.browser.min.js .
    [ -f vue-router.esm.browser.min.js ] || ln -s ../../../node_modules/vue-router/dist/vue-router.esm.browser.min.js .
    [ -f vuex.esm.browser.min.js ] || ln -s ../../../node_modules/vuex/dist/vuex.esm.browser.min.js .
)

