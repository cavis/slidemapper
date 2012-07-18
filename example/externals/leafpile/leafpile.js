/* ==========================================================
 * leafpile.js v0.1.1
 * A marker clustering layer for Leaflet maps
 * http://github.com/cavis/leafpile
 * ==========================================================
 * Copyright (c) 2012 Ryan Cavis
 * Licensed under http://en.wikipedia.org/wiki/MIT_License
 * ========================================================== */


/* ==========================================================
 * L.Leafpile
 *
 * A layer used to cluster markers together into geographical
 * groups based on screen spacing, updating with every zoom level.
 * ========================================================== */
L.Leafpile = L.Class.extend({

    includes: L.Mixin.Events,

    /* ========================================
     * Configuration Options
     * ======================================== */

    options: {
        radius:        60,
        maxZoomChange: 2,
        maxZoomLevel:  8,
        autoEnable:    true,
        singlePiles:   false
    },

    /* ========================================
     * Public Methods
     * ======================================== */

    // add a marker
    addMarker: function(mark) {
        var id = L.Util.stamp(mark);
        this._markers[id] = mark;
        if (!this._map) return this;

        // add to map or pile
        if (this._enabled) {
            this._pileMarker(mark);
        }
        else {
            this._map.addLayer(mark);
        }
        return this;
    },

    // add a layer ... fails for non-markers
    addLayer: function(layer) {
        if (layer instanceof L.Marker) return this.addMarker(layer);
        throw new Error('Sorry, but L.Leafpile can only hold markers right now.');
    },

    // get markers from the map
    getMarkers: function() {
        var marks = [];
        for (var i in this._markers) marks.push(this._markers[i]);
        return marks;
    },

    // remove a marker
    removeMarker: function(mark) {
        var id = L.Util.stamp(mark);
        delete this._markers[id];
        if (!this._map) return this;

        // remove from map or pile
        if (this._enabled) {
            for (var i in this._leafpiles) {
                if (this._leafpiles[i].hasMarker(mark)) {
                    this._leafpiles[i].removeMarker(mark);
                }
            }
        }
        else {
            this._map.removeLayer(mark);
        }
        return this;
    },

    // add a layer ... fails for non-markers
    removeLayer: function(layer) {
        if (layer instanceof L.Marker) return this.removeMarker(layer);
        throw new Error('Sorry, but L.Leafpile can only hold markers right now.');
    },

    // change the radius of the groupings
    setRadius: function(radius) {
        if (radius == 0) return this.disable();
        this.options.radius = radius;
        if (!this._map) return this;

        // check zoom level - don't auto-enable if too zoomed
        if (this._map.getZoom() > this.options.maxZoomLevel) return false;

        // clear the map
        if (this._enabled) {
            this._iteratePiles(this._map.removeLayer, this._map);
            this._iterateMarkers(this._map.removeLayer, this._map);
            this._leafpiles = {};
        }
        else {
            this._iterateMarkers(this._map.removeLayer, this._map);
        }

        // regroup the piles
        this._iterateMarkers(this._pileMarker, this);
        this._enabled = true;
        return this;
    },

    // clear all markers/piles
    clear: function() {
        this._iteratePiles(this._map.removeLayer, this._map);
        this._iterateMarkers(this._map.removeLayer, this._map);
        this._leafpiles = {};
        this._markers = {};
        return this;
    },

    // enable the grouping of markers in this layer
    enable: function() {
        if (!this._enabled) {
            this._enabled = true;
            if (!this._map) return this;

            // check zoom level
            if (this._map.getZoom() > this.options.maxZoomLevel) return false;
            this._zoomDisabledMe = false;

            // remove markers, add piles
            this._iterateMarkers(this._map.removeLayer, this._map);
            this._iterateMarkers(this._pileMarker, this);
        }
        return this;
    },

    // disable grouping of markers in this layer
    disable: function() {
        if (this._enabled) {
            this._enabled = false;
            this._zoomDisabledMe = false;
            if (!this._map) return this;

            // remove piles, add markers
            this._iteratePiles(this._map.removeLayer, this._map);
            this._leafpiles = {};
            this._iterateMarkers(this._map.addLayer, this._map);
        }
        return true;
    },

    /* ========================================
     * Private Methods
     * ======================================== */

    // setup structs
    initialize: function(options) {
        L.Util.setOptions(this, options);
        this._markers = {};
        this._leafpiles = {};
        this._enabled = this.options.autoEnable;
    },

    // setup event handlers on map add
    onAdd: function(map) {
        this._map = map;
        this._map.on('zoomend', this._onZoomEnd, this);
        if (map.getZoom() > this.options.maxZoomLevel) {
            this._enabled = false;
            this._zoomDisabledMe = true;
        }

        // re-add markers (will not double-add since they're stamped)
        this._iterateMarkers(this.addMarker, this);
        return this;
    },

    // remove all on map remove
    onRemove: function(map) {
        this.clear();
        this._map = null;
    },

    _onZoomEnd: function(e) {
        var zoom = this._map.getZoom();

        // check against max zoom level
        if (this._enabled && zoom > this.options.maxZoomLevel) {
            this.disable();
            this._zoomDisabledMe = true;
        }
        else if (zoom <= this.options.maxZoomLevel && this._zoomDisabledMe) {
            this.enable();
        }
        else if (this._enabled) {
            this._iteratePiles(this._map.removeLayer, this._map);
            this._iterateMarkers(this._map.removeLayer, this._map);
            this._leafpiles = {};
            this._iterateMarkers(this._pileMarker, this);
        }
    },

    _onPileClick: function(e) {
        this.fire('leafpileclick', {
            leafpile:   e.target,
            markers:    e.markers,
            zooming:    (e.markers.length > 1),
            cancelZoom: function() { e.cancel = true; }
        });
        if (e.cancel === true) return;

        // zoom in when multiple are clicked
        if (e.markers.length > 1 || this.options.singlePiles) {
            var all = [];
            for (var i=0; i<e.markers.length; i++) {
                all.push(e.markers[i].getLatLng());
            }
            var bnds = new L.LatLngBounds(all);
            var zoom = Math.min(this._map.getBoundsZoom(bnds),
                this._map.getZoom() + this.options.maxZoomChange);
            this._map.setView(bnds.getCenter(), zoom);
        }
    },

    // put a marker into a leafpile
    _pileMarker: function(mark) {
        var point = this._map.latLngToLayerPoint(mark.getLatLng()),
            pile = null, leastDistance = null;
        for (var i in this._leafpiles) {
            var dist = this._leafpiles[i].inBounds(point);
            if (dist !== false && (!pile || dist < leastDistance)) {
                pile = this._leafpiles[i];
                leastDistance = dist;
            }
        }

        // add or create
        if (pile) {
            pile.addMarker(mark);
        }
        else {
            pile = new L.Leafpile.Marker(mark, this._map, {
                radius:      this.options.radius,
                singlePiles: this.options.singlePiles
            });
            var id = L.Util.stamp(pile);
            this._leafpiles[id] = pile;
            this._leafpiles[id].on('click', this._onPileClick, this);
        }
        return this;
    },

    // helper to iterate over markers
    _iterateMarkers: function(method, context) {
        for (var i in this._markers) {
            if (this._markers.hasOwnProperty(i)) {
                method.call(context, this._markers[i]);
            }
        }
    },

    // helper to iterate over piles
    _iteratePiles: function(method, context) {
        for (var i in this._leafpiles) {
            if (this._leafpiles.hasOwnProperty(i)) {
                method.call(context, this._leafpiles[i]);
            }
        }
    }
});


