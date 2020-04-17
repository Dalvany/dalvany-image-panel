import { PanelPlugin } from '@grafana/data';
import { DynamicImageOptions, defaults } from './types';
import { DynamicImagePanel } from './DynamicImagePanel';
import { DynamicImageEditor } from './DynamicImageEditor';

export const plugin = new PanelPlugin<DynamicImageOptions>(DynamicImagePanel).setDefaults(defaults).setEditor(DynamicImageEditor);
