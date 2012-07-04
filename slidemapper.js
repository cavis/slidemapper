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
 * SlideMapper jquery extension
 *
 * Creates a slidemapper widget with an element.
 * ========================================================== */
(function($) {

  // default configuration options
  var defaultOptions = {

    // an initial set of slides to add to the map
    // (optional... you can always add slides later)
    slides: [],

    // the type of map to use. valid options are: cloudmade / stamen-toner /
    // stamen-terrain / stamen-watercolor / mapquest / mapquest-aerial
    mapType: 'mapquest',

    // if using cloudmade tiles, provide your apikey here
    apiKey:  null,

    // the default/fallback center and zoomlevel of the map
    center: [40.423, -98.7372],
    zoom: 4,

    // minimum and maximum allowed zoom levels
    minZoom: 2,
    maxZoom: 10,

    // enable key events (left-right arrow keys)
    keyEvents: true,

    // experimental shortest-path arrow key controls
    exploreMode: false,

    // allow popups to close on the map
    closePopupOnClick: false,

    // height/layout settings
    mapPosition: 'bottom', //top|bottom
    mapHeight: 400,
    slideHeight: 200, //if autoHeight, this serves as the min slide height
    autoHeight: false,

    // slideshow settings
    animateSpeed: 200,
    controlType: 'sides', // sides|top
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
  function _onKeyPress(e) {
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
  }
  function _setTiles(tileType) {
    if (DATA.tileLayer) {
      DATA.map.removeLayer(DATA.tileLayer);
      DATA.tileLayer = false;
    }

    // set the new tile layer
    if (tileType == 'cloudmade') {
      if (!DATA.options.apiKey) alert('apiKey required for cloudmade tiles');
      var tileOpts = {attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'};
      DATA.tileLayer = new L.TileLayer('http://{s}.tile.cloudmade.com/'+DATA.options.apiKey+'/997/256/{z}/{x}/{y}.png', tileOpts);
    }
    else if (tileType == 'stamen-toner') {
      if (!L.StamenTileLayer) alert('did you forget to include tile.stamen.js?');
      DATA.tileLayer = new L.StamenTileLayer('toner');
    }
    else if (tileType == 'stamen-terrain') {
      if (!L.StamenTileLayer) alert('did you forget to include tile.stamen.js?');
      DATA.tileLayer = new L.StamenTileLayer('terrain');
    }
    else if (tileType == 'stamen-watercolor') {
      if (!L.StamenTileLayer) alert('did you forget to include tile.stamen.js?');
      DATA.tileLayer = new L.StamenTileLayer('watercolor');
    }
    else if (tileType == 'mapquest') {
      var tileOpts = {
        subdomains:  ['otile1', 'otile2', 'otile3', 'otile4'],
        attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
      };
      DATA.tileLayer = new L.TileLayer('http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', tileOpts);
    }
    else if (tileType == 'mapquest-aerial') {
      var tileOpts = {
        subdomains:  ['oatile1', 'oatile2', 'oatile3', 'oatile4'],
        attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
      };
      DATA.tileLayer = new L.TileLayer('http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', tileOpts);
    }
    else {
      alert('invalid tile type: '+tileType);
    }
    DATA.map.addLayer(DATA.tileLayer);
  }
  function _makeHTML(opts) {
    var map, mapStyle = 'style="height:'+opts.mapHeight+'px"';
    if (opts.mapPosition === 'top') {
      map = '<div class="smapp-map top" '+mapStyle+'></div>';
    }
    else if (opts.mapPosition === 'bottom') {
      map = '<div class="smapp-map bottom" '+mapStyle+'></div>';
    }
    else {
      alert('Invalid mapPosition: '+opts.mapPosition);
    }

    // slideshow gets either height or min-height
    var show = opts.autoHeight
      ? '<div class="smapp-show" style="min-height:'+opts.slideHeight+'px">'
      : '<div class="smapp-show" style="height:'+opts.slideHeight+'px">';
    show += '<div class="smapp-slides-ct"></div>';

    // controls
    if (opts.controlType === 'sides') {
      show += '<span class="ctrl-left ctrl-side">&lsaquo;</span>';
      show += '<span class="ctrl-right ctrl-side">&rsaquo;</span>';
    }
    else if (opts.controlType === 'top') {
      show += '<div class="ctrl-top">';
      show += '<span class="ctrl-left">&lsaquo;</span>';
      show += '<span class="ctrl-count">0 of 0</span>';
      show += '<span class="ctrl-right">&rsaquo;</span>';
      show += '</div>';
    }
    else {
      alert('Invalid controlType: '+opts.controlType);
    }
    show += '</div>'; //end smapp-show

    // assemble in container
    var s = '<div class="smapp">';
    s += (opts.mapPosition === 'top') ? map : '';
    s += show;
    s += (opts.mapPosition === 'bottom') ? map : '';
    return s;
  }
  function _showPopup(marker, panTo) {
    var latlng = marker.getLatLng();
    var popup = marker._popup.setLatLng(latlng);
    DATA.map.openPopup(popup);
    if (panTo) {
      DATA.map.panTo(latlng);
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
        DATA.options = $.extend({}, defaultOptions, passedOpts);
        methods.options(passedOpts || {});
      }
    },

    // get or set map options
    options: function(passedOpts) {
      if (passedOpts === undefined) {
        return DATA.options;
      }
      else {
        DATA.options = $.extend({}, DATA.options, passedOpts);
        $THIS.empty();
        $(document).unbind('keydown', _onKeyPress);
        $THIS.append(_makeHTML(DATA.options));
        showEl = $('.smapp-show', $THIS)[0];
        mapEl  = $('.smapp-map',  $THIS)[0];

        // left/right listeners
        $(showEl)
          .on('click', '.ctrl-left', function() {$THIS.slideMapper('prev');})
          .on('click', '.ctrl-right', function() {$THIS.slideMapper('next');});
        if (DATA.options.keyEvents) $(document).keydown(_onKeyPress);

        // initialize the map
        DATA.options.center = new L.LatLng(DATA.options.center[0], DATA.options.center[1]);
        DATA.map = new L.Map(mapEl, DATA.options);
        _setTiles(DATA.options.mapType);

        // create a layer for the markers
        DATA.markergroup = new L.LayerGroup();
        DATA.map.addLayer(DATA.markergroup);

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
      DATA.markergroup.addLayer(marker);

      // render to slide
      var slidesCt = $THIS.find('.smapp-slides-ct');
      var slide = $('<div class="slide"><div class="slide-inner">'+slideHtml+'</div></div>').appendTo(slidesCt);

      // calculate arrow compass for the marker
      var compass = DATA.options.exploreMode ? _getCompass(marker) : false;

      // store data in markers array
      DATA.items.push({
        marker:  marker,
        slide:   slide,
        compass: compass
      });

      // refresh or show the current popup
      if (DATA.items.length == 1) {
        DATA.index = 0;
        DATA.items[0].slide.addClass('active');
        _autoHeight(DATA.items[0].slide, false);
      }
      if (DATA.items.length == 2) {
        $THIS.find('.ctrl-right').addClass('active');
      }
      $THIS.find('.ctrl-count').html(DATA.index+1 + ' of ' + DATA.items.length);
      _showPopup(DATA.items[DATA.index].marker);
    },

    // move to a different marker
    move: function(index, panTo) {
      if (index === null || index >= DATA.items.length || index < 0 || index == DATA.index) return;

      // slide out the old, in the new preview
      _slideOut(DATA.items[DATA.index].slide, (index > DATA.index));
      _slideIn(DATA.items[index].slide, (index > DATA.index));

      // open new popup and update stored index
      _showPopup(DATA.items[index].marker, panTo);
      DATA.index = index;

      // update controls
      if (index == 0) {
        $THIS.find('.ctrl-left').removeClass('active');
        $THIS.find('.ctrl-right').addClass('active');
      }
      else if (index == DATA.items.length - 1) {
        $THIS.find('.ctrl-left').addClass('active');
        $THIS.find('.ctrl-right').removeClass('active');
      }
      else {
        $THIS.find('.ctrl-left').addClass('active');
        $THIS.find('.ctrl-right').addClass('active');
      }
      $THIS.find('.ctrl-count').html(index+1 + ' of ' + DATA.items.length);
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
      var ret = null;

      // call for each element
      for (var i=0; i<this.length; i++) {

        // setup private vars
        $THIS = $(this[i]);
        DATA  = $THIS.data('slideMapper');

        // call init if no method given
        if (methods[method]) {
          if (!DATA) $.error('Method '+method+' called on uninitialized element');
          else ret = methods[method].apply(this[i], Array.prototype.slice.call(arguments, 1));
        }
        else {
          methods.init.apply(this[i], arguments);
        }

        // save data changes
        $THIS.data('slideMapper', DATA);
      }
      return (ret === null ? this : ret);
    }
  };

}) (jQuery);
