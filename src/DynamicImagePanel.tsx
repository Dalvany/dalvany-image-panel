import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { DynamicImageOptions } from './types';
// @ts-ignore
import TimeSeries from 'grafana/app/core/time_series';
import './css/image.css';

interface Props extends PanelProps<DynamicImageOptions> { }

export class DynamicImagePanel extends PureComponent<Props> {

  render() {
    const { options, data } = this.props;
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

    let urls: string[] = []
    for (const tmp of data.series) {
      for (const tmp2 of tmp.fields) {
        if (tmp2.name == options.field) {
          for (const name of tmp2.values.toArray()) {
            urls.push(options.baseUrl + name + options.suffix)
          }
        }
      }
    }

    if (!urls || urls.length == 0) {
      return (
        <div className="panel-empty">
          <p>No data found in response</p>
        </div>
      )
    }

    if (options.singleFill && urls.length == 1) {
      return (
        <div className="image-container full">
          <img src={urls[0]} />
        </div>
      )
    }
    //var url = options.baseUrl + icon + options.suffix
    return (
      <div className="container">
        {urls.map(url => {
          return (
            <img src={url} style={{ width: options.width + "px", height: options.height + "px" }} />
          )
        })}
      </div>
    )
  }
}
