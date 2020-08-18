import {FieldOverrideContext, getFieldDisplayName, PanelPlugin} from '@grafana/data';
import {DynamicImageOptions} from './types';
import {DynamicImagePanel} from './DynamicImagePanel';


function listFields(context: FieldOverrideContext, first: any) {
    const options = [first] as any;

    if (context && context.data) {
        for (const frame of context.data) {
            for (const field of frame.fields) {
                const name = getFieldDisplayName(field, frame, context.data);
                options.push({value: name, label: name});
            }
        }
    }

    return options;
}

export const plugin = new PanelPlugin<DynamicImageOptions>(DynamicImagePanel).setPanelOptions(builder => {
    // Instead of using builder, use custom editor ? It will allow to select the first field in the 'select' component
    // https://github.com/grafana/grafana/blob/master/public/app/core/components/TransformersUI/SeriesToFieldsTransformerEditor.tsx
    // https://github.com/grafana/grafana/blob/master/public/app/plugins/panel/stat/types.ts#L65
    return builder.addTextInput({
        path: "baseUrl",
        name: "Base URL",
        description: "First part of the URL",
        category: ["URL"]
    }).addSelect({
        path: "icon_field",
        name: "Icon field",
        description: "Field value to use in the URL",
        settings: {
            allowCustomValue: false,
            options: [],
            getOptions: async (context: FieldOverrideContext) => {
                // From https://github.com/grafana/grafana/blob/d526647005d8fcba85a02b4de70a10c689726d16/public/app/plugins/panel/stat/types.ts#L89
                return Promise.resolve(listFields(context, {value: '', label: 'First non time field'}));
            },
        },
        // I don't know how I can get the first non time field here, so I put a
        // "First non time value" on options in 'listFields' function and default
        // to this 'special' value
        defaultValue: '',
        category: ["URL"]
    }).addTextInput({
        path: "suffix",
        name: "Suffix",
        description: "To append at the end of the URL",
        category: ["URL"]
    }).addNumberInput({
        path: "width",
        name: "Image width",
        description: "Image width in pixel (potentially ignored if 'single fill')",
        defaultValue: 75,
        category: ["Image options"]
    }).addNumberInput({
        path: "height",
        name: "Image height",
        description: "Image height in pixel (potentially ignored if 'single fill')",
        defaultValue: 75,
        category: ["Image options"]
    }).addBooleanSwitch({
        path: "singleFill",
        name: "Single fill",
        description: "If there is a single image, it will try to fill panel",
        defaultValue: true,
        category: ["Image options"]
    }).addSelect({
        path: "alt_field",
        name: "Alt field",
        description: "Field value that is displayed if image doesn't exists",
        settings: {
            allowCustomValue: false,
            options: [],
            getOptions: async (context: FieldOverrideContext) => {
                return Promise.resolve(listFields(context, {value: '', label: 'Use icon field'}));
            },
        },
        defaultValue: '',
        category: ["Image options"]
    }).addBooleanSwitch({
        path: "tooltip",
        name: "Include tooltip",
        description: "Image have a tooltip",
        defaultValue: false,
        category: ["Image tooltip options"]
    }).addBooleanSwitch({
        path: "tooltip_include_field",
        name: "Include field",
        description: "Include a field value in tooltip text",
        defaultValue: true,
        showIf: currentConfig => currentConfig.tooltip,
        category: ["Image tooltip options"]
    }).addSelect({
        path: "tooltip_field",
        name: "Tooltip field",
        description: "Field value, if any, to include in the tooltip text",
        settings: {
            allowCustomValue: false,
            options: [],
            getOptions: async (context: FieldOverrideContext) => {
                return Promise.resolve(listFields(context, {value: '', label: 'Use icon field'}));
            },
        },
        defaultValue: '',
        showIf: currentConfig => currentConfig.tooltip && currentConfig.tooltip_include_field,
        category: ["Image tooltip options"]
    }).addBooleanSwitch({
        path: "tooltip_include_date",
        name: "Include date",
        description: "Include the date, if any, in tooltip text",
        defaultValue: false,
        showIf: currentConfig => currentConfig.tooltip,
        category: ["Image tooltip options"]
    }).addBooleanSwitch({
        path: "tooltip_date_elapsed",
        name: "As elapsed",
        description: "Display as elapsed date",
        defaultValue: false,
        showIf: currentConfig => currentConfig.tooltip && currentConfig.tooltip_include_date,
        category: ["Image tooltip options"]
    });
});
