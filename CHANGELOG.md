# Changelog

## Next version

- Fix license link to point to main branch instead of old master
- Upgrade minimum grafana version to 9.0.0

## 2.8.0

- Display `No data` like other panels instead of an alert ([#68](https://github.com/Dalvany/dalvany-image-panel/issues/68) thanks to @dazzatronic).
- Change license to MIT.

## 2.7.0

- Add a toogle to enable/disable infinite slideshow ([#65](https://github.com/Dalvany/dalvany-image-panel/issues/65) thanks to @dpooley).

## 2.6.0

- Support for "shared crosshair". Image background and border will according to
the configured colores (default to #FFFFFF10 for background and #FFFFFF20 for border)
([#16](https://github.com/Dalvany/dalvany-image-panel/issues/16) [#51](https://github.com/Dalvany/dalvany-image-panel/issues/51)).
- Support for shared tooltip ([#52](https://github.com/Dalvany/dalvany-image-panel/issues/52)).
- Use grafana tooltip instead of title attribute when slideshow is disabled (to make shared tooltip working).
- Hoovering over an image will now use "Shared crosshair" options.
- Require at least Grafana 8.5.0.
- Errors are shown in the panel instead of throwing an error, this avoids to refresh while configuring panels
([#57](https://github.com/Dalvany/dalvany-image-panel/issues/57)).
- When adding a new binding, it will get focus ([#60](https://github.com/Dalvany/dalvany-image-panel/issues/60)).
- Can now choose to open link in new tab or not. ([#62](https://github.com/Dalvany/dalvany-image-panel/issues/62))

## 2.5.0

- Allow to choose underline horizontal alignment ([#46](https://github.com/Dalvany/dalvany-image-panel/issues/46)).
- Allow to map underline text color based on metric value ([#46](https://github.com/Dalvany/dalvany-image-panel/issues/46)).

## 2.4.0

- Allow to open an URL by clicking on the image [#33](https://github.com/Dalvany/dalvany-image-panel/issues/33).
- Multiple image can now see with a slideshow [#35](https://github.com/Dalvany/dalvany-image-panel/issues/35).

## 2.3.0

- Add a gap between image.
- Add an underline.
- Fix tooltip [#15](https://github.com/Dalvany/dalvany-image-panel/issues/15).
- Fix image size when single fill enable
- Allow using variable for `base URL`, `Suffix`, `Image width` and `Image height` [#14](https://github.com/Dalvany/dalvany-image-panel/issues/14).
- Now when something is wrong an error is thrown instead of displaying a div. This will cause grafana to display the
  error in the top left corner of the panel.
- When an image fail to load, a warning is logged containing the url
  see [#11](https://github.com/Dalvany/dalvany-image-panel/issues/11).
- Possibility to add a square as overlay over pictures. Color can be chosen with a mapping for field values [#19](https://github.com/Dalvany/dalvany-image-panel/issues/19).
- Fix gap [#31](https://github.com/Dalvany/dalvany-image-panel/issues/31)

Note : if new options doesn't show up or plugin seems in an older version, please uninstall, reinstall and then restart
grafana (or if using docker, run a new container using the latest version of the plugin in GF_INSTALL_PLUGINS env
variable)

## 2.2.0

- Base URL and suffix are optional.

## 2.1.1

- Change default values for tooltip and date inclusion.

## 2.1.0

- Allow to select a field to use as `alt` image attribute.
- Add a configurable Tooltip.
