import { PanelPlugin } from '@grafana/data';
import { DynamicImageOptions, defaults } from './types';
import { DynamicImagePanel } from './DynamicImagePanel';

export const plugin = new PanelPlugin<DynamicImageOptions>(DynamicImagePanel).setDefaults(defaults).setPanelOptions(builder => {
  return builder.addTextInput({
    path: "baseUrl",
    name: "Base URL",
    description: "First part of the URL"
  }).addTextInput({
    path: "suffix",
    name: "Suffix",
    description: "To append at the end of the URL"
  }).addNumberInput({
    path: "width",
    name: "Image width",
    description: "Image width in pixel (potentially ignored if 'single fill')"
  }).addNumberInput({
    path: "height",
    name: "Image height",
    description: "Image height in pixel (potentially ignored if 'single fill')"
  }).addBooleanSwitch({
    path: "singleFill",
    name: "Single fill",
    description: "If there is a single image, it will try to fill panel"
  });
});
