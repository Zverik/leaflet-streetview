L.StreetView = L.Control.extend({
  options: {
    google: true,
    yandex: true,
    mapillary: false,
    mosatlas: true,
  },

  providers: [
    ['google', 'GSV', 'Google Street View', false,
      'https://www.google.com/maps?layer=c&cbll={lat},{lon}'],
    ['yandex', 'ЯП', 'Yandex Panoramas',
      L.latLngBounds([[35.6, 18.5], [72, 180]]),
      'https://yandex.ru/maps/?panorama%5Bpoint%5D={lon},{lat}'],
    ['mapillary', 'Mpl', 'Mapillary Photos', false,
      'https://www.mapillary.com/app/?lat={lat}&lng={lon}&z=17&focus=photo'],
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
    var button = L.DomUtil.create('a');
    button.innerHTML = provider[1];
    button.title = provider[2];
    button._bounds = provider[3];
    button._template = provider[4];
    button.href = '#';
    button.target = 'streetview';
    button.style.padding = '0 8px';
    button.style.width = 'auto';

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
      b.href = tmpl;
    }
  }
});

L.streetView = function(options) {
  return new L.StreetView(options);
}
