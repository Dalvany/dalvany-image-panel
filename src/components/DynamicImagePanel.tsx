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
  DashboardCursorSync,
} from '@grafana/data';
import { usePanelContext } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import { DynamicImageOptions, Transition } from 'types';
import { HighlightProps, Image, ImageDataProps, LinkProps, OverlayProps, UnderlineProps } from 'components/Image';
import '../css/image.css';

// @ts-ignore
import { Slide, Fade, Zoom } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import ConditionalWrap from 'conditional-wrap';

interface Props extends PanelProps<DynamicImageOptions> { }

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
  time: number | undefined;
  rowIndex: number;
  forceShowTooltip: boolean | undefined;
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

export function DynamicImagePanel(props: Props) {
  const { options, data, id, height, width } = props;

  const [hooverTime, setHooverTime] = useState<number | undefined>();
  const { eventBus, sync } = usePanelContext();
  useEffect(() => {
    const setHighlightTime = (event: DataHoverEvent) => {
      const rowIndex = event.payload?.rowIndex as number;
      const timeField: Field | undefined = data?.series.length === 0 ? undefined : getTimeField(data.series[0].fields);
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
  }, [setHooverTime, eventBus, data]);

  if (!data
    || data.series === undefined
    || data.series.length === 0
    || data.series[0].fields === undefined
    || data.series[0].fields.length === 0
    || data.series[0].fields[0].values === undefined
    || data.series[0].fields[0].values.length === 0) {
    return <PanelDataErrorView panelId={id} data={data} />;
  }
  if (data.error || (data.errors && data.errors.length > 1)) {
    return <PanelDataErrorView panelId={id} data={data} />;
  }

  const number_series = data.series.length;
  if (number_series > 1) {
    return (
      <PanelDataErrorView
        message={"There's multiple time series. Use the outer join transform."}
        panelId={id}
        data={data}
      />
    );
  }

  // Here we should have 1 timeserie...
  const max = data.series[0].fields[0].values.length;

  // Find icon field
  let icon_index = getFieldIndex(options.icon_field, data.series[0].fields, data.series[0]);
  if (icon_index === -1) {
    if (options.icon_field === '') {
      return (
        <PanelDataErrorView
          message={"Can't find a non time field for image. Please use another field"}
          panelId={id}
          data={data}
          needsTimeField={true}
        />
      );
    } else {
      return (
        <PanelDataErrorView
          message={"Can't find " + options.icon_field + ' field for image.'}
          panelId={id}
          data={data}
        />
      );
    }
  }

  // Find alt field
  let alt_index =
    options.alt_field === '' ? icon_index : getFieldIndex(options.alt_field, data.series[0].fields, data.series[0]);
  if (alt_index === -1) {
    return (
      <PanelDataErrorView message={"Can't find " + options.alt_field + ' field for alt.'} panelId={id} data={data} />
    );
  }

  // Find tooltip field (if no tooltip use icon field as we don't care about values)
  let tooltip_index =
    options.tooltip && options.tooltip_include_field && options.tooltip_field !== ''
      ? getFieldIndex(options.tooltip_field, data.series[0].fields, data.series[0])
      : icon_index;
  if (tooltip_index === -1) {
    return (
      <PanelDataErrorView
        message={"Can't find " + options.tooltip_field + ' field for tooltip.'}
        panelId={id}
        data={data}
      />
    );
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
    return <PanelDataErrorView message={"Can't find time field for tooltip."} panelId={id} data={data} />;
  }

  // Find overlay field (if overlay is enable)
  let overlay_field_index = -2;
  let data_are_numbers = false;
  if (options.overlay.field !== '') {
    overlay_field_index = getFieldIndex(options.overlay.field, data.series[0].fields, data.series[0]);
    if (overlay_field_index === -1) {
      return (
        <PanelDataErrorView
          message={"Missing field '" + options.overlay.field + "' for overlay"}
          panelId={id}
          data={data}
        />
      );
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
      return (
        <PanelDataErrorView
          message={"Missing field '" + options.underline.field + "' for underline"}
          panelId={id}
          data={data}
        />
      );
    }
    if (options.underline.text_align !== undefined) {
      underline_alignment = options.underline.text_align;
    }
    if (options.underline.bindings_field !== undefined) {
      underline_binding_index = getFieldIndex(options.underline.bindings_field, data.series[0].fields, data.series[0]);
      if (underline_binding_index === -1) {
        return (
          <PanelDataErrorView
            message={"Missing field '" + options.underline.bindings_field + "' for underline binding"}
            panelId={id}
            data={data}
          />
        );
      }
      let r = guessFieldTypeForField(data.series[0].fields[underline_binding_index]);
      underline_binding_are_numbers = r === FieldType.number;
    }
  }

  let values: Value[] = [];
  for (let i = 0; i < max; i++) {
    let forceShowTooltip: boolean | undefined = undefined;
    let time: number | undefined =
      hoover_time_index > -1 ? data.series[0].fields[hoover_time_index].values.get(i) : undefined;
    let backgroundColor = '#00000000';
    let borderColor = '#00000000';
    if (hooverTime !== undefined && hoover_time_index > -1) {
      let currentTime = data.series[0].fields[hoover_time_index].values.get(i);
      time = currentTime;
      let nextTime = undefined;
      if (i < max - 1) {
        nextTime = data.series[0].fields[hoover_time_index].values.get(i + 1);
      }
      if (currentTime <= hooverTime && nextTime === undefined) {
        backgroundColor = options.shared_cross_hair.backgroundColor;
        borderColor = options.shared_cross_hair.borderColor;
        if (sync && sync() === DashboardCursorSync.Tooltip) {
          forceShowTooltip = true;
        }
      } else if (currentTime <= hooverTime && nextTime !== undefined && hooverTime < nextTime) {
        backgroundColor = options.shared_cross_hair.backgroundColor;
        borderColor = options.shared_cross_hair.borderColor;
        if (sync && sync() === DashboardCursorSync.Tooltip) {
          forceShowTooltip = true;
        }
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
        time: time,
        rowIndex: i,
        forceShowTooltip: forceShowTooltip,
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
        time: time,
        rowIndex: i,
        forceShowTooltip: forceShowTooltip,
      });
    }
  }

  let fallback = options.fallback;
  if (fallback?.trim() === "") {
    fallback = undefined;
  }

  let start = options.baseUrl === undefined ? '' : options.baseUrl;
  start = props.replaceVariables(start);
  let end = options.suffix === undefined ? '' : options.suffix;
  end = props.replaceVariables(end);

  let start_link: string;
  let end_link: string;
  if (options.open_url.enable) {
    start_link = options.open_url.base_url === undefined ? '' : options.open_url.base_url;
    start_link = props.replaceVariables(start_link);
    end_link = options.open_url.suffix === undefined ? '' : options.open_url.suffix;
    end_link = props.replaceVariables(end_link);
  }

  if (!values || values.length === 0) {
    return <PanelDataErrorView message={'No data'} panelId={id} data={data} />;
  }

  let use_max = options.singleFill && (values.length === 1 || options.slideshow.enable);

  // intoString to maintain compatibility (see comment on intoString)
  let w = Number(props.replaceVariables(intoString(options.width)));
  let h = Number(props.replaceVariables(intoString(options.height)));
  if (options.autofit) {
    let image_number = values.length;
    let ratio = width / height;

    // We have width / height = R
    // If x is the number of column and y the number of row, we need :
    // x / y = R and x * y = N (image number)
    //
    // Then : x = sqrt(N * R)
    let x = Math.ceil(Math.sqrt(image_number * ratio));
    let y = Math.ceil(image_number / x)

    w = Math.floor(width/x) - 10;
    h = Math.floor(height/y) - 10;
  }

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
      forceShowTooltip: value.forceShowTooltip,
    };

    let clickable;
    if (options.open_url.enable) {
      clickable = start_link + value.link + end_link;
    }
    const link: LinkProps = {
      link: clickable,
      open_in_tab: options.open_url.open_in_tab,
    };

    const imageData: ImageDataProps = {
      time: value.time,
      url: start + value.icon + end,
      fallback: fallback,
      alt: value.alt,
      width: w,
      height: h,
      use_max: use_max,
      tooltip: value.tooltip,
      rowIndex: value.rowIndex,
    };

    let child = (
      <Image
        key={''}
        image={imageData}
        link={link}
        overlay={overlay}
        underline={underline}
        highlight={highlight}
        slideshow={options.slideshow.enable}
      />
    );

    return (
      <ConditionalWrap
        key={'1'}
        condition={options.slideshow.enable}
        wrap={(children: JSX.Element) => (
          <div key={''} className={'full-height'} style={{ display: 'flex' }}>
            {children}
          </div>
        )}
      >
        {child}
      </ConditionalWrap>
    );
  });

  if (options.slideshow.enable) {
    const transition = options.slideshow.transition;
    const p = {
      duration: options.slideshow.duration,
      transitionDuration: options.slideshow.transition_duration,
      pauseOnHover: options.slideshow.pauseOnHover,
      infinite: options.slideshow.infinite,
    };
    return (
      <div id={'slideshow-wrapper'} className={'main-container'}>
        {(transition === Transition.SLIDE)
          ? <Slide {...p}>{children}</Slide>
          : <Fade {...p}>{children}</Fade>
        }
      </div>
    );
  }

  return <div className="main-container no-slideshow">{children}</div>;
}
