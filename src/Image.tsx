import { Bindings, Position, Size, TEXT_UNBOUNDED_DEFAULT_COLOR } from 'types';
import { Property } from 'csstype';
import React from 'react';

export interface OverlayProps {
  /** Position of the overlay **/
  overlay_position: Position;
  /** Width of the overlay **/
  overlay_width: Size;
  /** Height of the overlay **/
  overlay_height: Size;
  /** Overlay bindings **/
  overlay_bindings: Bindings;
  /** Overlay field values are numbers ? **/
  overlay_values_are_numbers: boolean;
  /** Overlay value **/
  overlay_value: string | number | undefined;
}

export interface UnderlineProps {
  /** Underline field **/
  underline_value: string | undefined;
  /** Underline size **/
  underline_size: number;
  /** Underline text alignment **/
  underline_alignment: Property.TextAlign;
  /** Underline text color binding **/
  underline_bindings: Bindings | undefined;
  /** Underline binding values are numbers ? **/
  underline_binding_values_are_numbers: boolean;
  /** Underline binding value **/
  underline_binding_value: string | number | undefined;
}

export interface LinkProps {
  /** Clickable link **/
  link: string | undefined;
}

export interface HighlightProps {
  /** Highlight background color (change background alpha for shared crosshair) **/
  backgroundColor: string;
  /** Highlight border color (shared crosshair) **/
  borderColor: string;
}

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
  /** Overlay **/
  overlay: OverlayProps;
  /** Underline **/
  underline: UnderlineProps;
  /** Link **/
  link: LinkProps;
  /** Highlight (shared crosshair) **/
  highlight: HighlightProps;
}

function handleError(e) {
  console.warn('Error loading ' + e.target.src);
}

function findBindingColorFromNumber(value: number, binding: Bindings): string {
  let color = binding.unbounded;
  for (let i = 0; i < binding.bindings.length; i++) {
    if (value >= binding.bindings[i].value) {
      color = binding.bindings[i].color;
    } else {
      // Stop now
      break;
    }
  }

  return color;
}

function findBindingColorFromString(value: string, binding: Bindings): string {
  let color = binding.unbounded;
  for (let i = 0; i < binding.bindings.length; i++) {
    if (value === binding.bindings[i].value) {
      color = binding.bindings[i].color;
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
 * @param highlight Properties for shared crosshair
 */
function createImage(
  h: string,
  w: string,
  tooltip: string | undefined,
  url: string,
  alt: string,
  overlay_value: string | number | undefined,
  classname: string,
  oh: string,
  ow: string,
  overlay_color: string | undefined,
  highlight: HighlightProps
) {
  return (
    <div
      style={{
        height: h,
        width: w,
        position: 'relative',
        backgroundColor: highlight.backgroundColor,
        border: highlight.borderColor + ' 1px solid',
      }}
    >
      <img
        className={'image'}
        style={{
          pointerEvents: 'auto',
        }}
        title={tooltip}
        onError={(e) => handleError(e)}
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

export function Image(props: ImageProps) {
  const { url, tooltip, alt, width, height, use_max, overlay, underline, link, highlight } = props;

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
  if (overlay.overlay_position === Position.TOP_LEFT || overlay.overlay_position === Position.BOTTOM_LEFT) {
    cl = 'left-overlay';
  }
  if (overlay.overlay_position === Position.BOTTOM_LEFT || overlay.overlay_position === Position.BOTTOM_RIGHT) {
    va = 'bottom-overlay';
  }

  let ow = (overlay.overlay_width?.size ?? '5') + (overlay.overlay_width?.unit ?? '%');
  let oh = (overlay.overlay_height?.size ?? '5') + (overlay.overlay_height?.unit ?? '%');

  // Handles overlay...
  let overlay_color: string | undefined = undefined;
  let bindings_contains_string = true;
  if (overlay.overlay_value !== undefined) {
    overlay_color = overlay.overlay_bindings.unbounded;
    bindings_contains_string = overlay.overlay_bindings.has_text;

    // Find binding colors...
    if (!bindings_contains_string && overlay.overlay_values_are_numbers) {
      overlay_color = findBindingColorFromNumber(overlay.overlay_value as number, overlay.overlay_bindings);
    } else {
      overlay_color = findBindingColorFromString(overlay.overlay_value.toString(), overlay.overlay_bindings);
    }
  }
  // End handles overlay

  let underline_size_px = underline.underline_size + 'px';
  // Handle underline binding
  let underline_color: string = TEXT_UNBOUNDED_DEFAULT_COLOR;
  bindings_contains_string = true;
  if (underline.underline_binding_value !== undefined && underline.underline_bindings !== undefined) {
    underline_color = underline.underline_bindings?.unbounded;
    bindings_contains_string = underline.underline_bindings?.has_text;

    // Find color
    if (!bindings_contains_string && underline.underline_binding_values_are_numbers) {
      underline_color = findBindingColorFromNumber(
        underline.underline_binding_value as number,
        underline.underline_bindings
      );
    } else {
      underline_color = findBindingColorFromString(
        underline.underline_binding_value.toString(),
        underline.underline_bindings
      );
    }
  }

  return (
    <div className={'div-container'} style={{ width: w, overflow: 'hidden' }}>
      {link === undefined ? (
        createImage(h, w, tooltip, url, alt, overlay.overlay_value, cl + ' ' + va, oh, ow, overlay_color, highlight)
      ) : (
        <a href={link.link} target={'_blank'} rel={'noreferrer noopener'} style={{ height: '100%' }}>
          {createImage(h, w, tooltip, url, alt, overlay.overlay_value, cl + ' ' + va, oh, ow, overlay_color, highlight)}
        </a>
      )}
      {underline.underline_value !== undefined && (
        <div
          style={{
            textOverflow: 'ellipsis',
            fontSize: underline_size_px,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textAlign: underline.underline_alignment,
            color: underline_color,
          }}
        >
          {underline.underline_value}
        </div>
      )}
    </div>
  );
}
