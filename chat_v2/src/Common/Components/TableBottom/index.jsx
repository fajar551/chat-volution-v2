import React, { useRef } from 'react';
import ReactPaginate from 'react-paginate';
import styles from './TableBottom.module.css';

function TableBottom(props) {
  const { hideCountTable, countTable, paginateClick } = props;
  const pagination = useRef();

  const setPage = ({ selected }) => {
    let retData = selected + 1;
    paginateClick(retData);
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
        {!hideCountTable && (
          <div className="text-center pe-3">
            Showing {!countTable.current ? 0 : countTable.current} to{' '}
            {!countTable.total_page ? 0 : countTable.total_page} of{' '}
            {!countTable.total_data ? 0 : countTable.total_data} entries
          </div>
        )}
        {countTable.total_data > 0 && (
          <ReactPaginate
            ref={pagination}
            pageCount={countTable.total_page}
            pageRangeDisplayed={1}
            marginPagesDisplayed={1}
            onPageChange={setPage}
            containerClassName={`pagination align-items-center ${styles['min-h-100px']} mt-lg-3`}
            activeClassName="active"
            pageLinkClassName="page-link"
            breakLinkClassName="page-link"
            nextLinkClassName="page-link"
            previousLinkClassName="page-link"
            pageClassName="page-item"
            breakClassName="page-item"
            nextClassName="page-item"
            previousClassName="page-item"
            previousLabel={<>&laquo;</>}
            nextLabel={<>&raquo;</>}
          />
        )}
      </div>
    </>
  );
}

export default TableBottom;
