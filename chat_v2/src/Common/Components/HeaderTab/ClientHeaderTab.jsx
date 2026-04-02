import React from 'react';
import { Input, InputGroup } from 'reactstrap';
import _ from 'lodash';
import { useCallback } from 'react';
import styles from './ClientHeaderTab.module.css';
import { useDispatch } from 'react-redux';
import { updateQueryListHistory } from '../../../features/Client/Tabs/ChatWithClients/ListChat/ListChatClientSlice';

function ClientHeaderTab(props) {
  const { attrClass, value, isFieldSearch } = props;
  const dispatch = useDispatch();

  /* handler */
  const handlerSearchHistory = (event) => {
    dispatch(updateQueryListHistory(event.target.value));
  };

  const querySearch = useCallback(
    _.debounce((event) => handlerSearchHistory(event), 500),
    []
  );

  const renderFieldSearch = (status = false) => {
    if (status) {
      return (
        <>
          <div className="search-box chat-search-box">
            <InputGroup size="md" className="mb-3 rounded-lg">
              <span
                className="input-group-text text-muted bg-light pe-1"
                id="basic-addon1"
              >
                <i className="ri-search-line search-icon font-size-18"></i>
              </span>
              <Input
                type="search"
                className={`form-control bg-light ${styles.search}`}
                placeholder="Search Clients..."
                onChange={querySearch}
              />
            </InputGroup>
          </div>
        </>
      );
    }
  };

  return (
    <>
      <h4 className={attrClass}>{value}</h4>
      {renderFieldSearch(isFieldSearch)}
    </>
  );
}

export default ClientHeaderTab;
