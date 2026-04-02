import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, UncontrolledTooltip} from 'reactstrap';
import SimpleBar from 'simplebar-react';
import BubbleChatClient from '../../Common/Components/BubbleChat/BubbleChatClient';
import CustomCollapse from '../../Common/Components/CustomCollapse/CustomCollapse';
import ClientHeaderTab from '../../Common/Components/HeaderTab/ClientHeaderTab';
import ModalFullScreen from '../../Common/Components/Modal/ModalFullScreen';
import ModalMd from '../../Common/Components/Modal/ModalMd';
import TableComp from '../../Common/Components/TableComp';
import {
  changeStatusModal,
  getDetailReportChat,
  getListReport,
  reportChatSelector,
  updateNumberPage,
} from './ReportChatSlice';
import { sendChatHistory } from '../Client/DetailChat/DetailChatClientAPI';
import {notify} from '../../Common/utils/helpers';

function ReportChat() {
  const dispatch = useDispatch();
  const refBubbleReportChat = useRef();
  const [headerTable, setHeaderTable] = useState([]);
  const [dataBodyTable, setDataBodyTable] = useState([]);
  const [dataCountTable, setDataCountTable] = useState({});
  const [loaderSendHistoryChat, setLoaderSendHistoryChat] = useState(false);
  const [isModalSendChat, setIsModalSendChat] = useState(false);
  const [emailClient, setEmailClient] = useState('');
  const [currentStateId, setCurrentStateId] = useState('');
  const [detailObjectTabel, setDetailObjectTabel] = useState({});
  const {
    dataHistoryReportChat,
    page,
    filterMessage,
    filterChatId,
    filterNameClient,
    filterEmailClient,
    filterAgentId,
    filterStartDate,
    filterEndDate,
    totalDataHistory,
    currentPageHistory,
    totalPageHistory,
    dataDetailReportChat,
    dataChatReplies,
    isModal,
  } = useSelector(reportChatSelector);
  const handlerGetListReport = () => {
    const params = {
      page: page,
      message: filterMessage,
      chat_id: !filterChatId ? '' : [filterChatId],
      user_name: filterNameClient,
      user_email: filterEmailClient,
      start_date: filterStartDate,
      end_date: filterEndDate,
      agent_id: filterAgentId,
    };
    dispatch(getListReport(params));
  };

  const handlerChangePage = (val) => {
    dispatch(updateNumberPage(val));
  };

  const toggleHandlerModalHistoryChat = (params) => {
    if (loaderSendHistoryChat) {
      setIsModalSendChat(true);
    } else {
      const status = isModalSendChat ? false : true;
      setIsModalSendChat(status);
      setDetailObjectTabel(params)
    }
  };

  const testingModal = () => {
    console.log("test");
  }

  const handlerModalReportChat = () => {
    const isStatus = !isModal ? true : false;
    dispatch(changeStatusModal(isStatus));
  };

  const handlerChangeEmailClient = (event) => {
    setEmailClient(event.target.value);
  };

  const showDetailReport = (chatId) => {
    dispatch(getDetailReportChat(chatId));
  };

  const handlerSendHistory = () => {
    dataHistoryReportChat.map((obj) => {
      if (!obj.user_email) {
        return notify('error', 3000, `Email client is required!`);
      }
      setLoaderSendHistoryChat(true);

    const data = {
      chat_id: obj.chat_id,
      user_email: obj.user_email,
    };

    sendChatHistory(data)
      .then((response) => {
        setLoaderSendHistoryChat(false);
        return notify('success', 3000, `Send history chat success!`);
      })
      .catch((err) => {
        setLoaderSendHistoryChat(false);
        return notify('error', 3000, `Send history failed, please try again!`);
      });
    })
  };

  useEffect(() => {
    if (totalDataHistory > 0 && dataHistoryReportChat && dataHistoryReportChat.length > 0) {
      const listBody = [];
      dataHistoryReportChat.map((obj) => {
        let data = {
          chat_id: (
            <Link
              to="#"
              className="text-tangerin text-decoration-underline"
              onClick={() => showDetailReport(obj.chat_id)}
            >
              {obj.chat_id}
            </Link>
          ),
          message: obj.message,
          user_name: obj.user_name,
          agent_name: obj.agent_name,
          rating: obj.rating || '-',
          perusahaan: obj.perusahaan || '-',
          user_site_url: (
            <a
              rel="noreferrer"
              href={obj.user_site_url}
              className="text-tangerin text-decoration-underline"
              target="_blank"
            >
              {obj.user_site_url}
            </a>
          ),
          send_history: (
            <div>
              <button
                type="button"
                id="forwardChat"
                className="btn text-tangerin p-0 m-0"
                onClick={()=>toggleHandlerModalHistoryChat(obj)}
              >
               <p className='m-0 p-0'> <i className="ri-chat-forward-fill m-2"></i> Send History Chat</p>
              </button>
            </div>
          ),
        };
        return listBody.push(data);
      });
      setDataBodyTable(listBody);

      const countingTable = {
        current: currentPageHistory,
        total_data: totalDataHistory,
        total_page: totalPageHistory,
      };

      setDataCountTable(countingTable);
    } else {
      setDataBodyTable([]);

      const countingTable = {
        current: 0,
        total_data: 0,
        total_page: 0,
      };
      setDataCountTable(countingTable);
    }
  }, [
    dataHistoryReportChat,
    totalDataHistory,
    currentPageHistory,
    totalPageHistory,
  ]);

  useEffect(() => {
    const header = [
      {
        title: 'Chat Id',
        short: false,
        field: 'chat_id',
      },
      {
        title: 'Message',
        short: false,
        field: 'message',
      },
      {
        title: 'Client Name',
        short: false,
        field: 'user_name',
      },
      {
        title: 'Agent Name',
        short: false,
        field: 'agent_name',
      },
      {
        title: 'Rating',
        short: false,
        field: 'rating',
      },
      {
        title: 'Perusahaan',
        short: false,
        field: 'perusahaan',
      },
      {
        title: 'Client Url',
        short: false,
        field: 'user_site_url',
      },
      {
        title: 'Send History Chat',
        short: false,
        field: 'send_history',
      },
    ];

    setHeaderTable(header);

    handlerGetListReport();
  }, []);

  useEffect(() => {
    handlerGetListReport();
  }, [page]);

  return (
    <>
      <div className="w-100 border-start" style={{ overflowX: 'hidden' }}>
        <SimpleBar
          style={{ maxHeight: '100%' }}
          className="p-3 report-filter-desc"
        >
          <div className="row">
            <div className="col-12">
              <div className="px-2 py-3">
                <ClientHeaderTab value="List Report Chat" />
              </div>
            </div>
            <div className="col-12">
              <div className="px-2 py-2">
                <TableComp
                  theadData={headerTable}
                  dataTBody={dataBodyTable}
                  countTable={dataCountTable}
                  paginateClick={handlerChangePage}
                />
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>
      <ModalFullScreen
        isOpen={isModal}
        handlerFunc={handlerModalReportChat}
        title="Detail Report Chat"
        headerModal={true}
        unmountOnClose={true}
        keyboard={true}
        centered={true}
        backdrop="static"
      >
        <div className="row">
          <div className="col-8">
            <SimpleBar
              ref={refBubbleReportChat}
              className="report-detail-chat-conversation px-3"
              id="messages"
            >
              <ul className="list-unstyled mb-0">
                {dataChatReplies.map((val, index) => {
                  return <BubbleChatClient key={index} data={val} />;
                })}
              </ul>
            </SimpleBar>
          </div>
          <div className="col-4 border-start border-5">
            <SimpleBar className="report-detail-chat-conversation px-3">
              <Card className="mb-1 shadow-done border">
                <CustomCollapse
                  title="About"
                  iconClass="ri-user-line"
                  isOpen={true}
                >
                  <div>
                    <p className="text-muted mb-1">Chat ID</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.chat_id
                        ? '-'
                        : dataDetailReportChat.chat_id}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Client Username</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.user_name
                        ? '-'
                        : dataDetailReportChat.user_name}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Client Email</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.user_email
                        ? '-'
                        : dataDetailReportChat.user_email}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Client Phone</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.user_phone
                        ? '-'
                        : dataDetailReportChat.user_phone}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">First Chat</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.message
                        ? '-'
                        : dataDetailReportChat.message}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Client IP</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.user_ip
                        ? '-'
                        : dataDetailReportChat.user_ip}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Client Browser Access</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.user_client_agent
                        ? '-'
                        : dataDetailReportChat.user_client_agent}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Channel Name</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.channel_name
                        ? '-'
                        : dataDetailReportChat.channel_name}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Department Name</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.department_name
                        ? '-'
                        : dataDetailReportChat.department_name}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Topic</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.topic_name
                        ? '-'
                        : dataDetailReportChat.topic_name}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Rate From Client</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.rating
                        ? '-'
                        : dataDetailReportChat.rating}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">First Chat Time</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.formatted_date
                        ? '-'
                        : dataDetailReportChat.formatted_date}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Agent Name</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.formatted_date
                        ? '-'
                        : dataDetailReportChat.formatted_date}
                    </h5>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Agent Email</p>
                    <h5 className="font-size-14">
                      {!dataDetailReportChat.formatted_date
                        ? '-'
                        : dataDetailReportChat.formatted_date}
                    </h5>
                  </div>
                </CustomCollapse>
              </Card>
            </SimpleBar>
          </div>
        </div>
      </ModalFullScreen>
      <div>
        <ModalMd
          isOpen={isModalSendChat}
          handlerFunc={toggleHandlerModalHistoryChat}
          title="Send History Chat"
          headerModal={true}
          unmountOnClose={true}
          keyboard={true}
          centered={true}
          backdrop="static"
        >
          <Form as="div">
            <Form.Group className="mb-3" controlId="ChatIDForm">
              <Form.Label>Chat ID</Form.Label>
              <p>{detailObjectTabel.chat_id}</p>
            </Form.Group>
            <Form.Group className="mb-3" controlId="EmailForm">
              <Form.Label>
                Email Client <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                onChange={handlerChangeEmailClient}
                type="email"
                value={detailObjectTabel.user_email}
                placeholder="Type email client"
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-tangerin"
                onClick={handlerSendHistory}
                disabled={loaderSendHistoryChat ? true : false}
              >
                {loaderSendHistoryChat ? 'Loading...' : 'Send'}
              </button>
            </div>
          </Form>
        </ModalMd>
      </div>
    </>

  );
}


export default ReportChat;
