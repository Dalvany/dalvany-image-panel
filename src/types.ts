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
  mappings: Mappings;
}

export interface Size {
  size: number;
  unit: string;
}

export interface EditorProps {
  mapping: Mappings;
  onChange: (value?: Mappings) => void;
}

export interface Mappings {
  bindings: Mapping[];
  unmapped: string;
}

export interface Mapping {
  color: string;
  value?: string | number;
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
