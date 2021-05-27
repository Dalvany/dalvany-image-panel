# Changelog

## 2.3.0

- Add a gap between image.
- Add an underline.
- Fix tooltip.
- Fix image size when single fill enable
- Allow using variable for `base URL`, `Suffix`, `Image width` and `Image height`.
- Now when something is wrong an error is thrown instead of displaying a div. This will cause grafana to display the
  error in the top left corner of the panel.
- When an image fail to load, a warning is logged containing the url
  see [#11](https://github.com/Dalvany/dalvany-image-panel/issues/11).
- Possibility to add a square as overlay over pictures. Color can be chosen with a mapping for field values.

Note : if new options doesn't show up or plugin seems in an older version, please uninstall, reinstall and then restart
grafana (or if using docker, run a new container using the latest version of the plugin in GF_INSTALL_PLUGINS env
variable)  
Note : to solve error "e.replace is not a function", go to the panel options then re-enter a width and an height for the
image size. Or in "Inspect->Panel JSON" check that height and width properties in the `options` are string instead of numbers.

## 2.2.0

- Base URL and suffix are optional.

## 2.1.1

- Change default values for tooltip and date inclusion.

## 2.1.0

- Allow to select a field to use as `alt` image attribute.
- Add a configurable Tooltip.
