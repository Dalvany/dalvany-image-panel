import React, {PureComponent} from 'react';
import {StandardEditorProps, SelectableValue} from '@grafana/data';
import {Button, ColorPicker, Input, RadioButtonGroup} from '@grafana/ui';

export interface Size {
    size: number;
    unit: string;
}

export interface BindingProps {
    value: string;
    color: string;
}

export class ColorBinding extends PureComponent<BindingProps> {
    constructor(props: BindingProps) {
        super(props);
    }

    onChangeColor = (color: string) => {
    }


    render() {
        const {value, color} = this.props;
        return <Input type={'text'} value={value}
                      prefix={<ColorPicker color={color} enableNamedColors={true}
                                           onChange={(value) => this.onChangeColor(value)}/>}/>;
    }
}

export const BindingColorEditor: React.FC<StandardEditorProps<string>> = ({value, onChange}) => {
    return (
        <div>
            <Button icon="plus" size="sm"/>
            <ColorBinding value={'14'} color={'#333333FF'}/>
        </div>
    );
};

export const SizeEditor: React.FC<StandardEditorProps<Size>> = ({value, onChange}) => {
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
            <div style={{width: '80px', marginRight: '10px'}}>
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
