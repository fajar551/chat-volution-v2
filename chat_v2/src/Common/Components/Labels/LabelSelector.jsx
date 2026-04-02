import chroma from 'chroma-js';
import React from 'react';
import Select from 'react-select';
import styles from './LabelSelector.module.css';

function LabelSelector(props) {
  const { listLabels, labelChoosed, updateLabel } = props;
  const parseListLabels = [];
  const labelChoose = [];

  listLabels.map((val, key) => {
    let result = {
      id: val.id,
      id_agent: val.id_agent,
      label: val.name,
      value: val.id,
      color: val.color,
    };

    return parseListLabels.push(result);
  });

  if (labelChoosed.length > 0) {
    labelChoosed.map((val) => {
      let result = {
        id: val.id,
        value: val.id,
        label: !Boolean(val.name) ? 'Undefined' : val.name,
        color: !Boolean(val.color) ? '#2c6af4' : val.color,
      };
      return labelChoose.push(result);
    });
  }

  /* config ui selector */
  const styleSelector = {
    control: (base) => ({
      ...base,
      borderColor: '#adb5bd',
      boxShadow: '0 0 0 1px #adb5bd',
      ':hover': {
        borderColor: '#adb5bd',
        cursor: 'pointer',
        boxShadow: '0 0 0 1px #adb5bd',
      },
      ':active': {
        borderColor: '#adb5bd',
        cursor: 'pointer',
        boxShadow: '0 0 0 1px #adb5bd',
      },
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? data.color
          : isFocused
          ? color.alpha(0.1).css()
          : undefined,
        color: isDisabled
          ? '#ccc'
          : isSelected
          ? chroma.contrast(color, 'white') > 2
            ? 'white'
            : 'black'
          : data.color,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        borderRadius: 10,
        ':active': {
          ...styles[':active'],
          backgroundColor: !isDisabled
            ? isSelected
              ? data.color
              : color.alpha(0.3).css()
            : undefined,
          borderRadius: 10,
        },
      };
    },
    multiValue: (styles, { data, isDisabled, isSelected }) => {
      const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: color.alpha(1).css(),
        borderRadius: 10,
      };
    },
    multiValueLabel: (styles, { data, isDisabled, isSelected }) => ({
      ...styles,
      color: chroma.contrast(data.color, 'white') > 2 ? 'white' : 'black',
    }),
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      color: chroma.contrast(data.color, 'white') > 2 ? 'gray' : 'gray',
      borderRadius: 10,
      ':hover': {
        backgroundColor: data.color,
        color: chroma.contrast(data.color, 'white') > 2 ? 'white' : 'black',
        borderRadius: 10,
      },
    }),
  };

  return (
    <>
      <div className="mb-3 d-flex justify-content-center">
        <Select
          className={`form-select ${styles.overideSelect}`}
          isMulti
          onChange={updateLabel}
          options={parseListLabels}
          styles={styleSelector}
          defaultValue={labelChoose}
        />
      </div>
    </>
  );
}

export default LabelSelector;
