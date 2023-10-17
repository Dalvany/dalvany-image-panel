import { Property } from 'csstype';

export const UNBOUNDED_OVERLAY_DEFAULT_COLOR = '#66666620';
export const TEXT_UNBOUNDED_DEFAULT_COLOR = '#CCCCDCFF';

/**
 * Positions for overlay
 */
export enum Position {
  TOP_LEFT = 'Top left',
  TOP_RIGHT = 'Top right',
  BOTTOM_LEFT = 'Bottom left',
  BOTTOM_RIGHT = 'Bottom right',
}

export enum Transition {
  SLIDE = 'Slide',
  FADE = 'Fade',
}

/**
 * Options for overlay
 */
export interface OverlayOptions {
  field: string;
  position: Position;
  width: Size;
  height: Size;
  bindings: Bindings;
}

/**
 * Size of overlay
 */
export interface Size {
  size: number;
  unit: string;
}

/**
 * List of color binding for overlay
 */
export interface Bindings {
  bindings: Binding[];
  unbounded: string;
  has_text: boolean;
}

/**
 * Overlay color binding for a value
 */
export interface Binding {
  color: string;
  value: string | number;
}

/**
 * Options to show a text below images
 */
export interface Underline {
  field: string;
  text_size: number;
  text_align?: Property.TextAlign;
  bindings_field?: string;
  bindings?: Bindings;
}

/**
 * Options to open an url when clicking
 */
export interface OpenUrl {
  enable: boolean;
  open_in_tab: boolean;
  base_url: string;
  metric_field: string;
  suffix: string;
}

export interface Slideshow {
  enable: boolean;
  duration: number;
  transition_duration: number;
  pauseOnHover: boolean;
  transition: Transition;
  infinite: boolean;
}

export interface SharedCrossSupport {
  backgroundColor: string;
  borderColor: string;
}

/**
 * Options
 */
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
  open_url: OpenUrl;
  slideshow: Slideshow;
  shared_cross_hair: SharedCrossSupport;
}
