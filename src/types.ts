import { Size } from './OverlayConfigEditor';
import { FieldType, ThresholdsConfig } from '@grafana/data';

export enum Position {
  TOP_LEFT = 'Top left',
  TOP_RIGHT = 'Top right',
  BOTTOM_LEFT = 'Bottom left',
  BOTTOM_RIGHT = 'Bottom right',
}

export interface OverlayOptions {
  field: FieldDefinition;
  position: Position;
  width: Size;
  height: Size;
  thresholds: ThresholdsConfig;
}

export interface FieldDefinition {
  name: string;
  type: FieldType;
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
