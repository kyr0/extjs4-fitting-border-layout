/**
 * @class Ext.ux.layout.container.FittingBorder
 * @extend Ext.layout.container.Border
 * @author Aron Homberg <info@aron-homberg.de>
 * @license WTFNPL License, see: license.txt
 *
 * A border layout that just grows it's owner containers
 * height in all cases the center region would display a scroll bar.
 *
 *     layout: {
            type: 'fittingborder',
            noShrink: false
       },
 */
Ext.define('Ext.ux.layout.container.FittingBorder', {
    extend: 'Ext.layout.container.Border',
    alias: 'layout.fittingborder',

    /**
     * @cfg {Boolean} noShrink If enabled, the center, west and east regions grow but never shrink
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

                me.maintainOwnerRelayout();

                clearTimeout(waitForCenter);
            }

        }, 50);
    },

    maintainOwnerRelayout: function() {

        var me = this,
            layoutItems = me.getLayoutItems(),
            layoutItemsCnt = layoutItems.length,
            ownerDockedItems = me.owner.getDockedItems(),
            regionHeightGaps = {}, i,
            fullHeight = 0, fullRegionHeight = 0,
            regionName, lastMaxMiddleHeight = 0,
            dockedItemsHeightGap = 0,
            maintainHeight = function() {

                fullHeight = 0;

                for (i=0; i<layoutItemsCnt; i++) {

                    if (layoutItems[i].region) {

                        regionName = layoutItems[i].region;

                        fullRegionHeight =
                            me.getFullScrollHeight(layoutItems[i]) + regionHeightGaps[regionName];

                        //console.log( regionName + ': ' + fullRegionHeight);

                        if (regionName.toLowerCase() === 'north' ||
                            regionName.toLowerCase() === 'south') {
                            fullHeight += fullRegionHeight;
                        } else {
                            if (fullRegionHeight > lastMaxMiddleHeight) {
                                lastMaxMiddleHeight = fullRegionHeight;
                            }
                        }
                    }
                }
                fullHeight += lastMaxMiddleHeight;
                fullHeight += dockedItemsHeightGap;

                //console.log('Maintained new owner height:' + fullHeight + ' ? ' + me.owner.getHeight());

                if (me.noShrink && (fullHeight > me.owner.getHeight())) {

                    me.owner.setHeight(fullHeight);

                } else if (fullHeight !== me.owner.getHeight()) {

                    me.owner.setHeight(fullHeight);
                }
           };

        // Calculate height gaps between different calc models initially
        for (i=0; i<layoutItemsCnt; i++) {

            if (layoutItems[i].region) {

                regionHeightGaps[layoutItems[i].region] =
                    layoutItems[i].getHeight() - me.getFullScrollHeight(layoutItems[i]);
            }
        }

        // Calculate height gap of docked items
        for (i=0; i<ownerDockedItems.length; i++) {

            if (ownerDockedItems[i].dock &&
                (ownerDockedItems[i].dock === 'top' || ownerDockedItems[i].dock === 'bottom')
            ) {
                dockedItemsHeightGap += ownerDockedItems[i].getHeight();
            }
        }

        // On center or owner container re-layout, maintain height
        me.owner.on('afterlayout', maintainHeight);
        me.centerRegion.on('afterlayout', maintainHeight);
    },

    getFullScrollHeight: function(cmp) {

        var scrollHeight = 0,
            firstCmpChild;

        if (cmp && cmp.body && cmp.body.dom) {
            scrollHeight = cmp.body.dom.scrollHeight;
        }

        firstCmpChild = cmp.body.first();

        if (firstCmpChild && firstCmpChild.dom) {

            if (firstCmpChild.dom.scrollHeight > scrollHeight) {
                scrollHeight = firstCmpChild.dom.scrollHeight;
            }
        }
        return scrollHeight;
    }
});