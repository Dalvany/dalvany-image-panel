import React, { PureComponent } from 'react';
import { dateTimeFormat, dateTimeFormatTimeAgo, Field, FieldType, PanelProps } from '@grafana/data';
import { DynamicImageOptions, Position, Size } from './types';
// @ts-ignore
import './css/image.css';

interface Props extends PanelProps<DynamicImageOptions> {}

interface ImageProps {
  /** Image URL **/
  url: string;
  /** Tooltip text, if null no tooltip **/
  tooltip?: string | null;
  /** Alternative **/
  alt: string;
  /** Width in px of the image **/
  width: number;
  /** Height in px of the image **/
  height: number;
  /** Handle 'singleFill' use 100% instead of height and width **/
  useMax: boolean;
  /** Position of the overlay **/
  position: Position;
  /** Size of the overlay **/
  size: Size;
}

export interface Value {
  icon: string;
  alt: string;
  tooltip?: string | null;
}

export class Image extends PureComponent<ImageProps> {
  handleError(e) {
    console.error('Error loading ' + e.target.src);
  }

  render() {
    const { url, tooltip, alt, width, height, useMax, size } = this.props;
    let w = width + 'px';
    if (useMax) {
      w = '100%';
    }
    let h = height + 'px';
    if (useMax) {
      h = '100%';
    }
    if (tooltip === null || tooltip === '') {
      return (
        <div style={{ height: h, width: w, position: 'relative' }}>
          <img
            style={{
              height: '100%',
              width: '100%',
              pointerEvents: 'auto',
              position: 'absolute',
              top: '0',
              left: '0',
            }}
            onError={(e) => this.handleError(e)}
            src={url}
            alt={alt}
          />
          <div style={{ float: 'right', height: size, width: size, backgroundColor: 'red' }} />
        </div>
      );
    }
    return (
      <div style={{ height: h, width: w, position: 'relative' }}>
        <img
          style={{
            height: '100%',
            width: '100%',
            pointerEvents: 'auto',
            position: 'absolute',
            top: '0',
            left: '0',
          }}
          onError={(e) => this.handleError(e)}
          src={url}
          title={tooltip}
          alt={alt}
        />
        <div style={{ float: 'right', height: size, width: size, backgroundColor: 'red' }} />
      </div>
    );
  }
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

  handleError(e) {
    console.error('Error loading ' + e.target.src);
  }

  render() {
    const { options, data } = this.props;

    if (!data || data.series.length === 0) {
      console.error('data is empty or null');
      throw new Error('No data found. Please check your query or datasource');
    }
    if (data.error) {
      console.error('Message : ' + data.error.message);
      throw new Error('Unknown error, see javascript console for more precision');
    }

    const number_series = data.series.length;
    if (number_series > 1) {
      console.error(data.series.length + ' timeseries');
      for (let i = 0; i < data.series.length; i++) {
        console.error('Serie ' + i + ' : ' + data.series[i].name);
      }
      throw new Error("There's multiple time series. Use the outer join transform.");
    }

    // Here we should have 1 timeserie...
    const max = data.series[0].fields[0].values.length;

    // Find icon field
    let icon_index = this.getFieldIndex(options.icon_field, data.series[0].fields);
    if (icon_index === -1) {
      if (options.icon_field === '') {
        console.error('Missing non time field from data');
        throw new Error("Can't find a non time field for image. Please use another field");
      } else {
        console.error("Missing field '" + options.icon_field + "' from data");
        throw new Error("Can't find " + options.icon_field + ' field for image.');
      }
    }

    // Find alt field
    let alt_index =
      options.alt_field === '' ? icon_index : this.getFieldIndex(options.alt_field, data.series[0].fields);
    if (alt_index === -1) {
      console.error("Missing field '" + options.alt_field + "' from data for alt");
      throw new Error("Can't find " + options.alt_field + ' field for alt.');
    }

    // Find tooltip field (if no tooltip use icon field as we don't care about values)
    let tooltip_index =
      options.tooltip && options.tooltip_include_field && options.tooltip_field !== ''
        ? this.getFieldIndex(options.tooltip_field, data.series[0].fields)
        : icon_index;
    if (tooltip_index === -1) {
      console.error("Missing field '" + options.tooltip_field + "' from data for tooltip");
      throw new Error("Can't find " + options.tooltip_field + ' field for tooltip.');
    }

    // Find time field for tooltip (if no tooltip or if it doesn't include time, use icon field as we don't care about values)
    let time_index =
      options.tooltip && options.tooltip_include_date ? this.getTimeFieldIndex(data.series[0].fields) : icon_index;
    if (time_index === -1) {
      console.error('Missing time field from data for tooltip');
      throw new Error("Can't find time field for tooltip.");
    }

    let values: Value[] = [];
    for (let i = 0; i < max; i++) {
      let t = '';
      if (options.tooltip) {
        if (options.tooltip_include_date) {
          if (options.tooltip_date_elapsed) {
            t = dateTimeFormatTimeAgo(data.series[0].fields[time_index].values.get(i));
          } else {
            t = dateTimeFormat(data.series[0].fields[time_index].values.get(i), { timeZone: 'browser' });
          }
        }
        if (options.tooltip_include_field) {
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
      } else {
        values.push({
          icon: data.series[0].fields[icon_index].values.get(i),
          alt: data.series[0].fields[alt_index].values.get(i),
        });
      }
    }

    let start = options.baseUrl === undefined ? '' : options.baseUrl;
    start = this.props.replaceVariables(start);
    let end = options.suffix === undefined ? '' : options.suffix;
    end = this.props.replaceVariables(end);

    if (!values || values.length === 0) {
      console.error('Serie contains no values');
      throw new Error('No data found in response. Please check your query');
    }

    let w = Number(this.props.replaceVariables(options.width));
    let h = Number(this.props.replaceVariables(options.height));

    if (options.singleFill && values.length === 1) {
      return (
        <div className="image-container full">
          <Image
            url={start + values[0].icon + end}
            alt={values[0].alt}
            width={w}
            height={h}
            useMax={true}
            position={options.overlay_position}
            size={options.overlay_size}
            tooltip={values[0].tooltip}
          />
        </div>
      );
    }

    return (
      <div className="container">
        {values.map((value) => {
          return (
            <Image
              url={start + value.icon + end}
              alt={value.alt}
              width={w}
              height={h}
              useMax={false}
              position={options.overlay_position}
              size={options.overlay_size}
              tooltip={value.tooltip}
            />
          );
        })}
      </div>
    );
  }
}