/* ==========================================================
 * L.Leafpile.Icon
 *
 * An icon used for the leafpile marker
 * ========================================================== */
L.Leafpile.Icon = L.Icon.extend({
    options: {
        size: null
    },

    // private style - includes base64 png icons
    _sizeOptions: {
        1: {
            image: 'iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAMAAADzN3VRAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADNQTFRFAAAA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA/5kA8jf0CQAAABB0Uk5TABAgMEBQYHCAj5+vv8/f7yMagooAAACJSURBVHjapZFJDsMgDEVraKAeCr7/aUsIyMJJNulfWIgnT9+vfxQyYxTO4P6BtCnvgRYWq+6SHmt0wGQIBjA0C6J60UhpT580ct7iAELogLSsoMxyLuOY/zHhC8KdpAuS7vZRuPMAp29tgWHd8ShgXn9tjM9yhhCqubnF5aZ46mEssYhQai2e6wcf9hSNzav/NAAAAABJRU5ErkJggg==',
            iconSize: new L.Point(25, 25),
            iconAnchor: new L.Point(12, 12),
            popupAnchor: new L.Point(0, -8),
            shadowSize: null
        },
        2: {
            image: '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',
            iconSize: new L.Point(55, 55),
            iconAnchor: new L.Point(27, 27),
            popupAnchor: new L.Point(0, -14),
            shadowSize: null
        },
        10: {
            image: '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',
            iconSize: new L.Point(65, 65),
            iconAnchor: new L.Point(32, 32),
            popupAnchor: new L.Point(0, -18),
            shadowSize: null
        },
        20: {
            image: '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',
            iconSize: new L.Point(75, 75),
            iconAnchor: new L.Point(37, 37),
            popupAnchor: new L.Point(0, -22),
            shadowSize: null
        }
    },

    // setup options
    initialize: function(size) {
        this._setPileOptions(size || 1);
    },

    // update the size of an existing pile
    update: function(size, div) {
        this._setPileOptions(size);
        this._setIconStyles(div, size)
    },

    // make a new icon
    createIcon: function() {
        var div = document.createElement('div');
        this._setIconStyles(div);
        return div;
    },

    // no shadows
    createShadow: function() {
        return null; // TODO: something else?
    },

    // change inline styles based on leafpile size
    _setPileOptions: function(size) {
        for (var i in this._sizeOptions) {
            if (size <= i) {
                this.options = this._sizeOptions[i];
                break;
            }
        }
    },

    // set some inline styles for the leafpile icon
    _setIconStyles: function(div, size) {
        L.Icon.prototype._setIconStyles.call(this, div, 'icon');
        div.style['cursor'] = 'pointer';
        div.style['background'] = 'url(data:image/png;base64,'+this.options.image+') no-repeat 0 0';
        div.style['text-align'] = 'center';
        div.style['font-size'] = '12px';
        div.style['font-weight'] = 'bold';
        div.style['color'] = '#fff';
        div.style['line-height'] = this.options.iconSize.y+'px';
        div.innerHTML = size;
    }
});


