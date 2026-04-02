import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Table } from 'reactstrap';
import TableBottom from '../TableBottom';
import TBody from '../TBody';
import Thead from '../Thead';

function TableComp(props) {
  const {
    theadData,
    dataTBody,
    noBottom,
    noCountTable,
    countTable,
    paginateClick,
  } = props;
  const [fieldHeader, setFieldHeader] = useState(['table header']);
  const [statusHideCountTable, setStatusHideCountTable] = useState(false);

  useEffect(() => {
    if (noCountTable) {
      setStatusHideCountTable(true);
    } else {
      setStatusHideCountTable(false);
    }
  }, [noCountTable]);

  useEffect(() => {
    const field = [];
    if (theadData) {
      theadData.map((value) => {
        return field.push(value.field);
      });
      setFieldHeader(field);
    } else {
      setFieldHeader(['table1', 'table2', 'table3', 'table4']);
    }
  }, [theadData]);

  return (
    <Card className="mt-2 mb-5 rounded-5" style={{ minHeight: '300px' }}>
      <CardBody>
        <Table responsive style={{ color: '#a6b0cf' }}>
          <Thead data={theadData} />
          <TBody data={dataTBody} headerField={fieldHeader} />
        </Table>
        {!noBottom && (
          <TableBottom
            hideCountTable={statusHideCountTable}
            countTable={countTable}
            paginateClick={paginateClick}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default TableComp;
