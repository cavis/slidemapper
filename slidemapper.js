/* ==========================================================
 * slidemapper.js v0.0.1
 * http://github.com/cavis/slidemapper
 * ==========================================================
 * Copyright (c) 2012 Ryan Cavis
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


/* ==========================================================
 * Constrainer control - allow limiting slides to a
 * rectangular area of the map.
 * ========================================================== */
L.Control.Constrainer = L.Control.extend({
  options: { position: 'topright' },

  statics: {
    START: L.Browser.touch ? 'touchstart' : 'mousedown',
    END: L.Browser.touch ? 'touchend' : 'mouseup',
    MOVE: L.Browser.touch ? 'touchmove' : 'mousemove'
  },

  onAdd: function (map) {
    var className = 'smapp-control-constrain',
        container = L.DomUtil.create('div', className);

    this._link   = L.DomUtil.create('a', className + '-selection', container);
    this._dashes = L.DomUtil.create('div', className + '-selection-inner', this._link);
    this._link.href  = '#';
    this._link.title = 'Constrain Selection';

    // toggle state when clicking on the
    L.DomEvent
      .addListener(this._link, 'click', L.DomEvent.stopPropagation)
      .addListener(this._link, 'click', L.DomEvent.preventDefault)
      .addListener(this._link, 'click', this._onClick, this);
    return container;
  },

  // toggle click handler
  _onClick: function(e) {
    if (L.DomUtil.hasClass(this._link, 'down')) {
      L.DomUtil.removeClass(this._link, 'down');
      this._onEndDraw();
      if (this._rectangle) {
        this._map.removeLayer(this._rectangle);
        this._rectangle = false;
      }
    }
    else {
      L.DomUtil.addClass(this._link, 'down');
      this._map.dragging._draggable.disable();
      this._setDrawingCursor();
      L.DomEvent.addListener(this._map._mapPane, L.Control.Constrainer.START, this._onStartDraw, this);
    }
  },

  // mouse down handler
  _onStartDraw: function(e) {
    this._origin = this._map.mouseEventToLatLng(e);
    L.DomEvent
      .addListener(document, L.Control.Constrainer.MOVE, L.DomEvent.stopPropagation)
      .addListener(document, L.Control.Constrainer.MOVE, L.DomEvent.preventDefault)
      .addListener(document, L.Control.Constrainer.MOVE, this._onDraw, this)
      .addListener(document, L.Control.Constrainer.END, this._onEndDraw, this);
  },

  // mouse moving handler
  _onDraw: function(e) {
    var latlng = this._map.mouseEventToLatLng(e);
    var bounds = new L.LatLngBounds(this._origin, latlng);
    if (this._rectangle) {
      this._rectangle.setBounds(bounds);
    }
    else {
      this._rectangle = new L.Rectangle(bounds, {
        clickable: false,
        fillOpacity: .1,
        opacity: .2,
        weight: 3
      });
      this._map.addLayer(this._rectangle);
    }
  },

  // mouse up handler
  _onEndDraw: function(e) {
    this._map.dragging._draggable.enable();
    this._restoreCursor();
    L.DomEvent.removeListener(this._map._mapPane, L.Control.Constrainer.START, this._onStartDraw);
    L.DomEvent.removeListener(document, L.Control.Constrainer.MOVE, this._onDraw);
    L.DomEvent.removeListener(document, L.Control.Constrainer.END, this._onEndDraw);
  },

  // add global drawing cursor
  _setDrawingCursor: function() {
    document.body.className += ' smapp-constrain-drawing';
  },

  // remove global dragging cursor
  _restoreCursor: function() {
    document.body.className = document.body.className.replace(/ smapp-constrain-drawing/g, '');
  },

});

L.Map.addInitHook(function() {
  if (this.options.constrainControl) {
    this.constrainControl = new L.Control.Constrainer();
    this.addControl(this.constrainControl);
  }
});


/* ==========================================================
 * Clustering control - allow limiting slides to a rectangular area
 * of the map.
 * ========================================================== */
