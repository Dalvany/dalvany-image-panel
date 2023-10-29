[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=205AD4&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22dalvany-image-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/dalvany-image-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=205AD4&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22dalvany-image-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/dalvany-image-panel)
[![CI](https://github.com/Dalvany/dalvany-image-panel/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/Dalvany/dalvany-image-panel/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Dalvany/dalvany-image-panel/actions/workflows/codeql-analysis.yml/badge.svg?branch=master)](https://github.com/Dalvany/dalvany-image-panel/actions/workflows/codeql-analysis.yml)

# Grafana image panel

Display an image by concatenation of a URL, a metric and a suffix.  
The result will be : baseURL + icon field + suffix.

Note :
* version 3.0.0 requires at least Grafana 10.0.3
* Version 2.8.0 requires at least Grafana 9.0.0
* version 2.6.0 requires at least Grafana 8.5.0
* if new options doesn't show up or plugin seems in an older version, please uninstall, reinstall and then restart
grafana (or if using docker, run a new container using the latest version of the plugin in GF_INSTALL_PLUGINS env
variable)
* Shared tooltip doesn't seem to work with latest grafana version
* If there is a discrepancy in the tooltip between `elapsed` mode and the real date, if you're using a MySQL database,
please read [this issue](https://github.com/Dalvany/dalvany-image-panel/issues/74) as it might solve the problem.

# Configuration

If queries select multiple fields, use the outer join transform.

## URL

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_url.png)

Options for building image URL :

- Base URL (optional) : the start of the URL where to fetch image. Can be left empty if `icon field` already contains
  the base URL. This option support variable.
- Icon field : field that contains the name of the image. The special value
  `First non time field` will use the first non-time field it finds. This is the default value.
- Suffix (optional) : string to add at the end. This option support variable.

## Image options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_image.png)

Options that allow to choose how the image will be displayed :

- Image width : the width of the image. This option support variable (beware that it needs to be a number)
- Image height : the height of the image. This option support variable (beware that it needs to be a number)
- Single fill : if the query have a unique result, allow to fill the panel instead of using width and height above
- Alt field : field to use as `alt`. The special value `Use icon field`
  will use the same field as `Icon field`. This is the default value.

## Shared crosshair options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_shared_crosshair.png)

These options allow to set a background and border when mouse is over in image. It is also used to highlight image if
`shared crosshair` or `shared tooltip` is enabled in the dashboard.

- Background highlight color : the color to use as background image for shared crosshair (default to white with transparency)
- Border highlight color : the border color to use for shared crosshair.

Notes :

- You must enable tooltip in the plugin configuration for `shared tooltip` to actually show a tooltip
- `shared tooltip` doesn't work in slideshow mode (though `shared crosshair` did work), that means tooltip won't show
up when hoovering over another panel
- It correlates on time, and work with `timeseries` and `candlestick` panels.

## Slideshow options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_slideshow.png)

Options for slideshow :

- Enable slideshow : enable the slideshow.
- Duration : configure how long (in milliseconds) an image will be shown. Can't be `0`.
- Transition : which transition animation to use
- Transition duration : how long the transition will take (in milliseconds). Can't be `0`.
- Pause on hover : when enabled, if the mouse is over an image, the slideshow will pause.
- Infinite : when enabled, slideshow continues from start when finished

## Image tooltip options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_tooltip.png)

Options to add and customize a tooltip :

- Include tooltip : a tooltip will be display when the mouse hovers over the image
- Include field : include a field value in the tooltip text
- Tooltip field : select the field values to display in the tooltip. The special value `Use icon field` will use the
  same field as `Icon field`. This is the default value.
- Include date : the tooltip will include the date and time
- As elapsed : the date will be displayed as an elapsed date (i.e. 4h hours ago)

## Image link options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_link.png)

It allows to open a link into a new tab. It works like the image URL : it concatenates 3 elements (a base URL, a metric
value and a suffix).

- Click to open : enable link support.
- Open in new tab : allow to open link in a new tab. Default is enable.
- Base URL (optional) : the start of the URL where to fetch image. Can be left empty if `icon field` already contains
  the base URL. This option support variable.
- Link field : field that contains the value. The special value `Don't use a field` allow not to use any field, the
  result will be the same link for all images. This is the default value.
- Suffix (optional) : string to add at the end. This option support variable.

## Overlay options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_overlay.png)

Allow adding colored square as overlay on the corner of each image. Color is bound from values. By default, color is
light transparent grey.  
Binding behaves this way :

- If all values declared in binding are numbers AND guess value type from data are also numbers, then it acts like
  grafana's threshold.
- Otherwise, it is a simple mapping.

Note : when leave an input field, values are sorted and empty input are removed so beware that when choosing the color
bindings are not reordered.

Options for binding :

- Overlay field : select the data field to use for binding (time fields are removed). If `No overlay` is selected,
  overlay will not be shown.
- Position : select the position of the overlay.
- Width : allow to select the width of the overlay (in pixel or percent of the image size).
- Height : allow to select the height of the overlay (in pixel or percent of the image size).
- Binding : allow to choose the color for each value. Allow also to choose color for unmapped values.

Note : when leave an input field, values are sorted and empty input are removed so beware that when choosing the color
bindings are not reordered.

## Underline options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/configuration_underline.png)

Add a field value as underline. If text is wider than image then it will be truncated.

- Underline field : field to use as underline. If `No underline` is selected, then underline will not be displayed.
- Text size : size of the text.
- Text align : horizontal underline alignment. Default to `left`.
- Binding field : allow to use a field to bind text color.
- Binding : this configuration will appear if `Underline`'s `Binding field` is set to a field. It will allow to
  map values to color.

Note : when leave an input field, values are sorted and empty input are removed so beware that when choosing the color
bindings are not reordered.

# Screenshot

Multiple results

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/screenshot01.png)

"Single fill"

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/screenshot02.png)

One result with "single fill" disabled

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/screenshot03.png)

Overlay

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/screenshot04.png)

Underline

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/screenshot05.png)

Shared crosshair support

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/screenshot06.png)

Shared tooltip support

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/main/src/img/screenshot07.png)

# Install

Follow instructions from
[grafana plugin web page](https://grafana.com/grafana/plugins/dalvany-image-panel/?tab=installation)

# License

- Color binding component is a modification of grafana's ThresholdsEditor thus under Apache 2.0 license.

# Credits

Logo for the plugin was found [here](https://www.iconfinder.com/icons/211677/image_icon) and is under MIT license.  
[Slideshow](https://github.com/femioladeji/react-slideshow) is under Apache 2.0 license.  

GitHub's workflows are from [grafana](https://github.com/grafana/plugin-workflows) and under Apache 2.0 license

# Plugin development : resources

* [Documentation](https://grafana.com/docs/grafana/latest/developers/plugins/?pg=docs)
* ["Storybook"](https://developers.grafana.com/ui/latest/index.html)
* [Release workflow](https://github.com/grafana/plugin-tools/tree/main/packages/create-plugin/templates/github/ci/.github/workflows)
