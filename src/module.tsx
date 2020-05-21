import { PanelPlugin } from '@grafana/data';
import { DynamicImageOptions, defaults } from './types';
import { DynamicImagePanel } from './DynamicImagePanel';

export const plugin = new PanelPlugin<DynamicImageOptions>(DynamicImagePanel).setPanelOptions(builder => {
  return builder.addTextInput({
    path: "baseUrl",
    name: "Base URL",
    description: "First part of the URL",
    defaultValue: defaults.baseUrl
  }).addTextInput({
    path: "suffix",
    name: "Suffix",
    description: "To append at the end of the URL",
    defaultValue: defaults.suffix
  }).addNumberInput({
    path: "width",
    name: "Image width",
    description: "Image width in pixel (potentially ignored if 'single fill')",
    defaultValue: defaults.width
  }).addNumberInput({
    path: "height",
    name: "Image height",
    description: "Image height in pixel (potentially ignored if 'single fill')",
    defaultValue: defaults.height
  }).addBooleanSwitch({
    path: "singleFill",
    name: "Single fill",
    description: "If there is a single image, it will try to fill panel",
    defaultValue: defaults.singleFill
  });
});
