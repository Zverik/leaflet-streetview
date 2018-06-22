# Street View Buttons

This is a simple plugin for [Leaflet](http://leafletjs.com) that shows a row of buttons.
When you click any of these buttons, a new window or tab is opened, with a street view
focused on the centre of the map. Just do:

    L.streetView().addTo(map);

Check out [a demo here](https://zverik.github.io/leaflet-streetview/index.html).

If you need to specify the focus point, instead of it being in the centre, use
`fixCoord(latlon)` method, and `releaseCoord()` to continue tracking the map.

Providers currently supported:

* Google Street View
* Bing StreetSide
* Yandex Panoramas (for Russia and neighbouring countries)
* MosAtlas (for Moscow, Russia)
* Mapillary
* OpenStreetCam

Please make a pull request if you know an URL template for another provider.

## License and Author

Written by Ilya Zverev, published under WTFPL: do what you want with it.
