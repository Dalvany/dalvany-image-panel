import React, { PureComponent } from 'react';
import {
  DataFrame,
  dateTimeFormat,
  dateTimeFormatTimeAgo,
  Field,
  FieldType,
  getFieldDisplayName,
  guessFieldTypeForField,
  PanelProps,
} from '@grafana/data';
import { Bindings, DynamicImageOptions, Position } from './types';
// @ts-ignore
import './css/image.css';
import { Size } from './OverlayConfigEditor';

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
  use_max: boolean;
  /** Show overlay **/
  show_overlay: boolean;
  /** Position of the overlay **/
  overlay_position: Position;
  /** Width of the overlay **/
  overlay_width: Size;
  /** Height of the overlay **/
  overlay_height: Size;
  /** Overlay bindings **/
  overlay_bindings: Bindings;
  /** Overlay field values are numbers ? **/
  overlay_values_are_number: boolean;
  /** Overlay value **/
  overlay_value: string | number | undefined;
}

export interface Value {
  icon: string;
  alt: string;
  tooltip?: string | null;
  overlay?: string | number | undefined;
}

export class Image extends PureComponent<ImageProps> {
  handleError(e) {
    console.warn('Error loading ' + e.target.src);
  }

  findBindingColorFromNumber(value: number): string {
    const { overlay_bindings } = this.props;

    let color = overlay_bindings.unbounded;
    for (let i = 0; i < overlay_bindings.bindings.length; i++) {
      if (value >= overlay_bindings.bindings[i].value) {
        color = overlay_bindings.bindings[i].color;
      } else {
        // Stop now
        break;
      }
    }

    return color;
  }

  findBindingColorFromString(value: string): string {
    const { overlay_bindings } = this.props;

    let color = overlay_bindings.unbounded;
    for (let i = 0; i < overlay_bindings.bindings.length; i++) {
      if (value === overlay_bindings.bindings[i].value) {
        color = overlay_bindings.bindings[i].color;
        // Stop now
        break;
      }
    }

    return color;
  }

  render() {
    const {
      url,
      tooltip,
      alt,
      width,
      height,
      use_max,
      show_overlay,
      overlay_width,
      overlay_height,
      overlay_position,
      overlay_bindings,
      overlay_values_are_number,
      overlay_value,
    } = this.props;
    let w = width + 'px';
    if (use_max) {
      w = '100%';
    }
    let h = height + 'px';
    if (use_max) {
      h = '100%';
    }

    let va = 'top-overlay';
    let cl = 'right-overlay';
    if (overlay_position === Position.TOP_LEFT || overlay_position === Position.BOTTOM_LEFT) {
      cl = 'left-overlay';
    }
    if (overlay_position === Position.BOTTOM_LEFT || overlay_position === Position.BOTTOM_RIGHT) {
      va = 'bottom-overlay';
    }

    let ow = (overlay_width?.size ?? '5') + (overlay_width?.unit ?? '%');
    let oh = (overlay_height?.size ?? '5') + (overlay_height?.unit ?? '%');

    // Handles overlay...
    let overlay_color: string | undefined = undefined;
    let bindings_contains_string = true;
    if (show_overlay) {
      overlay_color = overlay_bindings.unbounded;
      bindings_contains_string = overlay_bindings.has_text;

      // Find binding colors...
      if (!bindings_contains_string && overlay_values_are_number && overlay_value !== undefined) {
        overlay_color = this.findBindingColorFromNumber(overlay_value as number);
      } else if (overlay_value !== undefined) {
        overlay_color = this.findBindingColorFromString(overlay_value.toString());
      }
    }
    // End handles overlay

    if (tooltip === null || tooltip === '') {
      return (
        <div style={{ height: h, width: w, position: 'relative' }}>
          <img
            className={'image-container'}
            style={{
              pointerEvents: 'auto',
            }}
            onError={(e) => this.handleError(e)}
            src={url}
            alt={alt}
          />
          {show_overlay && (
            <div
              className={cl + ' ' + va}
              style={{
                height: oh,
                width: ow,
                backgroundColor: overlay_color,
                position: 'absolute',
              }}
            />
          )}
        </div>
      );
    }
    return (
      <div style={{ height: h, width: w, position: 'relative' }}>
        <img
          className={'image-container'}
          style={{
            pointerEvents: 'auto',
          }}
          onError={(e) => this.handleError(e)}
          src={url}
          title={tooltip}
          alt={alt}
        />
        {show_overlay && (
          <div
            className={cl + ' ' + va}
            style={{
              height: oh,
              width: ow,
              backgroundColor: overlay_color,
              position: 'absolute',
            }}
          />
        )}
      </div>
    );
  }
}

export class DynamicImagePanel extends PureComponent<Props> {
  getFieldIndex(field: string, fields: Field[], dataframe: DataFrame): number {
    for (let i = 0; i < fields.length; i++) {
      let n = getFieldDisplayName(fields[i], dataframe);
      if ((fields[i].type !== FieldType.time && field === '') || field === n) {
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
    let icon_index = this.getFieldIndex(options.icon_field, data.series[0].fields, data.series[0]);
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
      options.alt_field === ''
        ? icon_index
        : this.getFieldIndex(options.alt_field, data.series[0].fields, data.series[0]);
    if (alt_index === -1) {
      console.error("Missing field '" + options.alt_field + "' from data for alt");
      throw new Error("Can't find " + options.alt_field + ' field for alt.');
    }

    // Find tooltip field (if no tooltip use icon field as we don't care about values)
    let tooltip_index =
      options.tooltip && options.tooltip_include_field && options.tooltip_field !== ''
        ? this.getFieldIndex(options.tooltip_field, data.series[0].fields, data.series[0])
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

    // Find overlay field (if overlay is enable)
    let overlay_field_index = -2;
    let data_are_numbers = false;
    if (options.show_overlay && options.overlay !== undefined && options.overlay.field !== undefined) {
      overlay_field_index = this.getFieldIndex(options.overlay.field, data.series[0].fields, data.series[0]);
      if (overlay_field_index === -1) {
        console.error("Missing field '" + options.overlay.field + "' for overlay");
        throw new Error("Missing field '" + options.overlay.field + "' for overlay");
      }
      let r = guessFieldTypeForField(data.series[0].fields[overlay_field_index]);
      data_are_numbers = r === FieldType.number;
    }

    let values: Value[] = [];
    for (let i = 0; i < max; i++) {
      let t = '';
      let overlay_value = undefined;
      if (options.show_overlay && options.overlay !== undefined && options.overlay.field !== undefined) {
        overlay_value = data.series[0].fields[overlay_field_index].values.get(i);
      }
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
          overlay: overlay_value,
        });
      } else {
        values.push({
          icon: data.series[0].fields[icon_index].values.get(i),
          alt: data.series[0].fields[alt_index].values.get(i),
          overlay: overlay_value,
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
    return (
      <div className="container">
        {values.map((value) => {
          return (
            <Image
              key={''}
              url={start + value.icon + end}
              alt={value.alt}
              width={w}
              height={h}
              use_max={options.singleFill && values.length === 1}
              tooltip={value.tooltip}
              show_overlay={options.show_overlay}
              overlay_position={options.overlay.position}
              overlay_width={options.overlay.width}
              overlay_height={options.overlay.height}
              overlay_bindings={options.overlay.bindings}
              overlay_values_are_number={data_are_numbers}
              overlay_value={value.overlay}
            />
          );
        })}
      </div>
    );
  }
}
