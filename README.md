
Slidemapper
===========

A jQuery plugin for creating slideshows on a leaflet map.  Will render a slideshow-carousel linked to a map inside selected elements, extending to the full width of the container.  The map will follow along as the user arrows/clicks through the geotagged slides.

Check out [the demo here](http://cav.is/slidemapper/example/index.html "Demo").  Unless you're busy.  Cause I totally understand.


![Alt text](http://cav.is/img/slidemapper-example.png "Slidemapper Demo")

Requirements
------------

### jQuery

Requires [jQuery](http://jquery.com/ "jQuery") version **>= 1.7.0**

### Leaflet

Requires [Leaflet](http://leaflet.cloudmade.com/ "Leaflet") version **>= 0.4**.  Since this is still in development, I'd suggest getting it directly from [their github repo](https://github.com/CloudMade/Leaflet "github").

### Leafpile

If you're going to use the `leafPile: true` clustering option, you should also include [leafpile.js](http://github.com/cavis/leafpile "Leafpile").  Otherwise, don't worry about it.


Getting Started
------------

Include either the minified or standard versions of both slidemapper.js and slidemapper.css.  (See example/index.html for an example).

### In your `<head>` section (next to other CSS):

    <link href="path/to/leaflet.css" rel="stylesheet">
    <link href="path/to/slidemapper.min.css" rel="stylesheet">

### At the bottom of the `<body>` section (next to other JS)

    <script src="path/to/jquery-1.7.2.min.js"></script>
    <script src="path/to/leaflet.js"></script>
    <script src="path/to/slidemapper.min.js"></script>


Usage
------------

Slidemapper is just a jQuery plugin, so just call the function on a selector to create a slideshow.  This is the equivalent of calling the `init` method on the element.

    $(document).ready(function() {
        var options = {};
        $mySlideMap = $('#slideshow-container').slideMapper(options);
    });

Then, you can call other Slidemapper methods by passing the string method name as the first argument, like so:

    $mySlideMap.slideMapper('add', someSlideConfig);
    $mySlideMap.slideMapper('count');
    $('#slideshow-container').slideMapper('removeAll');


Options
------------

These options can be passed in when you initialize the slideMapper

`slides` - An optional array of slide configurations to add as soon as the slideshow is created.

`mapType` - String indicating the type of map tiles to use.  Valid options are `cloudmade`, `stamen-toner`, `stamen-terrain`, `stamen-watercolor`, `mapquest`, and `mapquest-aerial`.  If you choose `cloudmade`, you must also provide an API key. - __(default: `mapquest`)__

`apiKey` - Optional string API key for use with `cloudmade` tiles.  Get one [here](http://developers.cloudmade.com/ "Cloudmade").

`center` - The starting/default center lat/lng for the map - __(default: `[40.423, -98.7372]`)__

`zoom` - The starting/default zoom level for the map - __(default: 4)__

`minZoom` - The minimum zoom level the map should allow - __(default: 2)__

`maxZoom` - The maximum zoom level the map should allow - __(default: 10)__

`enableKeyEvents` - Enable key events (left-right arrow keys) - __(default: true)__

`closePopupOnClick` - Allow popups to close when the map is clicked - __(default: false)__

`mapPosition` - The location of the map relative to the slideshow; `top` or `bottom` - __(default: `bottom`)__

`mapHeight` - The height in pixels of the map - __(default: 400)__

`slideHeight` - The height in pixels of the slideshow element.  If `autoHeight` is true, this becomes the min-height of the slideshow element. - __(default: `220`)__

`autoHeight` - Automatically resize the height of the slideshow element to match the height of the current slide - __(default: false)__

`leafPile` - Enable clustering of markers on the map using an `L.Leafpile`.  May set to `true`, or set to a config object to be passed to the constructor of the `L.Leafpile`. - __(default: false)__

`animateSpeed` - The speed in milliseconds of the slideshow animations - __(default: 200)__

`controlType` - Which type of slideshow controls to display; `sides` or `top` - __(default: `sides`)__


Methods
------------

Manipulate the slides in the show

`add`__(config)__ - add a slide to the end of the slideshow

`insert`__(index, config)__ - insert a slide into the slideshow

`get`__()__ - get the currently displayed slide

`get`__(index)__ - get a slide at an index

`count`__()__ - get the total number of slides

`shuffle`__(moveCurrentToIndex)__ - move the currently displayed slide to a new index

`shuffle`__(indexFrom, indexTo)__ - move a slide to a new index

`remove`__()__ - remove the currently displayed slide from the slideshow

`remove`__(index)__ - remove a specific slide from the slideshow

`removeAll`__()__ - remove all slides from this slideshow

Change the currently displayed slide

`move`__(index, animate)__ - move to a slide at an index, optionally animating the transition

`next`__()__ - move to the next slide

`prev`__()__ - move to the previous slide

Enable and disable events

`keyEvents`__(turnOn)__ - enable or disable key events

`mapEvents`__(turnOn)__ - enable or disable map events

`freeze`__(makeFrozen)__ - freeze the show, preventing the user from changing slides or scrolling/zooming the map


Events
------------

`move` - fired when the slide changes

    $mySlideMap = $('#slideshow-container').slideMapper();
    $mySlideMap.on('move', function(e, slide, index) {
        // e     - the event object
        // slide - the slide we're moving to
        // index - the index of the slide we're moving to
        if (slide.index == 4) {
            return false; // prevent the slide from changing
        }
    });


Issues and Contributing
-----------------------

Report any bugs or feature-requests via the issue tracker.  Or send me a fax.  And if you'd like to contribute, send me a note!  Thanks.


License
------------

Leafpile is free software, and may be redistributed under the MIT-LICENSE.

Thanks for listening!
