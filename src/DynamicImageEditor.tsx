import React, { PureComponent } from 'react';
import { FormField } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';

import { DynamicImageOptions } from './types';

export class DynamicImageEditor extends PureComponent<PanelEditorProps<DynamicImageOptions>> {
  onBaseUrlChange = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, baseUrl: target.value });
  };

  onSuffixChange = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, suffix: target.value });
  };

  render() {
    const { options } = this.props;
    return (
      <div className="editor-row">
        <div className="panel-options-group">
          <div className="panel-options-group__header">
            <span className="panel-options-group__title">General</span>
          </div>
          <div className="panel-options-group__body">
            <FormField label="Base URL" labelWidth={8} inputWidth={30} type="text" onChange={this.onBaseUrlChange} value={options.baseUrl || ''} />
            <FormField label="Suffix" labelWidth={8} inputWidth={10} type="text" onChange={this.onSuffixChange} value={options.suffix || ''} />
          </div>
        </div>
      </div>
    );
  }
}
