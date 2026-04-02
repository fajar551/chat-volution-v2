import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, CloseButton, Form, FormGroup, Input, Label } from 'reactstrap';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SimpleBar from 'simplebar-react';
import ClientHeaderTab from '../../../../Common/Components/HeaderTab/ClientHeaderTab';
import { changeFormatDate } from '../../../../Common/utils/helpers';
import {
  getListChoosedAgent,
  getListReport,
  reportChatSelector,
  resetFilter,
  updateFilter,
  updateFilterDateRange,
  updateNumberPage,
} from '../../../ReportChat/ReportChatSlice';
import Select from 'react-select';
import { authSelector } from '../../../../app/Auth/AuthSlice';
import { layoutSetupSelector } from '../../../../app/Layouts/LayoutSlice';

const ReportChatFilter = () => {
  const refForm = useRef();

  const [dataChooseAgent, setDataChooseAgent] = useState([]);
  const [selectorStyles, setSelectorStyles] = useState({});

  const dispatch = useDispatch();

  const {
    filterMessage,
    filterChatId,
    filterNameClient,
    filterEmailClient,
    filterAgentId,
    filterStartDate,
    filterEndDate,
    filterSiteUserUrl,
    dataListAgentFilter,
  } = useSelector(reportChatSelector);

  const { user } = useSelector(authSelector);

  const { layoutMode } = useSelector(layoutSetupSelector);

  const handlerFilterChat = () => {
    const data = {
      page: 1,
      message: filterMessage,
      chat_id: !filterChatId ? '' : [filterChatId],
      user_name: filterNameClient,
      user_email: filterEmailClient,
      agent_id: filterAgentId,
      start_date: !filterStartDate
        ? ''
        : changeFormatDate(filterStartDate, 'no_time'),
      end_date: !filterEndDate
        ? ''
        : changeFormatDate(filterEndDate, 'no_time'),
      site_url: filterSiteUserUrl,
    };

    dispatch(updateNumberPage(1));
    dispatch(getListReport(data));
  };

  const handlerResetFilter = () => {
    refForm.current.reset();
    const data = {
      page: 1,
      message: '',
      chat_id: '',
      user_name: '',
      user_email: '',
      start_date: '',
      end_date: '',
    };

    dispatch(updateNumberPage(1));
    dispatch(resetFilter());
    dispatch(getListReport(data));
  };

  const handlerChooseDate = (event) => {
    let data = {
      startDate: !event[0] ? '' : changeFormatDate(event[0]),
      endDate: !event[1] ? '' : changeFormatDate(event[1]),
    };

    dispatch(updateFilterDateRange(data));
  };

  const handlerUpdateFilter = (type, event) => {
    const data = {
      field: type,
      value: event.target.value,
    };
    dispatch(updateFilter(data));
  };

  const handlerChooseAgent = (val) => {
    const data = {
      field: 'agent',
      value: !val ? '' : val.value,
    };
    dispatch(updateFilter(data));
  };

  /* useEffect */
  useEffect(() => {
    const token = user.token;
    dispatch(getListChoosedAgent(token));
  }, []);

  useEffect(() => {
    let dataArr = [];
    dataListAgentFilter.map((val) => {
      let data = {
        value: val.id,
        label: val.email,
        id: val.id,
      };
      dataArr.push(data);
    });

    setDataChooseAgent(dataArr);
  }, [dataListAgentFilter]);

  useEffect(() => {
    const bgColorSelector = layoutMode === 'light' ? '#fff' : '#2b3141';
    const textColorSelector = layoutMode === 'light' ? '#2b3141' : '#fff';

    setSelectorStyles({
      menu: (provided) => ({
        ...provided,
        backgroundColor: bgColorSelector,
        color: textColorSelector,
      }),
      control: (base) => ({
        ...base,
        borderColor: bgColorSelector,
        boxShadow: 'none',
        backgroundColor: bgColorSelector,
        color: textColorSelector,
        ':hover': {
          borderColor: bgColorSelector,
          color: textColorSelector,
          cursor: 'pointer',
          boxShadow: 'none',
        },
        ':active': {
          borderColor: bgColorSelector,
          color: textColorSelector,
          cursor: 'pointer',
          boxShadow: 'none',
        },
      }),
      option: (styles) => ({
        ...styles,
        color: textColorSelector,
        cursor: 'pointer',
        ':hover': {
          ...styles[':hover'],
          backgroundColor: textColorSelector,
          color: bgColorSelector,
        },
        ':active': {
          ...styles[':active'],
          backgroundColor: textColorSelector,
          color: bgColorSelector,
        },
      }),
      singleValue: (styles) => {
        return {
          ...styles,
          color: textColorSelector,
        };
      },
    });
  }, [layoutMode]);

  return (
    <>
      <div className="px-4 pt-3">
        <ClientHeaderTab attrClassName="mb-5" value="Filter Report Chat" />
      </div>

      <SimpleBar
        style={{ maxHeight: '100%' }}
        className="p-4 report-filter-desc"
      >
        <Form innerRef={refForm}>
          <FormGroup>
            <Label for="filterMessage">Message</Label>
            <Input
              id="filterMessage"
              name="message-input"
              placeholder="type message..."
              type="text"
              onChange={(event) => handlerUpdateFilter('message', event)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="filterChatID">Chat ID</Label>
            <Input
              id="filterChatID"
              name="chatid-input"
              placeholder="type chat id..."
              type="text"
              onChange={(event) => handlerUpdateFilter('chat_id', event)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="filterNameUser">Name Client</Label>
            <Input
              id="filterNameUser"
              name="chatid-input"
              placeholder="type name client..."
              type="text"
              onChange={(event) => handlerUpdateFilter('nama_client', event)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="filterEmailUser">Email Client</Label>
            <Input
              id="filterEmailUser"
              name="email-user-input"
              placeholder="type email client..."
              type="text"
              onChange={(event) => handlerUpdateFilter('email_client', event)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="filterEmailUser">Client Url</Label>
            <Input
              id="filterClientUrl"
              name="user-site-url-input"
              placeholder="type client url..."
              type="text"
              onChange={(event) => handlerUpdateFilter('user_site_url', event)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="filterNameAgent">Agent</Label>
            <Select
              className="form-control"
              classNamePrefix="Choose agent..."
              onChange={handlerChooseAgent}
              options={dataChooseAgent}
              styles={selectorStyles}
              isClearable
            />
          </FormGroup>
          <FormGroup>
            <Label for="filterEmailAgent">Start And End Date</Label>
            <DatePicker
              selectsRange={true}
              startDate={
                !filterStartDate
                  ? ''
                  : changeFormatDate(filterStartDate, 'to_iso')
              }
              endDate={
                !filterEndDate ? '' : changeFormatDate(filterEndDate, 'to_iso')
              }
              onChange={handlerChooseDate}
              placeholderText="Choose start and end date"
              className="form-control"
            />
          </FormGroup>
          <div className="d-flex justify-content-end mb-5">
            <Button
              type="button"
              color="danger"
              className="text-end me-2"
              onClick={() => handlerResetFilter()}
            >
              <i className="fas fa-undo-alt me-2"></i>Reset
            </Button>
            <Button
              type="button"
              color="tangerin"
              className="text-end"
              onClick={() => handlerFilterChat()}
            >
              <i className="fas fa-search me-2"></i> Search
            </Button>
          </div>
        </Form>
      </SimpleBar>
    </>
  );
};

export default ReportChatFilter;