L.Control.Cluster = L.Control.extend({
  options: {
    position: 'topright',
    minValue: 0,
    maxValue: 120,
    stepSize: 10,
    startValue: 80
  },

  statics: {
    START: L.Browser.touch ? 'touchstart' : 'mousedown',
    END: L.Browser.touch ? 'touchend' : 'mouseup',
    MOVE: L.Browser.touch ? 'touchmove' : 'mousemove',
  },

  onAdd: function (map) {
    var className = 'smapp-control-cluster',
        container = L.DomUtil.create('div', className);
    this._slider   = L.DomUtil.create('div', className + '-slider', container);
    this._range    = L.DomUtil.create('div', className + '-slider-range', this._slider);
    this._handleCt = L.DomUtil.create('div', className + '-slider-handle-ct', this._slider);
    this._handle   = L.DomUtil.create('span', className + '-slider-handle', this._handleCt);
    this._handle.title = 'Clustering Size';

    // initial size
    var initialStep = this._valToStep(this.options.startValue);
    this._setStep(initialStep);
    this._steps = false; //get css-height on subsequent loads

    // listen to dragging on the handle
    L.DomEvent
      .addListener(this._handle, 'click', L.DomEvent.stopPropagation)
      .addListener(this._handle, 'click', L.DomEvent.preventDefault)
      .addListener(this._handle, L.Control.Cluster.START, L.DomEvent.preventDefault)
      .addListener(this._handle, L.Control.Cluster.MOVE, L.DomEvent.stopPropagation)
      .addListener(this._handle, L.Control.Cluster.MOVE, L.DomEvent.preventDefault)
      .addListener(this._handle, L.Draggable.START, this._onStartDrag, this);

    // listen to clicking on the range
    L.DomEvent
      .addListener(this._slider, 'click', L.DomEvent.stopPropagation)
      .addListener(this._slider, 'click', L.DomEvent.preventDefault)
      .addListener(this._slider, 'click', this._onClick, this);
    return container;
  },

  // slider click handler
  _onClick: function(e) {
    var step = this._yCoordToStep(e.pageY);
    this._setStep(step);
    this._onEndDrag();
  },

  // mouse down handler
  _onStartDrag: function(e) {
    this._map.dragging._draggable.disable();
    this._setMovingCursor();
    L.DomEvent
      .addListener(document, L.Control.Cluster.MOVE, L.DomEvent.stopPropagation)
      .addListener(document, L.Control.Cluster.MOVE, L.DomEvent.preventDefault)
      .addListener(document, L.Control.Cluster.MOVE, this._onDrag, this);
    L.DomEvent.addListener(document, L.Control.Cluster.END, this._onEndDrag, this);
  },

  // mouse moving handler
  _onDrag: function(e) {
    var step = this._yCoordToStep(e.pageY);
    this._setStep(step);
  },

  // mouse up handler
  _onEndDrag: function(e) {
    this._map.dragging._draggable.enable();
    this._restoreCursor();
    L.DomEvent.removeListener(document, L.Control.Cluster.MOVE, this._onDrag);
    L.DomEvent.removeListener(document, L.Control.Cluster.END, this._onEndDrag);
  },

  // initialize slider steps
  _initSteps: function() {
    var height = parseInt(L.DomUtil.getStyle(this._slider, 'height').replace('px', ''));
    var top    = L.DomUtil.getViewportOffset(this._slider).y;
    var bot    = top + height;
    var half   = (.5 * (this.options.stepSize / (this.options.maxValue - this.options.minValue))) * height;
    this._steps = [];
    for (var i=this.options.minValue; i<=this.options.maxValue; i+=this.options.stepSize) {
      var perc = i / (this.options.maxValue - this.options.minValue);
      this._steps.push({y: bot - (height * perc) - half, val: i, perc: perc});
    }
  },

  // transform a point to a step
  _yCoordToStep: function(yCoord) {
    if (!this._steps) this._initSteps();
    for (var i=0; i<this._steps.length; i++) {
      if (yCoord >= this._steps[i].y) return this._steps[i];
    }
    return this._steps[this._steps.length - 1];
  },

  // transform a value to a step number
  _valToStep: function(val) {
    if (!this._steps) this._initSteps();
    for (var i=0; i<this._steps.length; i++) {
      if (val <= this._steps[i].val) return this._steps[i];
    }
    return this._steps[this._steps.length - 1];
  },

  // helper to convert to percentage string
  _stepToPercentage: function(step) {
    return Math.round(100*step.perc) + '%';
  },

  // set the slider to a step
  _setStep: function(step) {
    this._range.style.height = this._stepToPercentage(step);
    this._handle.style.bottom = this._stepToPercentage(step);
    this._handle.style['font-weight'] = (step.val == 0) ? 'normal' : 'bold';
    this._handle.innerHTML = (step.val == 0) ? 'off' : step.val;
    this._refreshClusterer(step.val);
  },

  // refresh the leafclusterer
  _refreshClusterer: function(newGridSize) {
    if (this._map.clusterer) {
      if (this._map.clusterer.getGridSize_() != newGridSize) {
        this._map.clusterer.setGridSize_(newGridSize);
      }
    }
  },

  // add global dragging cursor
  _setMovingCursor: function() {
    document.body.className += ' smapp-slider-dragging';
  },

  // remove global dragging cursor
  _restoreCursor: function() {
    document.body.className = document.body.className.replace(/ smapp-slider-dragging/g, '');
  }

});

