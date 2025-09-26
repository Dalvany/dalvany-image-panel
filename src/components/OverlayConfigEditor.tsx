import React, { useEffect, useRef, useState } from 'react';
import { StandardEditorProps, SelectableValue } from '@grafana/data';
import { Button, ColorPicker, HorizontalGroup, Icon, Input, RadioButtonGroup, VerticalGroup } from '@grafana/ui';
import { Binding, Bindings, Size, UNBOUNDED_OVERLAY_DEFAULT_COLOR } from 'types';

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

interface EditorProps {
  bindings: Bindings;
  onChange: (value?: Bindings) => void;
}

function BindingComponentEditor(props: EditorProps) {
  const { bindings, onChange } = props;
  const focus = useRef<HTMLInputElement | null>(null);

  const [addedBinding, setAddedBinding] = useState<boolean>(false);

  useEffect(() => {
    if (addedBinding) {
      focus.current?.focus();
    }
  }, [focus, addedBinding]);

  /**
   * Called when default color for unbounded values has changed.
   * @param color New color
   */
  const onChangedUnbounded = (color: string) => {
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
  const onChangeColor = (index: number, color: string) => {
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

  const onTextChange = (index: number, text: string) => {
    let current = bindings.bindings[index];
    bindings.bindings[index] = {
      color: current.color,
      value: text,
    };

    sortBindings();
  };

  const onLeaveInput = (index: number, text: string) => {
    // Try to see if it's a number to type properly.
    let n = NaN;
    // If because it converts '' into 0
    if (text !== '') {
      n = Number(text);
      if (isNaN(n)) {
        // Not a number, try if something like "1,2".
        n = Number(text.replace(/,/g, '.'));
      }
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

    setAddedBinding(false);

    // Notify grafana something has changed.
    sortBindings();
  };

  /**
   * Sort bindings.
   */
  const sortBindings = () => {
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
    // mess up a little if contains also numbers, but I don't know how to do it better
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
  const addBinding = () => {
    // Push new binding
    bindings.bindings.push({
      color: '#AAAAAA',
      value: '',
    });
    setAddedBinding(true);

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
  const removeBinding = (index: number) => {
    // Remove 1 element at index
    bindings.bindings.splice(index, 1);

    // Sort
    sortBindings();
  };

  let d: React.JSX.Element[] = [];

  // Add the "base"/"unbounded values" bindings.
  let first = (
    <Input
      type={'text'}
      value={'Unbounded values / Base'}
      disabled={true}
      prefix={<ColorPicker color={bindings.unbounded} onChange={(color) => onChangedUnbounded(color)} />}
    />
  );
  d.push(first);

  // If we have element in binding, create components.
  if (bindings.bindings !== undefined) {
    let max = bindings.bindings.length - 1;

    bindings.bindings
      .map(function (b, idx) {
        let prefix = <ColorPicker color={b.color} onChange={(color) => onChangeColor(idx, color)} />;
        let suffix = <Icon className={'trash-alt'} name="trash-alt" onClick={() => removeBinding(idx)} />;
        return (
          <Input
            key={idx}
            ref={idx === max ? focus : null}
            type={'text'}
            prefix={prefix}
            suffix={suffix}
            onChange={(event) => onTextChange(idx, (event.target as HTMLInputElement).value)}
            onBlur={(event) => onLeaveInput(idx, (event.target as HTMLInputElement).value)}
            value={b.value === undefined ? '' : b.value}
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
      <Button variant={'secondary'} size={'sm'} fullWidth={true} icon={'plus'} onClick={addBinding}>
        Add binding
      </Button>
      <VerticalGroup>{d}</VerticalGroup>
    </VerticalGroup>
  );
}

export const BindingEditor: React.FC<StandardEditorProps<Bindings>> = ({ value, onChange }) => {
  let v: Bindings = value;
  if (v === undefined) {
    v = {
      bindings: [],
      unbounded: UNBOUNDED_OVERLAY_DEFAULT_COLOR,
      has_text: true,
    };
  }
  return <BindingComponentEditor bindings={v} onChange={onChange} />;
};
