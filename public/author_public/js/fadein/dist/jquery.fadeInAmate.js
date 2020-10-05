/*
 *  jQuery FadeInAmate - v0.0.1
 *  A jQuery plugin that animates fading in page elements.
 *  https://github.com/jforaker/jQuery-FadeInAmate
 *
 *  Made by Jake Foraker
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var fadeInAmate = "fadeInAmate",
        defaults = {
            initialDelay: 250,
            fadeInSpeed: 900,
            animationDelay: 300,
            bounce: true
        };

    // The actual plugin constructor
    function FadeInAmate ( element, options ) {
        this.element = element;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = fadeInAmate;
        this.init();
    }

    FadeInAmate.prototype = {
        init: function () {

            var $faders = document.getElementsByClassName(this.element.className),
                fadersLength = $faders.length;

            $($faders).hide();

            this.showUs($faders, this.settings, fadersLength);

        },

        showUs: function (items, settings, number) {

            var that = this,
                opts = {
                    initialDelay: settings.initialDelay,
                    fadeInSpeed : settings.fadeInSpeed,
                    animationDelay: settings.animationDelay,
                    bounceTrue :  settings.bounce === true
                },
                num = number,
                runShowBounce = opts.bounceTrue;

            $.each(items, function(index, element){

                var $el = $(element),
                    delayTime = index === 0 ? opts.initialDelay : opts.initialDelay + (opts.animationDelay * index + num),
                    fadeInSpeed = opts.fadeInSpeed;

                $el.css({
                    position: "relative",
                    top: !opts.bounceTrue ? "0px" : -(($el.height() / index) / 5 ) + "px",
                    transition: "top 2s ease"
                });
                $el.fadeIn(fadeInSpeed).delay(delayTime);
            });

            if (runShowBounce) {
                that.bouncer(items, opts);
            }
        },

        bouncer: function(els, options){

            var interval = options.fadeInSpeed + options.initialDelay,
                index = 0,
                length = $(els).length;

            function getNext(){

                setTimeout(function() {
                    $(els[index]).css({top: "0px"});
                    index++;

                    if (index === length){
                        index = 0;
                    } else {
                        getNext();
                    }

                }, (interval / index));
            }

            getNext();
        }

    };

    // A really lightweight plugin wrapper around the constructor, preventing against multiple instantiations
    $.fn[ fadeInAmate ] = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + fadeInAmate ) ) {
                $.data( this, "plugin_" + fadeInAmate, new FadeInAmate( this, options ) );
            }
        });

        // chain jQuery functions
        return this;
    };

})( jQuery, window, document );
