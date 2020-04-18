import React, { PureComponent } from 'react';
import { FormField, Select, Switch } from '@grafana/ui';
import { PanelEditorProps, FieldType, SelectableValue, PanelData } from '@grafana/data';

import { DynamicImageOptions } from './types';

export class DynamicImageEditor extends PureComponent<PanelEditorProps<DynamicImageOptions>> {
  onBaseUrlChange = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, baseUrl: target.value });
  };

  onSuffixChange = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, suffix: target.value });
  };

  onHeightChange = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, height: target.value });
  };

  onWidthChange = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, width: target.value });
  };

  onFieldChange = (item: SelectableValue<string>) => {
    this.props.onOptionsChange({ ...this.props.options, field: item.value })
  };

  onSwitchFillChange = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, singleFill: !this.props.options.singleFill })
  };

  getSelect(options: DynamicImageOptions, data: PanelData) {
    const opt: SelectableValue<string>[] = [
    ]

    let current: SelectableValue<string> = {};
    if (data && !data.error) {
      for (const tmp of data.series) {
        for (const tmp2 of tmp.fields) {
          if (tmp2.type != FieldType.time) {
            var obj: SelectableValue<string> = {}
            obj.label = tmp2.name
            obj.value = tmp2.name
            opt.push(obj)
            if (options.field == obj.value) {
              current = obj
            }
          }
        }
      }
    }

    if (!current.value && opt && opt[0]) {
      current = {
        label: opt[0].label,
        value: opt[0].value
      }
      options.field = opt[0].value
    }

    return (
      <Select options={opt} value={current} onChange={this.onFieldChange} />
    )
  }

  render() {
    const { options, data } = this.props;

    const select = this.getSelect(options, data)

    return (
      <div className="editor-row">
        <div className="panel-options-group">
          <div className="panel-options-group__header">
            <span className="panel-options-group__title">General</span>
          </div>
          <div className="panel-options-group__body">
            <FormField label="Base URL"
              labelWidth={8}
              inputWidth={30}
              tooltip="First part of the URL"
              type="text"
              onChange={this.onBaseUrlChange}
              value={options.baseUrl} />
            <FormField label="Suffix"
              labelWidth={8}
              inputWidth={10}
              type="text"
              tooltip="To append at the end of the URL"
              onChange={this.onSuffixChange}
              value={options.suffix} />
          </div>
          <div className="panel-options-group__body">
            <FormField label="Image field"
              labelWidth={8}
              inputWidth={10}
              tooltip="Field to use between base URL and suffix"
              inputEl={select} />
            <FormField label="Image width"
              labelWidth={8}
              inputWidth={8}
              type="number"
              tooltip="Image width in pixel (potentially ignored if 'single fill')"
              onChange={this.onWidthChange}
              value={options.width} />
            <FormField label="Image height"
              labelWidth={8}
              inputWidth={8}
              type="number"
              tooltip="Image height in pixel (potentially ignored if 'single fill')"
              onChange={this.onHeightChange}
              value={options.height} />
            <Switch label="Single fill"
              labelClass="width-8"
              tooltip="If there is a single image, it will try to fill panel"
              checked={options.singleFill}
              onChange={this.onSwitchFillChange} />
          </div>
        </div>
      </div>
    );
  }
}
