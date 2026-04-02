import React from 'react';
import { randomString } from '../../utils/helpers';
import styles from './TBody.module.css';

function TBody(props) {
  const { data, headerField } = props;
  const TBodyRow = (params) => {
    const { data, field } = params;

    let tdRow = [];
    for (let index = 0; index < field.length; index++) {
      tdRow.push(
        <td key={`${index}${randomString(10)}`}>{data[field[index]]}</td>
      );
    }
    return <tr>{tdRow}</tr>;
  };

  const ContentTbody = (params) => {
    const { data, field } = params;

    if (data.length < 1) {
      return (
        <tr>
          <td colSpan={field.length} className="text-center">
            <div
              className={`d-flex justify-content-center align-items-center ${styles['not-found-content']}`}
            >
              Data Not Found!
            </div>
          </td>
        </tr>
      );
    } else {
      return data.map((valueData, keyData) => {
        return <TBodyRow data={valueData} field={field} key={keyData} />;
      });
    }
  };

  return (
    <tbody className="my-5">
      <ContentTbody data={data} field={headerField} />
    </tbody>
  );
}

export default TBody;
