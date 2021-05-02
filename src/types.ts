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
  mappings: Bindings;
}

export interface Size {
  size: number;
  unit: string;
}

export interface EditorProps {
  bindings: Bindings;
  onChange: (value?: Bindings) => void;
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
  show_overlay: boolean;
  overlay: OverlayOptions;
}
