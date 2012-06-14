/* ==========================================================
 * slidemapper.js v0.0.1
 * http://github.com/cavis/slidemapper
 * ==========================================================
 * Copyright (c) 2012 American Public Media, Ryan Cavis
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
 * Constrainer control - allow limiting slides to a rectangular area
 * of the map.
 * ========================================================== */
L.Control.Constrainer = L.Control.extend({
  options: { position: 'topright' },

  onAdd: function (map) {
    map.drawing   = {};
    var className = 'smapp-control-constrain',
        container = L.DomUtil.create('div', className);

    var link   = L.DomUtil.create('a', className + '-selection', container);
    link.href  = '#';
    link.title = 'Constrain Selection';

    L.DomEvent
      .addListener(link, 'click', L.DomEvent.stopPropagation)
      .addListener(link, 'click', L.DomEvent.preventDefault)
      .addListener(link, 'click', function() {
        L.DomUtil.hasClass(link, 'down')
        ? L.DomUtil.removeClass(link, 'down') || this.endConstrain()
        : L.DomUtil.addClass(link, 'down') || this.startConstrain();
      }, this);

    return container;
  },

  startConstrain: function() {
    this._map.dragging._draggable.disable();
    if (this._map.drawing._drawable) {
      this._map.drawing._drawable.enable();
      this._map.drawing._startLatLng = false;
    }
    else {
      this._map.drawing._drawable = new L.Drawable(this._map._mapPane, this._map._container);
      this._map.drawing._drawable.enable();
      this._map.drawing._drawable
        .on('dragstart', this.onDrawStart, this)
        .on('drag', this.onDraw, this)
        .on('dragend', this.onDrawEnd, this);
    }
  },

  onDrawStart: function(args) {
    this._map.drawing._startLatLng = this._map.mouseEventToLatLng(args.event);
  },

  onDraw: function(args) {
    var latlng = this._map.mouseEventToLatLng(args.event);
    var bounds = new L.LatLngBounds(this._map.drawing._startLatLng, latlng);
    if (this._map.drawing._rectangle) {
      this._map.drawing._rectangle.setBounds(bounds);
    }
    else {
      this._map.drawing._rectangle = new L.Rectangle(bounds, {
        clickable: false,
        fillOpacity: .1,
        opacity: .2,
        weight: 3
      });
      this._map.addLayer(this._map.drawing._rectangle);
    }
  },

  onDrawEnd: function(args) {
    this._map.drawing._drawable.disable();
    this._map.dragging._draggable.enable();
  },

  endConstrain: function() {
    if (this._map.drawing._rectangle) {
      this._map.removeLayer(this._map.drawing._rectangle);
      this._map.drawing._rectangle = false;
    }
    if (!this._map.dragging._draggable._enabled) {
      this._map.drawing._drawable.disable();
      this._map.dragging._draggable.enable();
    }
  }

});

L.Map.mergeOptions({constrainControl: true});

L.Map.addInitHook(function () {
  if (this.options.constrainControl) {
    this.constrainControl = new L.Control.Constrainer();
    this.addControl(this.constrainControl);
  }
});

// use extension of drawable interface to draw rectangle
L.Drawable = L.Draggable.extend({

  _onMove: function (e) {
    if (e.touches && e.touches.length > 1) return;
    L.DomEvent.preventDefault(e);
    var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e);

    if (!this._moved) {
      this.fire('dragstart', {event: e});
      this._moved = true;
    }
    this._moving = true;

    var newPoint = new L.Point(first.clientX, first.clientY);
    this.fire('drag', {event: e});
  }

});


/* ==========================================================
 * Clustering control - allow limiting slides to a rectangular area
 * of the map.
 * ========================================================== */
L.Control.Cluster = L.Control.extend({
  options: { position: 'topright' },

  statics: {
    START: L.Browser.touch ? 'touchstart' : 'mousedown',
    END: L.Browser.touch ? 'touchend' : 'mouseup',
    MOVE: L.Browser.touch ? 'touchmove' : 'mousemove',
    MIN: 20,
    MAX: 120,
    STEP: 10,
    DEFAULT: 60
  },

  onAdd: function (map) {
    var className = 'smapp-control-cluster',
        container = L.DomUtil.create('div', className);

    this._slider = L.DomUtil.create('div', className + '-slider', container);
    this._range  = L.DomUtil.create('div', className + '-slider-range', this._slider);
    this._link   = L.DomUtil.create('a', className + '-slider-handle', this._slider);
    this._link.href  = '#';
    this._link.title = 'Clustering Size';

    this._range.style.height = '0%';
    this._link.style.bottom = '0%';
    this._link.innerHTML = 'off';

    // listen to dragging on the link
    L.DomEvent
      .addListener(this._link, 'click', L.DomEvent.stopPropagation)
      .addListener(this._link, 'click', L.DomEvent.preventDefault)
      .addListener(this._link, L.Control.Cluster.MOVE, L.DomEvent.preventDefault)
      .addListener(this._link, L.Control.Cluster.MOVE, L.DomEvent.preventDefault)
      .addListener(this._slider, L.Draggable.START, this._onStartDrag, this);
    return container;
  },

  _onStartDrag: function(e) {
    this._map.dragging._draggable.disable();
    L.DomEvent
      .addListener(document, L.Control.Cluster.MOVE, L.DomEvent.stopPropagation)
      .addListener(document, L.Control.Cluster.MOVE, L.DomEvent.preventDefault)
      .addListener(document, L.Control.Cluster.MOVE, this._onDrag, this);
    L.DomEvent.addListener(document, L.Control.Cluster.END, this._onEndDrag, this);

    var height = parseInt(L.DomUtil.getStyle(this._slider, 'height').replace('px', ''));
    console.log("het", height);
  },

  _onDrag: function(e) {


    console.log("DRAG", e.pageY, L.DomUtil.getViewportOffset(this._slider).y, L.DomUtil.getStyle(this._slider, 'height'));

  },

  _onEndDrag: function(e) {
    this._map.dragging._draggable.enable();
    L.DomEvent.removeListener(document, L.Control.Cluster.MOVE, this._onDrag);
    L.DomEvent.removeListener(document, L.Control.Cluster.END, this._onEndDrag);
  },




});

