import React, { PureComponent } from 'react';
import { StandardEditorProps, SelectableValue } from '@grafana/data';
import { Button, ColorPicker, HorizontalGroup, Icon, Input, RadioButtonGroup, VerticalGroup } from '@grafana/ui';
import { Binding, Bindings, EditorProps, Size } from './types';

const UNBOUNDED_DEFAULT_COLOR = '#66666620';

export const SizeEditor: React.FC<StandardEditorProps<Size>> = ({ value, onChange }) => {
  let values = new Array<SelectableValue>(2);

  let px: SelectableValue<string> = {
    label: 'px',
    value: 'px',
    description: 'Unit are in pixels',
  };
  let percent: SelectableValue<string> = {
    label: 'Percent',
    value: '%',
    description: 'Unit are in percent of the image full size',
  };
  values.push(px, percent);

  return (
    <HorizontalGroup>
      <Input
        defaultValue={5}
        value={value.size}
        inputMode={'numeric'}
        onChange={(v) => {
          let n: Size = {
            size: +v.currentTarget.value,
            unit: value.unit,
          };
          onChange(n);
        }}
      />
      <RadioButtonGroup
        options={values}
        value={value.unit}
        onChange={(selected) => {
          let v: Size = {
            size: value.size,
            unit: selected,
          };
          onChange(v);
        }}
      />
    </HorizontalGroup>
  );
};

class BindingComponentEditor extends PureComponent<EditorProps> {
  /**
   * Called when default color for unbounded values has changed.
   * @param color New color
   */
  onChangedUnbounded = (color: string) => {
    const { bindings, onChange } = this.props;

    // Notify grafana that something has changed.
    onChange({
      bindings: bindings.bindings,
      unbounded: color,
      has_text: bindings.has_text,
    });
  };

  /**
   * Called when a color has changed in the binding
   * @param index Index of binding
   * @param color New color
   */
  onChangeColor = (index: number, color: string) => {
    const { bindings, onChange } = this.props;
    // Backup variable
    let current = bindings.bindings[index];

    // Change color
    bindings.bindings[index] = {
      color: color,
      value: current.value,
    };

    // Notify grafana
    onChange({
      bindings: bindings.bindings,
      unbounded: bindings.unbounded,
      has_text: bindings.has_text,
    });
  };

  /**
   * When text has changed in an input
   * @param index Index in bindings.bindings
   * @param text New text
   */
  onChangeText = (index: number, text: string) => {
    const { bindings, onChange } = this.props;

    // Try to see if it's a number to type properly.
    let n = parseFloat(text);
    if (isNaN(n)) {
      // Not a number, try if something like "1,2".
      n = parseFloat(text.replace(/,/g, '.'));
    }

    // Backup var
    let current = bindings.bindings[index];
    if (isNaN(n)) {
      // Not a number, we update the text at 'index'.
      bindings.bindings[index] = {
        color: current.color,
        value: text,
      };
    } else {
      // A number, we put it as value at 'index'.
      bindings.bindings[index] = {
        color: current.color,
        value: n,
      };
    }

    // Notify grafana something has changed.
    onChange({
      bindings: bindings.bindings,
      unbounded: bindings.unbounded,
      has_text: bindings.has_text,
    });
  };

  /**
   * Sort bindings.
   */
  sortBindings = () => {
    const { bindings, onChange } = this.props;
    // Remove empty values
    let tmp: Binding[] = bindings.bindings.filter((v) => {
      return v.value.toString() !== '';
    });

    // Contains at least a string (to sort at best)
    let has_text: boolean =
      tmp.find((v) => {
        return typeof v.value === 'string';
      }) !== undefined;

    // Sort, if contains at least one string, sort with string compare
    // mess up a little if contains also numbers but I don't know how to do it better
    // If all numbers, then sorting is easy.
    tmp.sort((a, b) => {
      if (has_text) {
        return a.value.toString().localeCompare(b.value.toString());
      }

      return (a.value as number) - (b.value as number);
    });

    // Notify grafana
    onChange({
      bindings: tmp,
      unbounded: bindings.unbounded,
      has_text: has_text,
    });
  };

  /**
   * Add new binding.
   */
  addBinding = () => {
    const { bindings, onChange } = this.props;

    // Push new binding
    bindings.bindings.push({
      color: '#AAAAAA',
      value: '',
    });

    // Notify grafana
    onChange({
      bindings: bindings.bindings,
      unbounded: bindings.unbounded,
      has_text: bindings.has_text,
    });
  };

  /**
   * Remove binding.
   *
   * @param index Index to remove.
   */
  removeBinding = (index: number) => {
    const { bindings, onChange } = this.props;

    // Remove 1 element at index
    bindings.bindings.splice(index, 1);

    // Notify grafana
    onChange({
      bindings: bindings.bindings,
      unbounded: bindings.unbounded,
      has_text: bindings.has_text,
    });

    // Sort
    this.sortBindings();
  };

  render() {
    const { bindings } = this.props;

    let d: JSX.Element[] = [];

    // Add the "base"/"unbounded values" bindings.
    let first = (
      <Input
        type={'text'}
        value={'Unbounded values / Base'}
        disabled={true}
        prefix={<ColorPicker color={bindings.unbounded} onChange={(color) => this.onChangedUnbounded(color)} />}
      />
    );
    d.push(first);

    // Can't access 'this' in map React thing in map function, so use variable that contains lambda.
    let remove_function: (index: number) => void = this.removeBinding;
    let change_function: (index: number, color: string) => void = this.onChangeColor;
    let change_text_function: (index: number, text: string) => void = this.onChangeText;
    let reorder_function: () => void = this.sortBindings;

    // If we have element in binding, create components.
    if (bindings.bindings !== undefined) {
      bindings.bindings
        .map(function (b, idx) {
          let prefix = <ColorPicker color={b.color} onChange={(color) => change_function(idx, color)} />;
          let suffix = <Icon className={'trash-alt'} name="trash-alt" onClick={() => remove_function(idx)} />;
          return (
            <Input
              type={'text'}
              prefix={prefix}
              suffix={suffix}
              onChange={(event) => change_text_function(idx, event.target.value)}
              value={b.value === undefined ? '' : b.value}
              onBlur={() => reorder_function()}
            />
          );
        })
        .map(function (elem) {
          d.push(elem);
        });
    }

    // Display binding in reverse order
    d = d.reverse();

    // Return the whole binding option component
    return (
      <VerticalGroup>
        <Button variant={'secondary'} size={'sm'} fullWidth={true} icon={'plus'} onClick={this.addBinding}>
          Add binding
        </Button>
        <VerticalGroup>{d}</VerticalGroup>
      </VerticalGroup>
    );
  }
}

export const BindingEditor: React.FC<StandardEditorProps<Bindings>> = ({ value, onChange }) => {
  let v: Bindings = value;
  if (v === undefined) {
    v = {
      bindings: [],
      unbounded: UNBOUNDED_DEFAULT_COLOR,
      has_text: true,
    };
  }
  return <BindingComponentEditor bindings={v} onChange={onChange} />;
};
