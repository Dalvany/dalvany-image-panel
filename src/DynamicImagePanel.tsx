import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { Property } from 'csstype';
import {
  DataFrame,
  DataHoverClearEvent,
  DataHoverEvent,
  dateTimeFormat,
  dateTimeFormatTimeAgo,
  Field,
  FieldType,
  getFieldDisplayName,
  guessFieldTypeForField,
  PanelProps,
} from '@grafana/data';
import { usePanelContext } from '@grafana/ui';
import { DynamicImageOptions, Transition } from 'types';
import { HighlightProps, Image, LinkProps, OverlayProps, UnderlineProps } from 'Image';
import './css/image.css';

// @ts-ignore
import { Slide, Fade, Zoom } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

interface Props extends PanelProps<DynamicImageOptions> {}

/**
 * Interface that contains all values that depend on a metric field
 */
interface Value {
  icon: string;
  alt: string;
  backgroundColor: string;
  borderColor: string;
  link?: string | undefined;
  tooltip?: string | undefined;
  overlay?: string | number | undefined;
  underline?: string | undefined;
  underline_binding?: string | number | undefined;
}

function getFieldIndex(field: string, fields: Field[], dataframe: DataFrame): number {
  for (let i = 0; i < fields.length; i++) {
    let n = getFieldDisplayName(fields[i], dataframe);
    if ((fields[i].type !== FieldType.time && field === '') || field === n) {
      return i;
    }
  }
  return -1;
}

function getTimeFieldIndex(fields: Field[]): number {
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].type === FieldType.time) {
      return i;
    }
  }
  return -1;
}

function getTimeField(fields: Field[] | undefined): any {
  if (fields !== undefined) {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].type === FieldType.time) {
        return fields[i];
      }
    }
  }
  return undefined;
}

/**
 * In case height or width are from an old version it will be a number.
 * "replaceVariables" function need a string or there will be an e.replace
 * is not a function.
 */
function intoString(data: number | string): string {
  if (typeof data === 'number') {
    return String(data);
  }

  return data;
}

const ConditionalWrapper = ({ condition, wrapper, children }) => (condition ? wrapper(children) : children);