L.Map.addInitHook(function() {
  if (this.options.cluster && this.options.clusterControl) {
    this.clusterControl = new L.Control.Cluster({
      minValue: this.options.clusterMinGridSize,
      maxValue: this.options.clusterMaxGridSize,
      stepSize: this.options.clusterGridStep,
      startValue: this.options.clusterGridSize
    });
    this.addControl(this.clusterControl);
  }
});


/* ==========================================================
 * SlideMapper jquery extension
 *
 * ========================================================== */
(function($) {

  // default configuration options
  var defaultOptions = {
    // base
    mapType: 'cloudmade',
    apiKey:  null,
    center:  [40.423, -98.7372],
    closePopupOnClick: false,
    zoom:    4,
    minZoom: 2,
    maxZoom: 10,
    slides: [],
    exploreMode: false,
    // display options
    autoHeight: true,
    slideMargins: true,
    animateSpeed: 200,
    // clustering
    cluster: false,
    clusterMaxZoom: 9,
    clusterGridSize: 60,
    // clustering control
    clusterControl: false,
    clusterMinGridSize: 0,
    clusterMaxGridSize: 120,
    clusterGridStep: 10,
    // constraining control
    constrainControl: false
  };


  // private vars, defined at the beginning of every call, saved at the end
  var DATA;
  var $THIS;


  // private methods
  function _slideOut($el, goLeft) {
    var end = goLeft ? -($el.width()) : $el.width();
    $el.animate({'margin-left': end}, DATA.options.animateSpeed, 'swing', function() { $el.removeClass('active').removeAttr('style'); });
  }
  function _slideIn($el, goLeft) {
    var start = goLeft ? $el.width() : -($el.width());
    $el.css('margin-left', start).addClass('active');
    $el.animate({'margin-left': 0}, DATA.options.animateSpeed, 'swing', function() { $el.removeAttr('style'); });
    _autoHeight($el, true);
  }
  function _autoHeight($el, animate) {
    if (DATA.options.autoHeight) {
      var $prevEl = $THIS.find('.smapp-slides');
      if (!DATA.autoHeight) DATA.autoHeight = $prevEl.height();
      var inner = $el.find('.item-inner').height(), outer = $prevEl.height();
      if (inner > outer) {
        animate ? $prevEl.animate({'height': inner}, DATA.options.animateSpeed) : $prevEl.height(inner);
      }
      else if (inner < outer) {
        var newH = Math.max(inner, DATA.autoHeight);
        animate ? $prevEl.animate({'height': newH}, DATA.options.animateSpeed) : $prevEl.height(newH);
      }
    }
  }
  function _getCompass(newMarker) {
    var newLatLng = newMarker.getLatLng();
    var newCompass = {};

    // calculate x/y distance to other markers
    for (var i=0; i<DATA.items.length; i++) {
      if (i == newMarker.index) continue;

      // get their data
      var compass = DATA.items[i].compass;
      var latlng = DATA.items[i].marker.getLatLng();
      var isabove = (latlng.lat > newLatLng.lat);
      var isleft  = (latlng.lng < newLatLng.lng);

      // determine which axis to bind to
      var latonly = new L.LatLng(latlng.lat, newLatLng.lng);
      var lngonly = new L.LatLng(newLatLng.lat, latlng.lng);
      var latdist = newLatLng.distanceTo(latonly);
      var lngdist = newLatLng.distanceTo(lngonly);

      // helper to pick the nearest item
      var pickNearest = function(dir, dist) {
        if (!newCompass[dir] || dist < newCompass[dir].d) {
          newCompass[dir] = {i:i, d:dist};
        }
        var opp = (dir == 'n' ? 's' : (dir == 's' ? 'n' : (dir == 'e' ? 'w' : 'e')));
        if (!compass[opp] || dist < compass[opp].d) {
          compass[opp] = {i:newMarker.index, d:dist};
        }
      }

      // setup the new compass (and update the other one too)
      if (latdist > lngdist) {
        (isabove) ? pickNearest('n', latdist) : pickNearest('s', latdist);
      }
      else if (lngdist >= latdist) {
        (isleft) ? pickNearest('w', latdist) : pickNearest('e', latdist);
      }
    }
    return newCompass;
  }


  // public methods
  var methods = {

    // initial setup
    init: function(passedOpts) {
      if (!DATA) {
        DATA = {};
        if (passedOpts.cluster === false) passedOpts.clusterControl = false;
        DATA.options = $.extend({}, defaultOptions, passedOpts);

        // create the slideshow
        $THIS.append('<div class="smapp-slides"><div class="smapp-carousel"></div><span class="left control">‹</span><span class="right control">›</span></div><div class="smapp-map"></div>');
        var prevEl = $('.smapp-slides', $THIS)[0];
        var mapEl  = $('.smapp-map',  $THIS)[0];

        // left/right listeners
        $THIS.find('.control').click(function(e) {
          $(this).hasClass('left') ? $THIS.slideMapper('prev') : $THIS.slideMapper('next');
        });
        $(document).keydown(function(e) {
          if (DATA.index !== null) {
            if (compass = DATA.items[DATA.index].compass) {
              if (e.keyCode == 37 && compass.w) $THIS.slideMapper('move', compass.w.i);
              if (e.keyCode == 38 && compass.n) $THIS.slideMapper('move', compass.n.i);
              if (e.keyCode == 39 && compass.e) $THIS.slideMapper('move', compass.e.i);
              if (e.keyCode == 40 && compass.s) $THIS.slideMapper('move', compass.s.i);
            }
            else {
              if (e.keyCode == 37) $THIS.slideMapper('prev');
              if (e.keyCode == 39) $THIS.slideMapper('next');
            }
          }
        });

        // initialize the map
        DATA.options.center = new L.LatLng(DATA.options.center[0], DATA.options.center[1]);
        DATA.map = new L.Map(mapEl, DATA.options);

        // tiles
        if (DATA.options.mapType == 'cloudmade') {
          tileUrl = 'http://{s}.tile.cloudmade.com/{{APIKEY}}/997/256/{z}/{x}/{y}.png';
          tileUrl = tileUrl.replace('{{APIKEY}}', DATA.options.apiKey);
          var tiles = new L.TileLayer(tileUrl, {attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'});
          DATA.map.addLayer(tiles);
        }
        else if (DATA.options.mapType == 'stamen-toner') {
          var tiles = new L.StamenTileLayer('toner');
          DATA.map.addLayer(tiles);
        }
        else if (DATA.options.mapType == 'stamen-terrain') {
          var tiles = new L.StamenTileLayer('terrain');
          DATA.map.addLayer(tiles);
        }
        else if (DATA.options.mapType == 'stamen-watercolor') {
          var tiles = new L.StamenTileLayer('watercolor');
          DATA.map.addLayer(tiles);
        }
        else if (DATA.options.mapType == 'mapquest') {
          var tileUrl = 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png';
          var tileOpts = {
            subdomains:  ['otile1', 'otile2', 'otile3', 'otile4'],
            attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
          };
          var tiles = new L.TileLayer(tileUrl, tileOpts);
          DATA.map.addLayer(tiles);
        }
        else if (DATA.options.mapType == 'mapquest-aerial') {
          var tileUrl = 'http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png';
          var tileOpts = {
            subdomains:  ['oatile1', 'oatile2', 'oatile3', 'oatile4'],
            attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
          };
          var tiles = new L.TileLayer(tileUrl, tileOpts);
          DATA.map.addLayer(tiles);
        }

        // setup data containers
        if (DATA.options.cluster) {
          DATA.clusterer = new LeafClusterer(DATA.map, null, {
            gridSize: DATA.options.clusterGridSize,
            maxZoom: DATA.options.clusterMaxZoom
          });
          DATA.map.clusterer = DATA.clusterer;
        }
        else {
          DATA.markergroup = new L.LayerGroup();
          DATA.map.addLayer(DATA.markergroup);
        }

        // setup initial items
        DATA.items = [];
        DATA.index = null;
        methods.add(DATA.options.slides);
      }
    },

    // add a datapoint/marker to the map
    add: function(latlng, mapHtml, slideHtml) {
      if (arguments.length == 1 && arguments[0] instanceof Array) {
        for (var i=0; i<arguments[0].length; i++) {
          methods.add.apply(this, arguments[0][i]);
        }
        return;
      }

      // add to map
      var latlng = new L.LatLng(latlng[0], latlng[1]);
      var marker = new L.Marker(latlng).bindPopup(mapHtml);
      marker.index = DATA.items.length;
      marker.on('click', function(e) {
        methods.move(e.target.index, true);
      });
      if (DATA.clusterer) {
        DATA.clusterer.addMarker(marker);
      }
      else {
        DATA.markergroup.addLayer(marker);
      }

      // render to preview
      var caro = $THIS.find('.smapp-carousel');
      var cls  = DATA.options.slideMargins ? 'item-inner margins' : 'item-inner';
      var prev = $('<div class="item"><div class="'+cls+'">'+slideHtml+'</div></div>').appendTo(caro);

      // calculate arrow compass for the marker
      var compass = DATA.options.exploreMode ? _getCompass(marker) : false;

      // store data in markers array
      DATA.items.push({
        marker:  marker,
        preview: prev,
        compass: compass,
      });

      // refresh or show the current popup
      if (DATA.items.length == 1) {
        DATA.index = 0;
        DATA.items[0].preview.addClass('active');
        _autoHeight(DATA.items[0].preview, false);
      }
      if (DATA.items.length == 2) {
        $THIS.find('.control.right').show();
      }
      methods.showPopup(DATA.items[DATA.index].marker);
    },

    // show the popup for a marker
    showPopup: function(marker, panTo) {
      var latlng = marker.getLatLng();

      // get a more favorable point for clustered markers
      if (DATA.clusterer) {
        if (clll = DATA.clusterer.getClusterLatLng(marker)) {
          var pt = DATA.map.latLngToLayerPoint(clll);
          pt.y += 20;
          latlng = DATA.map.layerPointToLatLng(pt);
        }
      }
      var popup = marker._popup.setLatLng(latlng);
      DATA.map.openPopup(popup);
      if (panTo) {
        DATA.map.panTo(latlng);
      }
    },

    // move to a different marker
    move: function(index, panTo) {
      if (index === null || index >= DATA.items.length || index < 0 || index == DATA.index) return;

      // slide out the old, in the new preview
      _slideOut(DATA.items[DATA.index].preview, (index > DATA.index));
      _slideIn(DATA.items[index].preview, (index > DATA.index));

      // open new popup and update stored index
      methods.showPopup(DATA.items[index].marker, panTo);
      DATA.index = index;

      // update controls
      if (index == 0) {
        $THIS.find('.control.left').hide();
        $THIS.find('.control.right').show();
      }
      else if (index == DATA.items.length - 1) {
        $THIS.find('.control.left').show();
        $THIS.find('.control.right').hide();
      }
      else {
        $THIS.find('.control.left').show();
        $THIS.find('.control.right').show();
      }
    },

    // next!
    next: function() {
      methods.move(DATA.index === null ? 0 : DATA.index + 1, true);
    },

    // previous!
    prev: function() {
      methods.move(DATA.index === null ? 0 : DATA.index - 1, true);
    }

  };

  // attach jquery namespace
  $.fn.slideMapper = function(method) {
    if (this.length > 1) {
      $.error('SlideMapper currently only supports 1 map per page');
    }
    else if (method && typeof method !== 'object' && !methods[method]) {
      $.error('Method '+method+' does not exist on jQuery.slideMapper');
    }
    else {

      // call for each element
      for (var i=0; i<this.length; i++) {

        // setup private vars
        $THIS = $(this[i]);
        DATA  = $THIS.data('slideMapper');

        // call init if no method given
        if (methods[method]) {
          if (!DATA) $.error('Method '+method+' called on uninitialized element');
          else methods[method].apply(this[i], Array.prototype.slice.call(arguments, 1));
        }
        else {
          methods.init.apply(this[i], arguments);
        }

        // save data changes
        $THIS.data('slideMapper', DATA);
      }
      return this;
    }
  };

}) (jQuery);