/* ==========================================================
 * L.Leafpile.Marker
 *
 * A marker representing a clustering of other markers
 * ========================================================== */
L.Leafpile.Marker = L.Marker.extend({

    options: {
        radius:      60,
        singlePiles: false
    },

    // setup - requires a marker
    initialize: function(mark, map, options) {
        L.Util.setOptions(this, options);
        this.options.icon = new L.Leafpile.Icon(1);
        this._map = map;

        // setup markers
        var id = L.Util.stamp(mark);
        this._markers = {};
        this._markers[id] = mark;
        mark._leafpile = this;
        L.Util.extend(mark, {openPopup: this._openMemberMarkerPopup});

        // set cluster center
        this._latlng = mark.getLatLng();
        this._center = this._map.latLngToLayerPoint(this._latlng);

        // add something to the map
        if (this.options.singlePiles) {
            this._map.addLayer(this);
            this.options.icon.update(1, this._icon);
        }
        else {
            this._map.addLayer(mark);
        }
    },

    // make sure to cleanup single markers too
    onRemove: function(map) {
        if (!this.options.singlePiles && this.size() == 1) {
            this._map.removeLayer(this.first());
        }

        // default marker stuff
        this._removeIcon();
        if (this.closePopup) this.closePopup();
        map.off('viewreset', this._reset, this);
    },


    // calculate if a point is within the bounds of the pile
    inBounds: function(point) {
        var dist = this._center.distanceTo(point);
        return (dist < this.options.radius ? dist : false);
    },

    // add a marker to the pile
    addMarker: function(mark) {
        if (!this.options.singlePiles && this.size() == 1) {
            this._map.removeLayer(this.first());
            this._map.addLayer(this);
        }

        var id = L.Util.stamp(mark);
        this._markers[id] = mark;
        mark._leafpile = this;
        var weight = this.size();
        this.options.icon.update(weight, this._icon);

        // weighted average the point location
        var point = this._map.latLngToLayerPoint(mark.getLatLng());
        this._center = new L.Point(
            (this._center.x * (weight-1) + point.x) / weight,
            (this._center.y * (weight-1) + point.y) / weight
        );
        this.setLatLng(this._map.layerPointToLatLng(this._center));

        // hijack popup Methods
        L.Util.extend(mark, {openPopup: this._openMemberMarkerPopup});
    },

    // for now, just steal content - TODO: something better
    _openMemberMarkerPopup: function() {
        if (this._popup && !this._map && this._leafpile) {
            this._leafpile.bindPopup(this._popup._content);
            this._leafpile.openPopup();
            return this;
        }
        else {
            return L.Marker.prototype.openPopup.call(this);
        }
    },

    // check if a marker belongs to this pile
    hasMarker: function(mark) {
        var id = L.Util.stamp(mark);
        return (this._markers[id] ? true : false);
    },

    // remove a marker from the pile
    removeMarker: function(mark) {
        if (!this.hasMarker(mark)) return false;
        var id = L.Util.stamp(mark);
        delete this._markers[id];
        delete mark._leafpile;

        // sort of complex cases here
        if (this.size() == 1 && !this.options.singlePiles) {
            this._map.removeLayer(this);
            this._map.addLayer(this.first());
        }
        else if (this.size() == 0) {
            this._map.removeLayer(this);
            this._map.removeLayer(mark);
        }
        else {
            this._resetMapPosition();
            this.options.icon.update(Object.keys(this._markers).length, this._icon);
        }
    },

    // re-calculate the leafpile position based on its markers
    _resetMapPosition: function() {
        var avg = [0, 0];
        var weight = this.size();
        for (var i in this._markers) {
            var mark = this._markers[i];
            var point = this._map.latLngToLayerPoint(mark.getLatLng());
            avg[0] += (point.x / weight);
            avg[1] += (point.y / weight);
        }
        this._center = new L.Point(avg[0], avg[1]);
        this.setLatLng(this._map.layerPointToLatLng(this._center));
    },

    // fire a click event
    _onMouseClick: function(e) {
        L.DomEvent.stopPropagation(e);
        var marks = [];
        for (var i in this._markers) marks.push(this._markers[i]);
        this.fire('click', {originalEvent: e, markers: marks});
    },

    // get the size of the pile
    size: function() {
        var size = 0;
        for (var i in this._markers) if (this._markers.hasOwnProperty(i)) size++;
        return size;
    },

    // get the first marker off the pile
    first: function() {
        if (this.size() > 0) {
            var key = Object.keys(this._markers)[0];
            return this._markers[key];
        }
        return null;
    }

});
