import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { DynamicImageOptions } from './types';
import { FieldType } from '@grafana/data';

// @ts-ignore
import { TimeSeries } from 'grafana/app/core/time_series';
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

    let names: string[] = []
    for (const tmp of data.series) {
      for (const tmp2 of tmp.fields) {
        if (tmp2.type != FieldType.time && names.length == 0) {
          for (const name of tmp2.values.toArray()) {
            names.push(name)
          }
        }
      }
    }

    if (!names || names.length == 0) {
      return (
        <div className="panel-empty">
          <p>No data found in response</p>
        </div>
      )
    }

    if (options.singleFill && names.length == 1) {
      return (
        <div className="image-container full">
          <img src={options.baseUrl + names[0] + options.suffix} alt={names[0]} />
        </div>
      )
    }

    return (
      <div className="container">
        {names.map(name => {
          return (
            <img src={options.baseUrl + name + options.suffix} style={{ width: options.width + "px", height: options.height + "px" }} alt={name} />
          )
        })}
      </div>
    )
  }
}
