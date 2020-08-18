# Grafana image panel

Display an image by concatenation of an URL, a metric and a suffix.  
The result will be : baseURL + icon field + suffix.  
# Configuration

If queries select multiple fields, use the outer join transform.

## URL

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/configuration_url.png)  
Options for building image URL :

-   Base URL (optional) : the start of the URL where to fetch image. Can be left empty if `icon field` already contains the
    base URL.
-   Icon field : field that contains the name of the image. The special value
    `First non time field` will use the first non time field it finds. This is
    the default value.
-   Suffix (optional) : string to add at the end.

## Image options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/configuration_image.png)  
Options that allow to choose how the image will be displayed :

-   Image width : the width of the image
-   Image height : the height of the image
-   Single fill : if the query have a unique result, allow to fill the panel instead
    of using width and height above
-   Alt field : field to use as `alt`. The special value `Use icon field`
    will use the same field as `Icon field`. This is the default value.

## Image tooltip options

![configuration panel](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/configuration_tooltip.png)  
Options to add and customize a tooltip :

-   Include tooltip : a tooltip will be display when the mouse hover over the image
-   Include field : include a field value in the tooltip text
-   Tooltip field : select the field values to display in the tooltip. The
    special value `Use icon field` will use the same field as `Icon field`. This
    is the default value.
-   Include date : the tooltip will include the date and time
-   As elapsed : the date will be displayed as an elapsed date (ie. 4h hours ago)

# Screenshot

![screenshot](https://github.com/Dalvany/dalvany-image-panel/raw/master/src/img/screenshot.png)

# Build

        yarn install
        yarn build

# Install

Follow instructions from [grafana plugin web page](https://grafana.com/grafana/plugins/dalvany-image-panel/installation)

# Changelog

## 2.2.0

-   Base URL and suffix are optional

## 2.1.1

-   Change default values for tooltip and date inclusion

## 2.1.0

-   Allow to select a field to use as `alt` image attribute
-   Add a configurable Tooltip

# TODO

-   Use the same tooltip as graph panel
-   Auto select first field instead of having a 'First non time field'

# Credits

Logo for the plugin was found [here](https://www.iconfinder.com/icons/211677/image_icon) and is under MIT license.
