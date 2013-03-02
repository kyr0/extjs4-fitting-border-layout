/**
 * @class Ext.ux.layout.container.FittingBorder
 * @extend Ext.layout.container.Border
 * @author Aron Homberg <info@aron-homberg.de>
 * @license WTFPL License, see: license.txt
 *
 * A border layout that just grows it's owner containers
 * height in all cases the center region would display a scroll bar.
 *
 *     layout: {
            type: 'fittingborder',

            // If noShrink is enabled, it grows but never shrinks again!
            noShrink: false
       },
 */
Ext.define('Ext.ux.layout.container.FittingBorder', {
    extend: 'Ext.layout.container.Border',
    alias: 'layout.fittingborder',

    /**
     * @cfg {Boolean} noShrink If enabled, the center region grows but never shrinks back
     */
    noShrink: false,

    constructor: function() {

        var me = this;
        me.callParent(arguments);

        me.waitForCenterRegion();
    },

    waitForCenterRegion: function() {

        var me = this,
            waitForCenter = setInterval(function() {

            if (me.centerRegion &&
                me.centerRegion.body &&
                me.centerRegion.body.dom) {

                me.listenToCenterRelayout();

                clearTimeout(waitForCenter);
            }

        }, 50);
    },

    listenToCenterRelayout: function() {

        var me = this,
            lastScrollHeight = me.centerRegion.body.dom.scrollHeight;

        me.centerRegion.on('afterlayout', function(centerRegion) {

            if (centerRegion && centerRegion.body && centerRegion.body.dom) {

                if (lastScrollHeight !== centerRegion.body.dom.scrollHeight) {

                    // Cache last scroll height change
                    lastScrollHeight = centerRegion.body.dom.scrollHeight;

                    me.fitToCenter(centerRegion.body.dom.scrollHeight);
                }
            }
        });
    },

    fitToCenter: function(centerRegionRealHeight) {

        var me = this,
            centerHeightGap = centerRegionRealHeight - me.centerRegion.getHeight(),
            fitOwnerHeight = function(heightGap) {
                me.owner.setHeight(
                    me.owner.getHeight() + heightGap
                );
            };

        if (me.noShrink) {
            if (centerHeightGap > 0) {
                fitOwnerHeight(centerHeightGap);
            }
        } else {
            fitOwnerHeight(centerHeightGap);
        }
    }
});