export function DynamicImagePanel(props: Props) {
  const { options, data } = props;

  const [hooverTime, setHooverTime] = useState<number | undefined>();
  const { eventBus } = usePanelContext();
  useEffect(() => {
    const setHighlightTime = (event: DataHoverEvent) => {
      const rowIndex = event.payload?.rowIndex as number;
      const timeField: Field | undefined = getTimeField(event.payload?.data?.fields);
      let time = undefined;
      if (rowIndex !== undefined && timeField !== undefined) {
        time = timeField.values.get(rowIndex);
      }
      setHooverTime(time);
    };

    const resetHighlightTime = (event: DataHoverClearEvent) => {
      setHooverTime(undefined);
    };

    const subs = new Subscription();
    subs.add(eventBus.getStream(DataHoverEvent).subscribe({ next: setHighlightTime }));
    subs.add(eventBus.getStream(DataHoverClearEvent).subscribe({ next: resetHighlightTime }));

    return () => {
      subs.unsubscribe();
    };
  }, [setHooverTime, eventBus]);

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
  let icon_index = getFieldIndex(options.icon_field, data.series[0].fields, data.series[0]);
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
    options.alt_field === '' ? icon_index : getFieldIndex(options.alt_field, data.series[0].fields, data.series[0]);
  if (alt_index === -1) {
    console.error("Missing field '" + options.alt_field + "' from data for alt");
    throw new Error("Can't find " + options.alt_field + ' field for alt.');
  }

  // Find tooltip field (if no tooltip use icon field as we don't care about values)
  let tooltip_index =
    options.tooltip && options.tooltip_include_field && options.tooltip_field !== ''
      ? getFieldIndex(options.tooltip_field, data.series[0].fields, data.series[0])
      : icon_index;
  if (tooltip_index === -1) {
    console.error("Missing field '" + options.tooltip_field + "' from data for tooltip");
    throw new Error("Can't find " + options.tooltip_field + ' field for tooltip.');
  }

  let link_index =
    options.open_url.enable && options.open_url.metric_field !== ''
      ? getFieldIndex(options.open_url.metric_field, data.series[0].fields, data.series[0])
      : -1;

  // To not mess up with tooltip
  let hoover_time_index = getTimeFieldIndex(data.series[0].fields);

  // Find time field for tooltip (if no tooltip or if it doesn't include time, use icon field as we don't care about values)
  let time_index = options.tooltip && options.tooltip_include_date ? hoover_time_index : icon_index;
  if (time_index === -1) {
    console.error('Missing time field from data for tooltip');
    throw new Error("Can't find time field for tooltip.");
  }

  // Find overlay field (if overlay is enable)
  let overlay_field_index = -2;
  let data_are_numbers = false;
  if (options.overlay.field !== '') {
    overlay_field_index = getFieldIndex(options.overlay.field, data.series[0].fields, data.series[0]);
    if (overlay_field_index === -1) {
      console.error("Missing field '" + options.overlay.field + "' for overlay");
      throw new Error("Missing field '" + options.overlay.field + "' for overlay");
    }
    let r = guessFieldTypeForField(data.series[0].fields[overlay_field_index]);
    data_are_numbers = r === FieldType.number;
  }

  let underline_index = -1;
  let underline_size = 14;
  let underline_alignment: Property.TextAlign = 'left';
  let underline_binding_index = -1;
  let underline_binding_are_numbers = false;
  if (options.underline.field !== '') {
    underline_size = options.underline.text_size;
    underline_index = getFieldIndex(options.underline.field, data.series[0].fields, data.series[0]);
    if (underline_index === -1) {
      console.error("Missing field '" + options.underline.field + "' for underline");
      throw new Error("Missing field '" + options.underline.field + "' for underline");
    }
    if (options.underline.text_align !== undefined) {
      underline_alignment = options.underline.text_align;
    }
    if (options.underline.bindings_field !== undefined) {
      underline_binding_index = getFieldIndex(options.underline.bindings_field, data.series[0].fields, data.series[0]);
      if (underline_binding_index === -1) {
        console.error("Missing field '" + options.underline.bindings_field + "' for underline binding");
        throw new Error("Missing field '" + options.underline.bindings_field + "' for underline binding");
      }
      let r = guessFieldTypeForField(data.series[0].fields[underline_binding_index]);
      underline_binding_are_numbers = r === FieldType.number;
    }
  }

  let values: Value[] = [];
  for (let i = 0; i < max; i++) {
    let backgroundColor = '#00000000';
    let borderColor = '#00000000';
    if (hooverTime !== undefined && hoover_time_index > -1) {
      let currentTime = data.series[0].fields[hoover_time_index].values.get(i);
      let nextTime = undefined;
      if (i < max - 1) {
        nextTime = data.series[0].fields[hoover_time_index].values.get(i + 1);
      }
      if (currentTime <= hooverTime && nextTime === undefined) {
        backgroundColor = options.shared_cross_hair.backgroundColor;
        borderColor = options.shared_cross_hair.borderColor;
      } else if (currentTime <= hooverTime && nextTime !== undefined && hooverTime < nextTime) {
        backgroundColor = options.shared_cross_hair.backgroundColor;
        borderColor = options.shared_cross_hair.borderColor;
      }
    }

    let t = '';
    let overlay_value = undefined;
    if (options.overlay.field !== '') {
      overlay_value = data.series[0].fields[overlay_field_index].values.get(i);
    }
    let underline_value = undefined;
    if (underline_index > -1) {
      underline_value = data.series[0].fields[underline_index].values.get(i);
    }
    let underline_binding_value = undefined;
    if (underline_binding_index > -1) {
      underline_binding_value = data.series[0].fields[underline_binding_index].values.get(i);
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
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        tooltip: t,
        link: link_value,
        overlay: overlay_value,
        underline: underline_value,
        underline_binding: underline_binding_value,
      });
    } else {
      values.push({
        icon: data.series[0].fields[icon_index].values.get(i),
        alt: data.series[0].fields[alt_index].values.get(i),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        link: link_value,
        overlay: overlay_value,
        underline: underline_value,
        underline_binding: underline_binding_value,
      });
    }
  }

  let start = options.baseUrl === undefined ? '' : options.baseUrl;
  start = props.replaceVariables(start);
  let end = options.suffix === undefined ? '' : options.suffix;
  end = props.replaceVariables(end);

  let start_link;
  let end_link;
  if (options.open_url.enable) {
    start_link = options.open_url.base_url === undefined ? '' : options.open_url.base_url;
    start_link = props.replaceVariables(start_link);
    end_link = options.open_url.suffix === undefined ? '' : options.open_url.suffix;
    end_link = props.replaceVariables(end_link);
  }

  if (!values || values.length === 0) {
    console.error('Serie contains no values');
    throw new Error('No data found in response. Please check your query');
  }

  let use_max = options.singleFill && (values.length === 1 || options.slideshow.enable);

  // intoString to maintain compatibility (see comment on intoString)
  let w = Number(props.replaceVariables(intoString(options.width)));
  let h = Number(props.replaceVariables(intoString(options.height)));

  const children = values.map((value) => {
    const overlay: OverlayProps = {
      overlay_position: options.overlay.position,
      overlay_width: options.overlay.width,
      overlay_height: options.overlay.height,
      overlay_bindings: options.overlay.bindings,
      overlay_values_are_numbers: data_are_numbers,
      overlay_value: value.overlay,
    };

    const underline: UnderlineProps = {
      underline_value: value.underline,
      underline_size: underline_size,
      underline_alignment: underline_alignment,
      underline_bindings: options.underline.bindings,
      underline_binding_values_are_numbers: underline_binding_are_numbers,
      underline_binding_value: value.underline_binding,
    };

    const highlight: HighlightProps = {
      backgroundColor: value.backgroundColor,
      borderColor: value.borderColor,
    };

    let clickable;
    if (options.open_url.enable) {
      clickable = start_link + value.link + end_link;
    }
    const link: LinkProps = {
      link: clickable,
    };
    let child = (
      <Image
        key={''}
        url={start + value.icon + end}
        alt={value.alt}
        width={w}
        height={h}
        use_max={use_max}
        tooltip={value.tooltip}
        link={link}
        overlay={overlay}
        underline={underline}
        highlight={highlight}
      />
    );

    return (
      <ConditionalWrapper
        key={'1'}
        condition={options.slideshow.enable}
        wrapper={(children) => (
          <div key={''} className={'full-height'} style={{ display: 'flex' }}>
            {children}
          </div>
        )}
      >
        {child}
      </ConditionalWrapper>
    );
  });

  if (options.slideshow.enable) {
    const transition = options.slideshow.transition;
    const p = {
      duration: options.slideshow.duration,
      transitionDuration: options.slideshow.transition_duration,
      pauseOnHover: options.slideshow.pauseOnHover,
    };
    return (
      <ConditionalWrapper
        condition={options.slideshow.enable}
        wrapper={(children) => (
          <div id={'slideshow-wrapper'} className={'main-container'}>
            {children}
          </div>
        )}
      >
        {transition === Transition.SLIDE && <Slide {...p}>{children}</Slide>}
        {transition === Transition.FADE && <Fade {...p}>{children}</Fade>}
      </ConditionalWrapper>
    );
  }

  return <div className="main-container no-slideshow">{children}</div>;
}