L.Map.mergeOptions({clusterControl: true});

L.Map.addInitHook(function () {
  if (this.options.clusterControl) {
    this.clusterControl = new L.Control.Cluster();
    this.addControl(this.clusterControl);
  }
});





/* ==========================================================
 *
 *
 * ========================================================== */
(function($) {

  // default configuration options
  var defaultOptions = {
    mapType: 'cloudmade',
    apiKey:  null,
    center:  [40.423, -98.7372],
    zoom:    4,
    minZoom: 2,
    maxZoom: 10,
    slides: [],
    cluster: true,
    constrainControl: true,
    maxClusterZoom: 9
  };


  // private vars, defined at the beginning of every call, saved at the end
  var DATA;
  var $THIS;


  // helper functions to slide left and right
  function _slideOut($el, goLeft) {
    var end = goLeft ? '-100%' : '100%';
    $el.css({left: '0%', display: 'block'}).removeClass('active');
    $el.animate({left: end}, 400, 'swing', function() { $el.removeAttr('style'); });
  }
  function _slideIn($el, goLeft) {
    var start = goLeft ? '100%' : '-100%';
    $el.css('left', start).addClass('active');
    $el.animate({left: '0%'}, 400, 'swing', function() { $el.removeAttr('style'); });
  }


  // public methods
  var methods = {

    // initial setup
    init: function(options) {
      if (!DATA) {
        DATA = {};
        DATA.options = $.extend({}, defaultOptions, options);

        // create the slideshow
        $THIS.append('<div class="smapp-slides"><div class="carousel"></div><span class="left control">‹</span><span class="right control">›</span></div><div class="smapp-map"></div>');
        var prevEl = $('.smapp-slides', $THIS)[0];
        var mapEl  = $('.smapp-map',  $THIS)[0];

        // left/right listeners
        $THIS.find('.control').click(function(e) {
          $(this).hasClass('left') ? $THIS.slideMapper('prev') : $THIS.slideMapper('next');
        });
        $(document).keydown(function(e) {
          if (e.keyCode == 37) $THIS.slideMapper('prev');
          if (e.keyCode == 39) $THIS.slideMapper('next');
        });

        // pick the tiles
        var tileUrl = '';
        if (DATA.options.mapType == 'cloudmade') {
            tileUrl = 'http://{s}.tile.cloudmade.com/{{APIKEY}}/997/256/{z}/{x}/{y}.png';
            tileUrl = tileUrl.replace('{{APIKEY}}', DATA.options.apiKey);
        }

        // find the center latlng
        var center = new L.LatLng(DATA.options.center[0], DATA.options.center[1]);

        // initialize the map
        DATA.map = new L.Map(mapEl);
        var tiles = new L.TileLayer(tileUrl, {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            minZoom: DATA.options.minZoom,
            maxZoom: DATA.options.maxZoom
        });
        DATA.map.setView(center, DATA.options.zoom).addLayer(tiles);

        // setup data containers
        DATA.clusterer = new LeafClusterer(DATA.map);
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
        methods.move(e.target.index);
      });
      DATA.clusterer.addMarker(marker);

      // render to preview
      var caro = $THIS.find('.carousel');
      var prev = $('<div class="item"><div class="item-inner">'+slideHtml+'</div></div>').appendTo(caro);

      // store data in markers array
      DATA.items.push({
        marker:  marker,
        preview: prev,
      });

      // initial showing
      if (DATA.items.length == 1) {
        prev.addClass('active');
        marker.openPopup();
        DATA.map.panTo(latlng);
        DATA.index = 0;
      }
      if (DATA.items.length > 1) {
        $THIS.find('.control.right').show();
      }
    },

    // move to a different marker
    move: function(index) {
      if (index === null || index >= DATA.items.length || index < 0 || index == DATA.index) return;

      // slide out the old, in the new preview
      _slideOut(DATA.items[DATA.index].preview, (index > DATA.index));
      _slideIn(DATA.items[index].preview, (index > DATA.index));

      // open new popup and update stored index
      var latlng = DATA.items[index].marker.getLatLng();
      var popup  = DATA.items[index].marker._popup.setLatLng(latlng);
      DATA.map.openPopup(popup);
      DATA.map.panTo(latlng);
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
      methods.move(DATA.index === null ? 0 : DATA.index + 1);
    },

    // previous!
    prev: function() {
      methods.move(DATA.index === null ? 0 : DATA.index - 1);
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
