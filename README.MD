# Grafana image panel

Display an image by concatenation of an URL, a metric and a suffix.  
The result will be : baseURL + metric + suffix.  

# Configuration

![configuration panel](src/img/configuration.png)

-   Base URL : the start of the URL where to fetch image
-   Suffix : string to add at the end
-   Image field : allow to select which field contains the image name if the query
    result has multiple fields
-   Image width : the width of the image
-   Image height : the height of the image
-   Single fill : if the query have a unique result, allow to fill the panel instead
    of using width and height above

# Screenshot

![screenshot](src/img/screenshot.png)

# Build

        yarn install
        yarn build

# Install

Unzip a release file and rename the extracted folder with `dalvany-image-panel`
For docker, use GF_INSTALL_PLUGINS environment, eg : `GF_INSTALL_PLUGINS: https://github.com/Dalvany/dalvany-image-panel/archive/v1.2.1.zip;dalvany-image-panel`

# Credits

Logo for the plugin was found [here](https://www.iconfinder.com/icons/211677/image_icon) and is under MIT license.
