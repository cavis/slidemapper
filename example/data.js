EXAMPLEDATA = [
  // intro marker
  {
    marker: [42.516846, -70.898499],
    center: [40.423, -98.7372],
    html: '<table style="margin:0 40px; padding:10px"><tr>' +
            '<td><img src="http://placehold.it/300x180&text=Map+Stuff"/></td>' +
            '<td style="padding-left:10px">' +
              '<h1>SlideMapper FTW!</h1>' +
              '<p>This is a demo of the different sorts of slides you can setup using slidemapper.</p>' +
            '</td>' +
          '</tr></table>',
    popup: 'So it begins!'
  },

  // marker with everything
  {
    marker: [42.295006, -85.622467],
    center: [42.295006, -85.622467],
    zoom: 4,
    html: '<table style="margin:0 40px; padding:10px"><tr>' +
            '<td style="padding-left:10px">' +
              '<h3>Configure all options</h3>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam.</p>' +
            '</td>' +
            '<td><img src="http://placehold.it/300x180&text=Some+Image"/></td>' +
          '</tr></table>',
    popup: 'zoom level 4'
  },

  // marker without center/zoom set ... will inherit from the previous slide
  {
    marker: [47.683819, -122.301224],
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h2>A whole bunch of overflowing text</h2>' +
              '<img src="http://placehold.it/350x100&text=Another+Image" style="float:right; padding:10px"/>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis <a href="#">dapibus posuere</a> velit aliquet.</p><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>',
    popup: 'no zoom set... stays the same'
  },

  // full-image slide
  {
    marker: [33.053093, -117.268547],
    zoom: 7,
    html: '<img src="http://placehold.it/1000x600&text=Full+Size+Image" style="width:100%;height:100%;margin-bottom:-3px"/>' +
          '<span style="position:absolute;bottom:0;right:0;background:#333;color:#fff;padding:4px 10px">This is a fullsize image... it won\'t scroll at all</span>',
    popup: 'change to zoom level 7'
  },

  // slide without a marker
  {
    center: [40.423, -98.7372],
    zoom: 7,
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<img src="http://placehold.it/250x100&text=Another+Image" style="float:right; padding:10px"/>' +
              '<h2>No marker on map</h2>' +
              '<p>Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>'
  },

  // non-centered marker
  {
    marker: [36.573376, -115.674667],
    center: [35.573376, -121.674667],
    zoom: 6,
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h1>Non-centered marker</h1>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis <a href="#">dapibus posuere</a> velit aliquet.</p><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>',
    popup: 'non-centered marker'
  },

  // clustered markers
  {
    marker: [40.072208, -105.508332],
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h1>Cluster marker 1</h1>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis <a href="#">dapibus posuere</a> velit aliquet.</p><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>',
    popup: 'cluster marker #1'
  },
  {
    marker: [39.961376, -105.510831],
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h1>Cluster marker 2</h1>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis <a href="#">dapibus posuere</a> velit aliquet.</p><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>',
    popup: 'cluster marker #2'
  },
  {
    marker: [39.737567, -104.984718],
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h1>Cluster marker 3</h1>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis <a href="#">dapibus posuere</a> velit aliquet.</p><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>',
    popup: 'cluster marker #3'
  },
  {
    marker: [37.811941, -107.664506],
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h1>Cluster marker 4</h1>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis <a href="#">dapibus posuere</a> velit aliquet.</p><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>',
    popup: 'cluster marker #4'
  },
  {
    marker: [40.377206, -105.521665],
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h1>Cluster marker 5</h1>' +
              '<p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis <a href="#">dapibus posuere</a> velit aliquet.</p><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>' +
            '</div>' +
          '</div>',
    popup: 'cluster marker #5'
  },

  // empty slide
  {
    html: '<div style="margin:0 40px; padding:20px 10px">' +
            '<div>' +
              '<h2>The End</h2>' +
              '<p>Goodbye.</p>' +
            '</div>' +
          '</div>'
  }

];
