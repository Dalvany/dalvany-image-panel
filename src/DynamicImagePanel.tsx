import React, { PureComponent } from 'react';
import { dateTimeFormat, dateTimeFormatTimeAgo, Field, FieldType, PanelProps } from '@grafana/data';
import { DynamicImageOptions } from './types';
// @ts-ignore
import './css/image.css';

interface Props extends PanelProps<DynamicImageOptions> {}

export interface Value {
  icon: string;
  alt: string;
  tooltip: string;
}

export class DynamicImagePanel extends PureComponent<Props> {
  getFieldIndex(field: string, fields: Field[]): number {
    for (let i = 0; i < fields.length; i++) {
      if (
        (fields[i].type !== FieldType.time && field === '') ||
        field === fields[i].name ||
        field === fields[i].labels?.name
      ) {
        return i;
      }
    }
    return -1;
  }

  getTimeFieldIndex(fields: Field[]): number {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].type === FieldType.time) {
        return i;
      }
    }
    return -1;
  }

  render() {
    const { options, data } = this.props;

    if (!data || data.series.length === 0) {
      console.error('data is empty or null');
      return (
        <div className="panel-empty">
          <p>No data found in response.</p>
        </div>
      );
    }
    if (data.error) {
      console.error('Message : ' + data.error.message);
      return (
        <div className="panel-empty">
          <p>Error. See javascript console for more precision</p>
        </div>
      );
    }

    const number_series = data.series.length;
    if (number_series > 1) {
      console.error(data.series.length + ' timeseries (see series in debug)');
      for (let i = 0; i < data.series.length; i++) {
        console.error('Serie ' + i + ' : ' + data.series[i].name);
      }
      return (
        <div className="panel-empty">
          <p>There's multiple time series. Use the outer join transform.</p>
        </div>
      );
    }

    // Here we should have 1 timeserie...
    const max = data.series[0].fields[0].values.length;

    // Find icon field
    let icon_index = this.getFieldIndex(options.icon_field, data.series[0].fields);
    if (icon_index === -1) {
      if (options.icon_field === '') {
        console.error('Missing non time field from data (see series in debug)');
        return (
          <div className="panel-empty">
            <p>Can't find a non time field for image.</p>
          </div>
        );
      } else {
        console.error("Missing field '" + options.icon_field + "' from data (see series in debug)");
        return (
          <div className="panel-empty">
            <p>Can't find {options.icon_field} field for image.</p>
          </div>
        );
      }
    }

    // Find alt field
    let alt_index =
      options.alt_field === '' ? icon_index : this.getFieldIndex(options.alt_field, data.series[0].fields);
    if (alt_index === -1) {
      console.error("Missing field '" + options.alt_field + "' from data for alt (see series in debug)");
      return (
        <div className="panel-empty">
          <p>Can't find {options.alt_field} field for alt.</p>
        </div>
      );
    }

    // Find tooltip field (if no tooltip use icon field as we don't care about values)
    let tooltip_index =
      options.tooltip && options.tooltip_include_field && options.tooltip_field !== ''
        ? this.getFieldIndex(options.tooltip_field, data.series[0].fields)
        : icon_index;
    if (tooltip_index === -1) {
      console.error("Missing field '" + options.tooltip_field + "' from data for tooltip (see series in debug)");
      return (
        <div className="panel-empty">
          <p>Can't find {options.tooltip_field} field for tooltip.</p>
        </div>
      );
    }

    // Find time field for tooltip (if no tooltip or if it doesn't include time, use icon field as we don't care about values)
    let time_index =
      options.tooltip && options.tooltip_include_date ? this.getTimeFieldIndex(data.series[0].fields) : icon_index;
    if (time_index === -1) {
      console.error('Missing time field from data for tooltip (see series in debug)');
      return (
        <div className="panel-empty">
          <p>Can't find time field for tooltip.</p>
        </div>
      );
    }

    let values: Value[] = [];
    for (let i = 0; i < max; i++) {
      let t = '';
      if (options.tooltip && options.tooltip_include_date) {
        if (options.tooltip_date_elapsed) {
          t = dateTimeFormatTimeAgo(data.series[0].fields[time_index].values.get(i));
        } else {
          t = dateTimeFormat(data.series[0].fields[time_index].values.get(i), { timeZone: 'browser' });
        }
      }
      if (options.tooltip && options.tooltip_include_field) {
        if (t !== '') {
          t = t + ' - ';
        }
        t = t + data.series[0].fields[tooltip_index].values.get(i);
      }
      values.push({
        icon: data.series[0].fields[icon_index].values.get(i),
        alt: data.series[0].fields[alt_index].values.get(i),
        tooltip: t,
      });
    }

    let start = options.baseUrl === undefined ? '' : options.baseUrl;
    start = this.props.replaceVariables(start);
    let end = options.suffix === undefined ? '' : options.suffix;
    end = this.props.replaceVariables(end);

    if (!values || values.length === 0) {
      console.error('Serie contains no values (see series in debug)');
      return (
        <div className="panel-empty">
          <p>No data found in response.</p>
        </div>
      );
    }

    if (options.singleFill && values.length === 1) {
      if (options.tooltip) {
        return (
          <div className="image-container full">
            <img src={start + values[0].icon + end} alt={values[0].alt} title={values[0].tooltip} />
          </div>
        );
      } else {
        return (
          <div className="image-container full">
            <img src={start + values[0].icon + end} alt={values[0].alt} />
          </div>
        );
      }
    }

    let w = Number(this.props.replaceVariables(options.width));
    let h = Number(this.props.replaceVariables(options.height));

    return (
      <div className="container">
        {values.map((value) => {
          if (options.tooltip) {
            return (
              <img
                src={start + value.icon + end}
                style={{ width: w + 'px', height: h + 'px', pointerEvents: 'auto' }}
                alt={value.alt}
                title={value.tooltip}
              />
            );
          } else {
            return <img src={start + value.icon + end} style={{ width: w + 'px', height: h + 'px' }} alt={value.alt} />;
          }
        })}
      </div>
    );
  }
}
