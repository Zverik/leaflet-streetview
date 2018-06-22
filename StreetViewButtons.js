L.StreetView = L.Control.extend({
  options: {
    google: true,
    bing: true,
    yandex: true,
    mapillary: true,
    mapillaryId: null,
    openstreetcam: true,
    mosatlas: true
  },

  providers: [
    ['google', 'GSV', 'Google Street View', false,
      'https://www.google.com/maps?layer=c&cbll={lat},{lon}'],
    ['bing', 'Bing', 'Bing StreetSide',
      L.latLngBounds([[25, -168], [71.4, 8.8]]),
      'https://www.bing.com/maps?cp={lat}~{lon}&lvl=19&style=x&v=2'],
    ['yandex', 'ЯП', 'Yandex Panoramas',
      L.latLngBounds([[35.6, 18.5], [72, 180]]),
      'https://yandex.ru/maps/?panorama%5Bpoint%5D={lon},{lat}'],
    ['mapillary', 'Mplr', 'Mapillary Photos', false,
      'https://a.mapillary.com/v3/images?client_id={id}&closeto={lon},{lat}&lookat={lon},{lat}'],
    ['openstreetcam', 'OSC', 'OpenStreetCam', false,
      'lat={lat}&lng={lon}&distance=50'],
    ['mosatlas', 'Мос', 'Панорамы из Атласа Москвы',
      L.latLngBounds([[55.113, 36.708], [56.041, 38]]),
      'http://atlas.mos.ru/?lang=ru&z=9&ll={lon}%2C{lat}&pp={lon}%2C{lat}'],
  ],

  onAdd: function(map) {
    this._container = L.DomUtil.create('div', 'leaflet-bar');
    this._buttons = [];

    for (var i = 0; i < this.providers.length; i++)
      this._addProvider(this.providers[i]);

    map.on('moveend', function() {
      if (!this._fixed)
        this._update(map.getCenter());
    }, this);
    this._update(map.getCenter());
    return this._container;
  },

  fixCoord: function(latlon) {
    this._update(latlon);
    this._fixed = true;
  },

  releaseCoord: function() {
    this._fixed = false;
    this._update(this._map.getCenter());
  },

  _addProvider: function(provider) {
    if (!this.options[provider[0]])
      return;
    if (provider[0] == 'mapillary' && !this.options.mapillaryId)
      return;
    var button = L.DomUtil.create('a');
    button.innerHTML = provider[1];
    button.title = provider[2];
    button._bounds = provider[3];
    button._template = provider[4];
    button.href = '#';
    button.target = 'streetview';
    button.style.padding = '0 8px';
    button.style.width = 'auto';

    // Some buttons require complex logic
    if (provider[0] == 'mapillary') {
      button._needUrl = false;
      L.DomEvent.on(button, 'click', function(e) {
        if (button._href) {
          this._ajaxRequest(
            button._href.replace(/{id}/, this.options.mapillaryId),
            function(data) {
              if (data && data.features && data.features[0].properties) {
                var photoKey = data.features[0].properties.key,
                    url = 'https://www.mapillary.com/map/im/{key}'.replace(/{key}/, photoKey);
                window.open(url, button.target);
              }
            }
          );
        }
        return L.DomEvent.preventDefault(e);
      }, this);
    } else if (provider[0] == 'openstreetcam') {
      button._needUrl = false;
      L.DomEvent.on(button, 'click', function(e) {
        if (button._href) {
          this._ajaxRequest(
            'http://openstreetcam.org/nearby-tracks',
            function(data) {
              if (data && data.osv && data.osv.sequences) {
                var seq = data.osv.sequences[0],
                    url = 'https://www.openstreetcam.org/details/'+seq.sequence_id+'/'+seq.sequence_index;
                window.open(url, button.target);
              }
            },
            button._href
          );
        }
        return L.DomEvent.preventDefault(e);
      }, this);
    } else
      button._needUrl = true;

    // Overriding some of the leaflet styles
    button.style.display = 'inline-block';
    button.style.border = 'none';
    button.style.borderRadius = '0 0 0 0';
    this._buttons.push(button);
  },

  _update: function(center) {
    if (!center)
      return;
    var last;
    for (var i = 0; i < this._buttons.length; i++) {
      var b = this._buttons[i],
          show = !b._bounds || b._bounds.contains(center),
          vis = this._container.contains(b);

      if (show && !vis) {
        ref = last ? last.nextSibling : this._container.firstChild;
        this._container.insertBefore(b, ref);
      } else if (!show && vis) {
        this._container.removeChild(b);
        return;
      }
      last = b;

      var tmpl = b._template;
      tmpl = tmpl
        .replace(/{lon}/g, L.Util.formatNum(center.lng, 6))
        .replace(/{lat}/g, L.Util.formatNum(center.lat, 6));
      if (b._needUrl)
        b.href = tmpl;
      else
        b._href = tmpl;
    }
  },

  _ajaxRequest: function(url, callback, post_data) {
    if (window.XMLHttpRequest === undefined)
      return;
    var req = new XMLHttpRequest();
    req.open(post_data ? 'POST' : "GET", url);
    if (post_data)
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status == 200) {
        var data = (JSON.parse(req.responseText));
        callback(data);
      }
    };
    req.send(post_data);
  }
});

L.streetView = function(options) {
  return new L.StreetView(options);
}
