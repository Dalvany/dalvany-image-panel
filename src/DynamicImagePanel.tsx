import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { DynamicImageOptions } from './types';
// @ts-ignore
import TimeSeries from 'grafana/app/core/time_series';
interface Props extends PanelProps<DynamicImageOptions> { }
import './css/image.css';

export class DynamicImagePanel extends PureComponent<Props> {
  render() {
    const { options, width, height, data } = this.props;
    console.log("width = " + width + " - height = " + height)
    if (!data) {
      return (
        <div className="panel-empty">
          <p>No data found in response</p>
        </div>
      )
    }
    if (data.error) {
      console.error(data.error.message)
      return (
        <div className="panel-empty">
          <p>Error</p>
        </div>
      )
    }
    if (options.field == '') {
      return (
        <div className="panel-empty">
          <p>No field selected (check query)</p>
        </div>
      )
    }

    let icon: string = "";
    for (const tmp of data.series) {
      for (const tmp2 of tmp.fields) {
        if (tmp2.name == options.field) {
          // Last data
          icon = tmp2.values.get(tmp2.values.length - 1)
        }
      }
    }

    if (!icon || /^\s*$/.test(icon)) {
      return (
        <div className="panel-empty">
          <p>No data found in response</p>
        </div>
      )
    }

    var url = options.baseUrl + icon + options.suffix
    return (
      <div className="image-panel">
        <img src={url} />
      </div>
    )
  }
}
