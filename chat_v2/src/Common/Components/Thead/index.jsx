import React from 'react';

const THComp = (props) => {
  const { title } = props;
  return <th>{title}</th>;
};

function Thead(props) {
  const { data } = props;
  if (!data) {
    data = [];
  }

  return (
    <thead color="tangerin">
      <tr>
        {data.map((value, key) => {
          return <THComp title={value.title} isShort={value.short} key={key} />;
        })}
      </tr>
    </thead>
  );
}

export default Thead;
