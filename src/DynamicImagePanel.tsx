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
import { Bindings, DynamicImageOptions, Position, Size } from 'types';
import './css/image.css';

// @ts-ignore
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

interface Props extends PanelProps<DynamicImageOptions> {}

interface ImageProps {
  /** Image URL **/
  url: string;
  /** Tooltip text, if null no tooltip **/
  tooltip?: string | undefined;
  /** Alternative **/
  alt: string;
  /** Width in px of the image **/
  width: number;
  /** Height in px of the image **/
  height: number;
  /** Handle 'singleFill' use 100% instead of height and width **/
  use_max: boolean;
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
  /** Underline field **/
  underline_value: string | undefined;
  /** Underline size **/
  underline_size: number;
  /** Clickable link **/
  link: string | undefined;
}

/**
 * Interface that contains all values that depend on a metric field
 */
interface Value {
  icon: string;
  alt: string;
  link?: string | undefined;
  tooltip?: string | undefined;
  overlay?: string | number | undefined;
  underline?: string | undefined;
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

  /**
   * Create an image with the given parameters
   * @param h Height of the image
   * @param w Width of the image
   * @param tooltip Tooltip text (undefined if no tooltip)
   * @param url URL of the image
   * @param alt Alt text
   * @param overlay_value Value of the overlay
   * @param classname Position of the overlay
   * @param oh Height of the overlay
   * @param ow Width of the overlay
   * @param overlay_color Color of overlay
   */
  createImage(
    h: string,
    w: string,
    tooltip: string | undefined,
    url: string,
    alt: string,
    overlay_value: string | number | undefined,
    classname: string,
    oh: string,
    ow: string,
    overlay_color: string | undefined
  ) {
    return (
      <div style={{ height: h, width: w, position: 'relative' }}>
        <img
          className={'image'}
          style={{
            pointerEvents: 'auto',
          }}
          title={tooltip}
          onError={(e) => this.handleError(e)}
          src={url}
          alt={alt}
        />
        {overlay_value !== undefined && (
          <div
            className={classname}
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

  render() {
    const {
      url,
      tooltip,
      alt,
      width,
      height,
      use_max,
      overlay_width,
      overlay_height,
      overlay_position,
      overlay_bindings,
      overlay_values_are_number,
      overlay_value,
      underline_value,
      underline_size,
      link,
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
    if (overlay_value !== undefined) {
      overlay_color = overlay_bindings.unbounded;
      bindings_contains_string = overlay_bindings.has_text;

      // Find binding colors...
      if (!bindings_contains_string && overlay_values_are_number) {
        overlay_color = this.findBindingColorFromNumber(overlay_value as number);
      } else {
        overlay_color = this.findBindingColorFromString(overlay_value.toString());
      }
    }
    // End handles overlay

    let underline_size_px = underline_size + 'px';

    return (
      <div className={'div-container'} style={{ width: w, overflow: 'hidden' }}>
        {link === undefined ? (
          this.createImage(h, w, tooltip, url, alt, overlay_value, cl + ' ' + va, oh, ow, overlay_color)
        ) : (
          <a href={link} target={'_blank'} rel={'noreferrer noopener'} style={{ height: '100%' }}>
            {this.createImage(h, w, tooltip, url, alt, overlay_value, cl + ' ' + va, oh, ow, overlay_color)}
          </a>
        )}
        {underline_value !== undefined && (
          <div
            style={{
              textOverflow: 'ellipsis',
              fontSize: underline_size_px,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {underline_value}
          </div>
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

  /**
   * In case height or width are from an old version it will be a number.
   * "replaceVariables" function need a string or there will be an e.replace
   * is not a function.
   */
  intoString(data: number | string): string {
    if (typeof data === 'number') {
      return String(data);
    }

    return data;
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

    let link_index =
      options.open_url.enable && options.open_url.metric_field !== ''
        ? this.getFieldIndex(options.open_url.metric_field, data.series[0].fields, data.series[0])
        : -1;

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
    if (options.overlay.field !== '') {
      overlay_field_index = this.getFieldIndex(options.overlay.field, data.series[0].fields, data.series[0]);
      if (overlay_field_index === -1) {
        console.error("Missing field '" + options.overlay.field + "' for overlay");
        throw new Error("Missing field '" + options.overlay.field + "' for overlay");
      }
      let r = guessFieldTypeForField(data.series[0].fields[overlay_field_index]);
      data_are_numbers = r === FieldType.number;
    }

    let underline_index = -1;
    let underline_size = 14;
    if (options.underline.field !== '') {
      underline_size = options.underline.text_size;
      underline_index = this.getFieldIndex(options.underline.field, data.series[0].fields, data.series[0]);
      if (underline_index === -1) {
        console.error("Missing field '" + options.overlay.field + "' for underline");
        throw new Error("Missing field '" + options.overlay.field + "' for underline");
      }
    }

    let values: Value[] = [];
    for (let i = 0; i < max; i++) {
      let t = '';
      let overlay_value = undefined;
      if (options.overlay.field !== '') {
        overlay_value = data.series[0].fields[overlay_field_index].values.get(i);
      }
      let underline_value = undefined;
      if (underline_index > -1) {
        underline_value = data.series[0].fields[underline_index].values.get(i);
      }
      let link_value = '';
      if (options.open_url.enable && link_index !== -1) {
        link_value = data.series[0].fields[link_index].values.get(i);
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
          link: link_value,
          overlay: overlay_value,
          underline: underline_value,
        });
      } else {
        values.push({
          icon: data.series[0].fields[icon_index].values.get(i),
          alt: data.series[0].fields[alt_index].values.get(i),
          link: link_value,
          overlay: overlay_value,
          underline: underline_value,
        });
      }
    }

    let start = options.baseUrl === undefined ? '' : options.baseUrl;
    start = this.props.replaceVariables(start);
    let end = options.suffix === undefined ? '' : options.suffix;
    end = this.props.replaceVariables(end);

    let start_link;
    let end_link;
    if (options.open_url.enable) {
      start_link = options.open_url.base_url === undefined ? '' : options.open_url.base_url;
      start_link = this.props.replaceVariables(start_link);
      end_link = options.open_url.suffix === undefined ? '' : options.open_url.suffix;
      end_link = this.props.replaceVariables(end_link);
    }

    if (!values || values.length === 0) {
      console.error('Serie contains no values');
      throw new Error('No data found in response. Please check your query');
    }

    let use_max = options.singleFill && (values.length === 1 || options.slideshow.enable);

    //TODO Remove
    let tmp = options.width;
    if (typeof tmp !== 'number') {
      tmp = String(tmp);
    }

    // intoString to maintain compatibility (see comment on intoString)
    let w = Number(this.props.replaceVariables(this.intoString(options.width)));
    let h = Number(this.props.replaceVariables(this.intoString(options.height)));
    if (options.slideshow.enable) {
      return (
        <div id={'slideshow-wrapper'} className={'main-container'}>
          <Slide duration={options.slideshow.duration} pauseOnHover={options.slideshow.pauseOnHover}>
            {values.map((value) => {
              let clickable;
              if (options.open_url.enable) {
                clickable = start_link + value.link + end_link;
              }
              return (
                <div key={''} className={'full-height'} style={{ display: 'flex' }}>
                  <Image
                    key={''}
                    url={start + value.icon + end}
                    alt={value.alt}
                    width={w}
                    height={h}
                    use_max={use_max}
                    tooltip={value.tooltip}
                    link={clickable}
                    overlay_position={options.overlay.position}
                    overlay_width={options.overlay.width}
                    overlay_height={options.overlay.height}
                    overlay_bindings={options.overlay.bindings}
                    overlay_values_are_number={data_are_numbers}
                    overlay_value={value.overlay}
                    underline_value={value.underline}
                    underline_size={underline_size}
                  />
                </div>
              );
            })}
          </Slide>
        </div>
      );
    }
    return (
      <div className="main-container no-slideshow">
        {values.map((value) => {
          let clickable;
          if (options.open_url.enable) {
            clickable = start_link + value.link + end_link;
          }
          return (
            <Image
              key={''}
              url={start + value.icon + end}
              alt={value.alt}
              width={w}
              height={h}
              use_max={use_max}
              tooltip={value.tooltip}
              link={clickable}
              overlay_position={options.overlay.position}
              overlay_width={options.overlay.width}
              overlay_height={options.overlay.height}
              overlay_bindings={options.overlay.bindings}
              overlay_values_are_number={data_are_numbers}
              overlay_value={value.overlay}
              underline_value={value.underline}
              underline_size={underline_size}
            />
          );
        })}
      </div>
    );
  }
}
