[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=205AD4&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22dalvany-image-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/dalvany-image-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=205AD4&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22dalvany-image-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/dalvany-image-panel)

# Grafana image panel

Display an image by concatenation of an URL, a metric and a suffix.  
The result will be : baseURL + icon field + suffix.

# Configuration

If queries select multiple fields, use the outer join transform.

## URL

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/configuration_url.png)  
Options for building image URL :

- Base URL (optional) : the start of the URL where to fetch image. Can be left empty if `icon field` already contains
  the base URL. This option support variable.
- Icon field : field that contains the name of the image. The special value
  `First non time field` will use the first non-time field it finds. This is the default value.
- Suffix (optional) : string to add at the end. This option support variable.

## Image options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/configuration_image.png)  
Options that allow to choose how the image will be displayed :

- Image width : the width of the image. This option support variable (beware that it needs to be a number)
- Image height : the height of the image. This option support variable (beware that it needs to be a number)
- Single fill : if the query have a unique result, allow to fill the panel instead of using width and height above
- Alt field : field to use as `alt`. The special value `Use icon field`
  will use the same field as `Icon field`. This is the default value.

## Image tooltip options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/configuration_tooltip.png)  
Options to add and customize a tooltip :

- Include tooltip : a tooltip will be display when the mouse hovers over the image
- Include field : include a field value in the tooltip text
- Tooltip field : select the field values to display in the tooltip. The special value `Use icon field` will use the
  same field as `Icon field`. This is the default value.
- Include date : the tooltip will include the date and time
- As elapsed : the date will be displayed as an elapsed date (i.e. 4h hours ago)

## Overlay options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/configuration_overlay.png)  
Allow adding colored square as overlay on the corner of each image. Color is bound from values. By default, color is
light transparent grey.  
Binding behaves this way :

- If all values declared in binding are numbers AND guess value type from data are also numbers, then it acts like
  grafana's threshold.
- Otherwise, it is a simple mapping.

Note : when leave an input field, values are sorted and empty input are removed.

Options for binding :

- Show overlay : enable or disable overlay.
- Position : select the position of the overlay.
- Width : allow to select the width of the overlay (in pixel or percent of the image size).
- Height : allow to select the height of the overlay (in pixel or percent of the image size).
- Overlay field : select the data field to use for binding (time fields are removed).
- Binding : allow to choose the color for each values. Allow also to choose color for unmapped values.

# Screenshot

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/screenshot01.png)
![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/screenshot02.png)
![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/screenshot03.png)
![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/screenshot04.png)

# Install

Follow instructions
from [grafana plugin web page](https://grafana.com/grafana/plugins/dalvany-image-panel/?tab=installation)

# TODO

- Use the same tooltip as graph panel
- Auto select first field instead of having a 'First non time field'

# License

- Color binding component is a modification of grafana's ThresholdsEditor thus under Apache 2.0 license.

# Credits

Logo for the plugin was found [here](https://www.iconfinder.com/icons/211677/image_icon) and is under MIT license.  
Github workflows are from [grafana](https://github.com/grafana/plugin-workflows) and under Apache 2.0 license

# Plugin development : resources

* [Documentation](https://grafana.com/docs/grafana/latest/developers/plugins/?pg=docs)
* ["Storybook"](https://developers.grafana.com/ui/latest/index.html)