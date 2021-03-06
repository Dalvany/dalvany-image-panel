export const UNBOUNDED_DEFAULT_COLOR = '#66666620';

export enum Position {
  TOP_LEFT = 'Top left',
  TOP_RIGHT = 'Top right',
  BOTTOM_LEFT = 'Bottom left',
  BOTTOM_RIGHT = 'Bottom right',
}

export interface OverlayOptions {
  field: string;
  position: Position;
  width: Size;
  height: Size;
  bindings: Bindings;
}

export interface Size {
  size: number;
  unit: string;
}

export interface Bindings {
  bindings: Binding[];
  unbounded: string;
  has_text: boolean;
}

export interface Binding {
  color: string;
  value: string | number;
}

export interface Underline {
  field: string;
  text_size: number;
}

export interface DynamicImageOptions {
  baseUrl?: string;
  suffix?: string;
  singleFill: boolean;
  width: string;
  height: string;
  icon_field: string;
  alt_field: string;
  tooltip: boolean;
  tooltip_include_field: boolean;
  tooltip_field: string;
  tooltip_include_date: boolean;
  tooltip_date_elapsed: boolean;
  overlay: OverlayOptions;
  underline: Underline;
}
