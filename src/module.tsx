import { FieldOverrideContext, FieldType, getFieldDisplayName, PanelPlugin } from '@grafana/data';
import { DynamicImageOptions, Position, UNBOUNDED_DEFAULT_COLOR } from './types';
import { DynamicImagePanel } from './DynamicImagePanel';
import { BindingEditor, SizeEditor } from './OverlayConfigEditor';

function listFields(context: FieldOverrideContext, first?: any) {
  const options = [first] as any;

  if (context && context.data) {
    for (const frame of context.data) {
      for (const field of frame.fields) {
        const name = getFieldDisplayName(field, frame, context.data);
        options.push({ value: name, label: name });
      }
    }
  }

  return options;
}

function listFieldsNew(context: FieldOverrideContext, includeTime: boolean, first?: any) {
  const options = [] as any;

  if (first !== undefined) {
    options.push(first);
  }

  if (context && context.data) {
    for (const frame of context.data) {
      for (const field of frame.fields) {
        if (includeTime || field.type !== FieldType.time) {
          const name = getFieldDisplayName(field, frame, context.data);
          //const t = guessFieldTypeForField(field);
          options.push({ value: name, label: name });
        }
      }
    }
  }

  return options;
}

export const plugin = new PanelPlugin<DynamicImageOptions>(DynamicImagePanel).setPanelOptions((builder) => {
  // Instead of using builder, use custom editor ? It will allow to select the first field in the 'select' component
  // https://github.com/grafana/grafana/blob/master/public/app/core/components/TransformersUI/SeriesToFieldsTransformerEditor.tsx
  // https://github.com/grafana/grafana/blob/master/public/app/plugins/panel/stat/types.ts#L65
  return builder
    .addTextInput({
      path: 'baseUrl',
      name: 'Base URL',
      description: 'First part of the URL',
      category: ['URL'],
    })
    .addSelect({
      path: 'icon_field',
      name: 'Icon field',
      description: 'Field value to use in the URL',
      settings: {
        allowCustomValue: false,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          // From https://github.com/grafana/grafana/blob/d526647005d8fcba85a02b4de70a10c689726d16/public/app/plugins/panel/stat/types.ts#L89
          return Promise.resolve(listFields(context, { value: '', label: 'First non time field' }));
        },
      },
      // I don't know how I can get the first non time field here, so I put a
      // "First non time value" on options in 'listFields' function and default
      // to this 'special' value
      defaultValue: '',
      category: ['URL'],
    })
    .addTextInput({
      path: 'suffix',
      name: 'Suffix',
      description: 'To append at the end of the URL',
      category: ['URL'],
    })
    .addTextInput({
      path: 'width',
      name: 'Image width',
      description: "Image width in pixel (potentially ignored if 'single fill')",
      defaultValue: '75',
      category: ['Image options'],
    })
    .addTextInput({
      path: 'height',
      name: 'Image height',
      description: "Image height in pixel (potentially ignored if 'single fill')",
      defaultValue: '75',
      category: ['Image options'],
    })
    .addBooleanSwitch({
      path: 'slideshow.enable',
      name: 'Enable slideshow',
      description: 'Display images in a slideshow',
      defaultValue: false,
      category: ['Slideshow'],
    })
    .addNumberInput({
      path: 'slideshow.duration',
      name: 'Duration',
      description: 'How long an image will be display (in milliseconds)',
      defaultValue: 5000,
      showIf: (currentConfig) => currentConfig.slideshow.enable,
      category: ['Slideshow'],
    })
    .addBooleanSwitch({
      path: 'slideshow.pauseOnHover',
      name: 'Pause on hover',
      description: "Don't change image when the mouse is over",
      defaultValue: true,
      showIf: (currentConfig) => currentConfig.slideshow.enable,
      category: ['Slideshow'],
    })
    .addBooleanSwitch({
      path: 'singleFill',
      name: 'Single fill',
      description: 'If there is a single image or slideshow is enabled, it will try to fill panel',
      defaultValue: true,
      category: ['Image options'],
    })
    .addSelect({
      path: 'alt_field',
      name: 'Alt field',
      description: "Field value that is displayed if image doesn't exists",
      settings: {
        allowCustomValue: false,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          return Promise.resolve(listFields(context, { value: '', label: 'Use icon field' }));
        },
      },
      defaultValue: '',
      category: ['Image options'],
    })
    .addBooleanSwitch({
      path: 'tooltip',
      name: 'Include tooltip',
      description: 'Image have a tooltip',
      defaultValue: false,
      category: ['Image tooltip options'],
    })
    .addBooleanSwitch({
      path: 'tooltip_include_field',
      name: 'Include field',
      description: 'Include a field value in tooltip text',
      defaultValue: true,
      showIf: (currentConfig) => currentConfig.tooltip,
      category: ['Image tooltip options'],
    })
    .addSelect({
      path: 'tooltip_field',
      name: 'Tooltip field',
      description: 'Field value, if any, to include in the tooltip text',
      settings: {
        allowCustomValue: false,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          return Promise.resolve(listFields(context, { value: '', label: 'Use icon field' }));
        },
      },
      defaultValue: '',
      showIf: (currentConfig) => currentConfig.tooltip && currentConfig.tooltip_include_field,
      category: ['Image tooltip options'],
    })
    .addBooleanSwitch({
      path: 'tooltip_include_date',
      name: 'Include date',
      description: 'Include the date, if any, in tooltip text',
      defaultValue: false,
      showIf: (currentConfig) => currentConfig.tooltip,
      category: ['Image tooltip options'],
    })
    .addBooleanSwitch({
      path: 'tooltip_date_elapsed',
      name: 'As elapsed',
      description: 'Display as elapsed date',
      defaultValue: false,
      showIf: (currentConfig) => currentConfig.tooltip && currentConfig.tooltip_include_date,
      category: ['Image tooltip options'],
    })
    .addBooleanSwitch({
      path: 'open_url.enable',
      name: 'Click to open',
      description: 'The image is clickable and can open an URL in a new tab',
      defaultValue: false,
      category: ['Link'],
    })
    .addTextInput({
      path: 'open_url.base_url',
      name: 'Base URL',
      description: 'First part of the URL',
      showIf: (currentConfig) => currentConfig.open_url.enable,
      defaultValue: '',
      category: ['Link'],
    })
    .addSelect({
      path: 'open_url.metric_field',
      name: 'Link field',
      description: 'Field value to use in the link.',
      settings: {
        allowCustomValue: false,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          return Promise.resolve(listFields(context, { value: '', label: "Don't use a field" }));
        },
      },
      defaultValue: '',
      showIf: (currentConfig) => currentConfig.open_url.enable,
      category: ['Link'],
    })
    .addTextInput({
      path: 'open_url.suffix',
      name: 'Suffix',
      description: 'To append at the end of the URL',
      defaultValue: '',
      showIf: (currentConfig) => currentConfig.open_url.enable,
      category: ['Link'],
    })
    .addSelect({
      path: 'overlay.field',
      name: 'Overlay field',
      description: 'Field to use for color mapping',
      defaultValue: '',
      settings: {
        allowCustomValue: false,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          return Promise.resolve(listFieldsNew(context, false, { value: '', label: 'No overlay' }));
        },
      },
      category: ['Overlay'],
    })
    .addSelect({
      path: 'overlay.position',
      name: 'Position',
      description: 'Position of the overlay',
      defaultValue: Position.TOP_RIGHT,
      settings: {
        allowCustomValue: false,
        options: [
          { value: Position.TOP_LEFT, label: Position.TOP_LEFT },
          { value: Position.TOP_RIGHT, label: Position.TOP_RIGHT },
          { value: Position.BOTTOM_LEFT, label: Position.BOTTOM_LEFT },
          { value: Position.BOTTOM_RIGHT, label: Position.BOTTOM_RIGHT },
        ],
      },
      showIf: (currentConfig) => currentConfig.overlay.field !== '',
      category: ['Overlay'],
    })
    .addCustomEditor({
      editor: SizeEditor,
      id: 'overlay.width',
      name: 'Width',
      path: 'overlay.width',
      description: 'Width of the overlay',
      defaultValue: {
        size: 5,
        unit: '%',
      },
      showIf: (currentConfig) => currentConfig.overlay.field !== '',
      category: ['Overlay'],
    })
    .addCustomEditor({
      editor: SizeEditor,
      id: 'overlay.height',
      name: 'Height',
      path: 'overlay.height',
      description: 'Height of the overlay',
      defaultValue: {
        size: 5,
        unit: '%',
      },
      showIf: (currentConfig) => currentConfig.overlay.field !== '',
      category: ['Overlay'],
    })
    .addCustomEditor({
      id: 'overlay.bindings',
      path: 'overlay.bindings',
      name: 'Binding',
      description: 'Set color mapping for overlay (act as threshold if data are numbers)',
      defaultValue: {
        bindings: [],
        unbounded: UNBOUNDED_DEFAULT_COLOR,
        has_text: true,
      },
      editor: BindingEditor,
      showIf: (currentConfig) => currentConfig.overlay.field !== '' && currentConfig.overlay.field !== undefined,
      category: ['Overlay'],
    })
    .addSelect({
      path: 'underline.field',
      name: 'Underline field',
      description: 'Field to use for as underline',
      defaultValue: '',
      settings: {
        allowCustomValue: false,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          return Promise.resolve(listFieldsNew(context, false, { value: '', label: 'No underline' }));
        },
      },
      category: ['Underline'],
    })
    .addTextInput({
      path: 'underline.text_size',
      name: 'Text size',
      description: 'Add a field value as underline',
      defaultValue: '14',
      category: ['Underline'],
    });
});
