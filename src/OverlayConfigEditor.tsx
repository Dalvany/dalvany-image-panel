import React, { PureComponent } from 'react';
import { StandardEditorProps, SelectableValue } from '@grafana/data';
import { Button, ColorPicker, Icon, Input, RadioButtonGroup } from '@grafana/ui';

export interface Size {
  size: number;
  unit: string;
}

export interface EditorProps {
  binding: Bindings;
  onChange: (value?: Bindings) => void;
}

export interface Bindings {
  bindings: Binding[];
}

export interface Binding {
  color: string;
  value?: string | number;
}

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
    <div className={'size-option'}>
      <div style={{ width: '80px', marginRight: '10px' }}>
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
      </div>
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
    </div>
  );
};

class BindingComponentEditor extends PureComponent<EditorProps> {
  onChangeColor = (index: number, color: string) => {
    const { binding } = this.props;
    binding.bindings[index] = {
      color: color,
    };
    this.forceUpdate();
  };

  addBinding = () => {
    const { binding, onChange } = this.props;

    let n: Binding[] = [];
    binding.bindings.map(function (b) {
      n.push(b);
    });

    n.push({
      color: '#AAAAAA',
    });
    onChange({
      bindings: n,
    });
    this.forceUpdate();
  };

  removeBinding = (index: number) => {
    const { binding, onChange } = this.props;

    binding.bindings.splice(index, 1);
    onChange({
      bindings: binding.bindings,
    });
    this.forceUpdate();
  };

  render() {
    const { binding } = this.props;

    let d: JSX.Element[] = [];
    let remove_function: (index: number) => void = this.removeBinding;
    let change_function: (index: number, color: string) => void = this.onChangeColor;
    if (binding.bindings !== undefined) {
      d = binding.bindings.map(function (b, idx) {
        let prefix = (
          <div>
            <ColorPicker color={b.color} onChange={(color) => change_function(idx, color)} />
          </div>
        );
        let suffix = <Icon className={'trash-alt'} name="trash-alt" onClick={() => remove_function(idx)} />;
        return <Input type={'text'} prefix={prefix} suffix={suffix} />;
      });
    }

    return (
      <div>
        <div>{d}</div>
        <div>
          <Button className={'css-stylot-button'} onClick={this.addBinding}>
            Add binding
          </Button>
        </div>
      </div>
    );
  }
}

export const BindingEditor: React.FC<StandardEditorProps<Bindings>> = ({ value, onChange }) => {
  let v: Bindings = value;
  if (v === undefined) {
    v = {
      bindings: [],
    };
  }
  return <BindingComponentEditor binding={v} onChange={onChange} />;
};
