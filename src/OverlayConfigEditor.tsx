import React from 'react';
import { StandardEditorProps, SelectableValue } from '@grafana/data';
import { Input, RadioButtonGroup } from '@grafana/ui';

export interface Size {
  size: number;
  unit: string;
}

interface Settings {
  defaultSize: number;
  defaultUnit: string;
}

export const SizeEditor: React.FC<StandardEditorProps<Size, Settings>> = ({ item, value, onChange }) => {
  let values = new Array<SelectableValue>(2);

  if (value === undefined) {
    value = {
      size: item.settings?.defaultSize ?? 5,
      unit: item.settings?.defaultUnit ?? '%',
    };
    onChange(value);
  }

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
