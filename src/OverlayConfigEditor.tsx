import React, { PureComponent } from 'react';
import { StandardEditorProps, SelectableValue } from '@grafana/data';
import { Button, ColorPicker, HorizontalGroup, Icon, Input, RadioButtonGroup, VerticalGroup } from '@grafana/ui';
import { Mapping, Mappings, EditorProps, Size } from './types';

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
  onChangeUnmapped = (color: string) => {
    const { mapping } = this.props;

    mapping.unmapped = color;

    this.forceUpdate();
  };

  onChangeColor = (index: number, color: string) => {
    const { mapping, onChange } = this.props;
    mapping.bindings[index] = {
      color: color,
    };
    onChange({
      bindings: mapping.bindings,
      unmapped: mapping.unmapped,
    });
    this.forceUpdate();
  };

  addBinding = () => {
    const { mapping, onChange } = this.props;

    let n: Mapping[] = [];
    mapping.bindings.map(function (b) {
      n.push(b);
    });

    n.push({
      color: '#AAAAAA',
    });
    onChange({
      bindings: n,
      unmapped: mapping.unmapped,
    });
    this.forceUpdate();
  };

  removeBinding = (index: number) => {
    const { mapping, onChange } = this.props;

    mapping.bindings.splice(index, 1);
    onChange({
      bindings: mapping.bindings,
      unmapped: mapping.unmapped,
    });
    this.forceUpdate();
  };

  render() {
    const { mapping } = this.props;

    let d: JSX.Element[] = [];
    let first = (
      <Input
        type={'text'}
        value={'Unmapped values/Base'}
        disabled={true}
        prefix={<ColorPicker color={mapping.unmapped} onChange={(color) => this.onChangeUnmapped(color)} />}
      />
    );
    d.push(first);
    let remove_function: (index: number) => void = this.removeBinding;
    let change_function: (index: number, color: string) => void = this.onChangeColor;
    if (mapping.bindings !== undefined) {
      mapping.bindings
        .map(function (b, idx) {
          let prefix = <ColorPicker color={b.color} onChange={(color) => change_function(idx, color)} />;
          let suffix = <Icon className={'trash-alt'} name="trash-alt" onClick={() => remove_function(idx)} />;
          return <Input type={'text'} prefix={prefix} suffix={suffix} />;
        })
        .map(function (elem) {
          d.push(elem);
        });
    }
    d = d.reverse();

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

export const BindingEditor: React.FC<StandardEditorProps<Mappings>> = ({ value, onChange }) => {
  let v: Mappings = value;
  if (v === undefined) {
    v = {
      bindings: [],
      unmapped: '#666666E6',
    };
  }
  return <BindingComponentEditor mapping={v} onChange={onChange} />;
};
