import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Row } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import { authSelector } from '../../../app/Auth/AuthSlice';
import AvatarDefault from '../../../assets/images/users/avatar/avatar-4.png';
import { detailChatClientSelector } from '../../../features/Client/DetailChat/DetailChatClientSlice';
import whatsappIntegration from '../../../whatsapp-integration';
import {
  capitalizeFirstLetter,
  capitalizeFirstMultiParagraph,
} from '../../utils/helpers';
import { handlerUpdateLabels } from '../../WebSocket/Clients/ClientActions';
import CardList from '../CardList/CardList';
import CustomCollapse from '../CustomCollapse/CustomCollapse';
import LabelDetailClient from '../Labels/LabelDetailClient';
import LabelSelector from '../Labels/LabelSelector';
import { getDataLabels, labelSelector } from '../Labels/LabelSlice';
import ModalMd from '../Modal/ModalMd';
import {
  updateCollapse,
  updateFormModalLabel,
  UserProfileSidebarSelector,
} from './UserProfileSidebarSlice';

// Function to get API endpoint based on instance (by phone - faster)
const getClientApiEndpointByPhone = (instance) => {
  const endpointMap = {
    'wa1': '/external/clientqwordsbyphone',
    'wa2': '/external/clientgoldenfastbyphone',
    'wa3': '/external/clientrelabsbyphone',
    'wa4': null, // Aksara - belum ada endpoint
    'wa5': '/external/clientgudangsslbyphone',
    'wa6': '/external/clientbikinwebsitebyphone'
  };
  return endpointMap[instance] || null;
};

// Function to get invoice URL based on instance and invoice ID
const getInvoiceUrl = (instance, invoiceId) => {
  if (!invoiceId) return null;

  const urlMap = {
    'wa1': `https://portal.qwords.com/qwadmin/billing/invoice/${invoiceId}`, // Qwords
    'wa2': `https://client.goldenfast.net/goldadmin/invoices.php?action=edit&id=${invoiceId}`, // GoldenFast
    'wa3': `https://portal.internetan.id/admin/billing/invoices/edit/${invoiceId}`, // Relabs
    'wa4': null, // Aksara - tidak ada URL
    'wa5': `https://client.gudangssl.id/admin/billing/invoices/edit/${invoiceId}`, // GudangSSL
    'wa6': `https://client.bikin.website/admin/billing/invoices/edit/${invoiceId}` // BikinWebsite
  };

  return urlMap[instance] || null;
};

// Function to get services URL based on instance and userid
const getServicesUrl = (instance, userid) => {
  if (!userid) return null;

  const urlMap = {
    'wa1': `https://portal.qwords.com/qwadmin/clientsservices.php?userid=${userid}`, // Qwords
    'wa2': `https://client.goldenfast.net/goldadmin/clientsservices.php?userid=${userid}`, // GoldenFast
    'wa3': `https://portal.internetan.id/admin/clients/clientservices?userid=${userid}`, // Relabs
    'wa4': null, // Aksara - tidak ada URL
    'wa5': `https://client.gudangssl.id/admin/clients/clientservices?userid=${userid}`, // GudangSSL
    'wa6': `https://client.bikin.website/admin/clients/clientservices?userid=${userid}` // BikinWebsite
  };

  return urlMap[instance] || null;
};

// Function to get tickets URL based on instance and userid
const getTicketsUrl = (instance, userid) => {
  if (!userid) return null;

  const urlMap = {
    'wa1': `https://portal.qwords.com/qwadmin/client/${userid}/tickets`, // Qwords
    'wa2': `https://client.goldenfast.net/goldadmin/client/${userid}/tickets`, // GoldenFast
    'wa3': `https://portal.internetan.id/admin/clients/clienttickets?userid=${userid}`, // Relabs
    'wa4': null, // Aksara - tidak ada URL
    'wa5': `https://client.gudangssl.id/admin/clients/clienttickets?userid=${userid}`, // GudangSSL
    'wa6': `https://client.bikin.website/admin/clients/clienttickets?userid=${userid}` // BikinWebsite
  };

  return urlMap[instance] || null;
};

// Function to fetch client data from external API by phone (faster - single query)
// Returns: { name: string, email: string, layanan_aktif: array, invoices_unpaid: array, ticket_selain_close: array } or null
const fetchClientDataFromAPI = async (phoneNumber, instance) => {
  try {
    const endpoint = getClientApiEndpointByPhone(instance);
    if (!endpoint) {
      return null;
    }

    // Skip if phone number is empty or invalid
    if (!phoneNumber || phoneNumber.trim() === '') {
      return null;
    }

    // Use by phone endpoint for faster query
    // Use AbortController to prevent console errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(`https://admin-chat.genio.id${endpoint}?phone=${encodeURIComponent(phoneNumber)}`, {
        signal: controller.signal,
        // Suppress default error logging by using mode
        mode: 'cors',
        credentials: 'omit'
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Handle abort and network errors silently
      if (fetchError.name === 'AbortError' || fetchError.name === 'TypeError') {
        return null;
      }
      // For other errors, use warn instead of error
      if (fetchError.message && !fetchError.message.includes('fetch')) {
        console.warn('⚠️ Warning fetching client data:', fetchError.message);
      }
      return null;
    }

    // Handle 400 (Bad Request) and 404 (Not Found) silently - these are expected cases
    if (response.status === 400 || response.status === 404) {
      // Silent return - no console log for expected 404/400
      return null; // Client not found or invalid request, return null silently
    }

    if (!response.ok) {
      // For other errors, use warn
      console.warn(`⚠️ API returned status ${response.status} for client data fetch`);
      return null; // Other response errors, return null
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      return null; // Data tidak valid, return null
    }

    // Client data is already returned (single client, not array)
    const client = data.data;

    if (client) {
      const firstName = client.firstname || '';
      const lastName = client.lastname || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = client.email || '';
      return {
        name: fullName || 'Client Belum Daftar',
        email: email,
        client_id: client.client_id || null,
        layanan_aktif: Array.isArray(client.layanan_aktif) ? client.layanan_aktif : [],
        invoices_unpaid: Array.isArray(client.invoices_unpaid) ? client.invoices_unpaid : [],
        ticket_selain_close: Array.isArray(client.ticket_selain_close) ? client.ticket_selain_close : []
      };
    }

    return null; // Client tidak ditemukan, return null
  } catch (error) {
    // Silent error handling - don't log expected errors
    // Only use warn for unexpected errors
    if (error.name !== 'AbortError' && error.name !== 'TypeError' && error.message && !error.message.includes('fetch')) {
      console.warn('⚠️ Warning fetching client data:', error.message);
    }
    return null; // Error, return null
  }
};

function ProfileClientChat(props) {
  const { detailClient, rightBarMenu, updateStatusRightBar } = props;
  const [userName, setUserName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isLoadingClientName, setIsLoadingClientName] = useState(false);
  const [layananAktif, setLayananAktif] = useState([]);
  const [invoicesUnpaid, setInvoicesUnpaid] = useState([]);
  const [ticketSelainClose, setTicketSelainClose] = useState([]);
  const [currentInstance, setCurrentInstance] = useState(null);
  const [clientId, setClientId] = useState(null);

  const dispatch = useDispatch();

  /* state & selector*/
  const [newLabels, setNewLabels] = useState([]);
  // Mobile detection
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const { user } = useSelector(authSelector);
  const { listLabels } = useSelector(labelSelector);
  const { labelChoosed, actionHistory } = useSelector(detailChatClientSelector);
  const {
    formModalLabel,
    isAboutCollapse,
    isLabelCollapse,
    isChatActionCollapse,
  } = useSelector(UserProfileSidebarSelector);

  /* use effect */
  useEffect(() => {
    dispatch(getDataLabels(user.token));
  }, [dispatch, user.token]);

  // Fetch client data from API for WhatsApp chats
  useEffect(() => {
    const fetchClientData = async () => {
      // Check if this is WhatsApp chat
      const chatId = detailClient.chat_id || '';
      const isWhatsAppChat = chatId.startsWith('whatsapp-');

      if (isWhatsAppChat) {
        setIsLoadingClientName(true);
        try {
          // Extract phone number from chat_id
          let phoneNumber = chatId.replace('whatsapp-', '').replace('-WA', '');

          // Remove instance suffix if present
          const instancePattern = /-(wa[1-6])$/i;
          if (instancePattern.test(phoneNumber)) {
            phoneNumber = phoneNumber.replace(instancePattern, '');
          }

          // Get instance from phoneToInstance map
          const instance = whatsappIntegration.phoneToInstance?.get(phoneNumber) || 'wa1';
          setCurrentInstance(instance);

          // Fetch client data from API (name, email, and additional fields)
          const clientData = await fetchClientDataFromAPI(phoneNumber, instance);
          if (clientData) {
            setUserName(clientData.name);
            setClientEmail(clientData.email);
            setClientId(clientData.client_id);
            setLayananAktif(clientData.layanan_aktif);
            setInvoicesUnpaid(clientData.invoices_unpaid);
            setTicketSelainClose(clientData.ticket_selain_close);
          } else {
            setUserName('Client Belum Daftar');
            setClientEmail('');
            setClientId(null);
            setLayananAktif([]);
            setInvoicesUnpaid([]);
            setTicketSelainClose([]);
          }
        } catch (error) {
          console.error('Error fetching client data:', error);
          setUserName('Client Belum Daftar');
          setClientEmail('');
          setClientId(null);
          setLayananAktif([]);
          setInvoicesUnpaid([]);
          setTicketSelainClose([]);
          setCurrentInstance(null);
        } finally {
          setIsLoadingClientName(false);
        }
      } else {
        // For non-WhatsApp chats, use existing logic
        if (Boolean(detailClient.user_name)) {
          setUserName(capitalizeFirstMultiParagraph(detailClient.user_name));
        } else {
          setUserName('');
        }
        setClientEmail(detailClient.user_email || '');
        setClientId(null);
        setLayananAktif([]);
        setInvoicesUnpaid([]);
        setTicketSelainClose([]);
        setCurrentInstance(null);
      }
    };

    fetchClientData();
  }, [detailClient.chat_id, detailClient.user_name, detailClient.user_email]);

  // Mobile view detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* handler */
  const handlerCollapseAbout = () => {
    dispatch(updateCollapse({ name: 'about', status: isAboutCollapse }));
  };

  const handlerCollapseLabel = () => {
    dispatch(updateCollapse({ name: 'label', status: isLabelCollapse }));
  };

  const handlerCollapseChatAction = () => {
    dispatch(
      updateCollapse({ name: 'chat_action', status: isChatActionCollapse })
    );
  };

  const handlerChangeStatusRightBar = () => {
    dispatch(updateStatusRightBar(false));
  };

  const handlerShowHideModalLabel = () => {
    const status = !formModalLabel ? true : false;
    if (!status) {
      setNewLabels([]);
    }
    dispatch(updateFormModalLabel(status));
  };

  const handlerSaveLabels = () => {
    const labels = [];

    if (newLabels.length > 0) {
      newLabels.map((value, key) => {
        let data = {
          name: value.label,
          color: value.color,
          id: value.value,
        };

        return labels.push(data);
      });
    }

    handlerUpdateLabels(detailClient.chat_id, labels);
    handlerShowHideModalLabel();
  };

  const handlerChooseLabel = (val) => {
    setNewLabels(val);
  };

  const handlerRemoveLabel = (val) => {
    const result = labelChoosed.filter((value) => {
      return value.id !== val;
    });

    handlerUpdateLabels(detailClient.chat_id, result);
  };

  const CompListActions = (params) => {
    const { data } = params;
    if (data) {
      return data.map((value, key) => {
        let colorBadge = '';
        let textBadge = '';

        const headerTitle = !value.action_name
          ? '-'
          : capitalizeFirstMultiParagraph(value.action_name.replace(/_/g, ' '));

        if (
          ['canceled_by_user', 'canceled_by_system'].includes(value.action_name)
        ) {
          colorBadge = 'danger';
          textBadge = 'white';
        } else if (['resolved'].includes(value.action_name)) {
          colorBadge = 'success';
          textBadge = 'white';
        } else if (
          ['assign_agent', 'first_response_sent'].includes(value.action_name)
        ) {
          colorBadge = 'tangerin';
          textBadge = 'white';
        } else {
          colorBadge = 'secondary';
          textBadge = 'white';
        }

        return (
          <Card className="p-2 border mb-2" key={key}>
            <div className="align-items-center">
              <div className="overflow-hidden">
                <CardList
                  classHeaderTitle="text-start font-size-16 mb-1"
                  withBadge
                  withBadgePill
                  badgeTextColor={textBadge}
                  headerTitle={headerTitle}
                  colorBadge={colorBadge}
                  withSmallContent
                  smallContent={value.formatted_date}
                  classSmallContent="text-end font-size-12 text-muted"
                >
                  <p className="text-muted font-size-12 mb-0">
                    {value.description}
                  </p>
                </CardList>
              </div>
            </div>
          </Card>
        );
      });
    }
  };

  return (
    <>
      <div
        style={{ display: 'block' }}
        className={classNames({
          'user-profile-sidebar': true,
          'profile-sidebar-full': rightBarMenu,
        })}
      >
        <div className="px-3 px-lg-4 pt-3 pt-lg-4">
          <div className="user-chat-nav text-end">
            {/* Tombol X hanya muncul di mobile */}
            {isMobileView && (
              <Button
                color="none"
                type="button"
                className="nav-btn"
                id="user-profile-hide"
                onClick={handlerChangeStatusRightBar}
              >
                <i className="ri-close-line"></i>
              </Button>
            )}
          </div>
        </div>
        <div className="text-center p-4 border-bottom">
          <div className="mb-4 d-flex justify-content-center">
            <img
              src={AvatarDefault}
              className="rounded-circle avatar-lg img-thumbnail"
              alt="avatar"
            />
          </div>
          <h5 className="font-size-16 mb-1 text-truncate">
            {isLoadingClientName ? 'Loading...' : (userName || '-')}
          </h5>
        </div>
        <SimpleBar
          style={{ maxHeight: '100%' }}
          className="p-4 user-profile-desc"
        >
          <Card className="mb-1 shadow-done border">
            <CustomCollapse
              title="About"
              iconClass="ri-user-line"
              isOpen={isAboutCollapse}
              toggleCollapse={handlerCollapseAbout}
            >
              <div>
                <p className="text-muted mb-1">Chat ID</p>
                <h5 className="font-size-14">{detailClient.chat_id}</h5>
              </div>
              <div className="mt-3">
                <p className="text-muted mb-1">User Name</p>
                <h5 className="font-size-14">
                  {isLoadingClientName ? 'Loading...' : (userName || '-')}
                </h5>
              </div>
              <div className="mt-3">
                <p className="text-muted mb-1">Email</p>
                <h5 className="font-size-14">
                  {isLoadingClientName ? 'Loading...' : (clientEmail || detailClient.user_email || '-')}
                </h5>
              </div>
              <div className="mt-3">
                <p className="text-muted mb-1">Layanan Aktif</p>
                {layananAktif.length > 0 ? (
                  <div className="font-size-14">
                    {layananAktif.map((layanan, index) => {
                      const servicesUrl = currentInstance && clientId ? getServicesUrl(currentInstance, clientId) : null;
                      return (
                        <div key={index} className="mb-1">
                          {servicesUrl ? (
                            <a
                              href={servicesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              {layanan || '-'}
                            </a>
                          ) : (
                            layanan || '-'
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <h5 className="font-size-14 mb-0">-</h5>
                )}
              </div>
              <div className="mt-3">
                <p className="text-muted mb-1">Invoices Unpaid</p>
                {invoicesUnpaid.length > 0 ? (
                  <div className="font-size-14">
                    {invoicesUnpaid.map((invoice, index) => {
                      const invoiceUrl = currentInstance ? getInvoiceUrl(currentInstance, invoice) : null;
                      return (
                        <div key={index} className="mb-1">
                          {invoiceUrl ? (
                            <a
                              href={invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              {invoice || '-'}
                            </a>
                          ) : (
                            invoice || '-'
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <h5 className="font-size-14 mb-0">-</h5>
                )}
              </div>
              <div className="mt-3">
                <p className="text-muted mb-1">Ticket Selain Close</p>
                {ticketSelainClose.length > 0 ? (
                  <div className="font-size-14">
                    {ticketSelainClose.map((ticket, index) => {
                      const ticketsUrl = currentInstance && clientId ? getTicketsUrl(currentInstance, clientId) : null;
                      return (
                        <div key={index} className="mb-1">
                          {ticketsUrl ? (
                            <a
                              href={ticketsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              {ticket || '-'}
                            </a>
                          ) : (
                            ticket || '-'
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <h5 className="font-size-14 mb-0">-</h5>
                )}
              </div>
            </CustomCollapse>
          </Card>
          <Card className="mb-1 shadow-done border">
            <CustomCollapse
              title="Labels"
              iconClass="ri-price-tag-3-line"
              isOpen={isLabelCollapse}
              toggleCollapse={handlerCollapseLabel}
            >
              <Row>
                {![9, 10, 11].includes(detailClient.status) && (
                  <Col xs="12" md="12" lg="12" xl="12" className="mb-2">
                    <div className="float-end">
                      {parseInt(detailClient.agent_id) ===
                        parseInt(user.agent_id) && (
                          <Button
                            color="tangerin"
                            className="btn-sm"
                            onClick={handlerShowHideModalLabel}
                          >
                            Add
                            <span className="ms-2">
                              <i className="ri-add-fill"></i>
                            </span>
                          </Button>
                        )}
                    </div>
                  </Col>
                )}
                <LabelDetailClient
                  detailClient={detailClient}
                  labelChoosed={labelChoosed}
                  removeLabel={(id) => handlerRemoveLabel(id)}
                />
              </Row>
            </CustomCollapse>
          </Card>
          {[9, 10, 11].includes(detailClient.status) && (
            <Card className="mb-1 shadow-done border">
              <CustomCollapse
                title="List Chat Actions"
                iconClass="ri-chat-history-line"
                isOpen={isChatActionCollapse}
                toggleCollapse={handlerCollapseChatAction}
              >
                <CompListActions data={actionHistory} />
              </CustomCollapse>
            </Card>
          )}
        </SimpleBar>
      </div>
      <ModalMd
        isOpen={formModalLabel}
        handlerFunc={handlerShowHideModalLabel}
        title="Form Label"
        headerModal={true}
        unmountOnClose={true}
        keyboard={false}
        centered={true}
        footerModal={
          <Button
            className="btn-sm"
            color="tangerin"
            onClick={handlerSaveLabels}
          >
            Save{' '}
            <span className="ms-2">
              <i className="ri-save-2-fill"></i>
            </span>
          </Button>
        }
        backdrop="static"
      >
        <LabelSelector
          listLabels={listLabels}
          labelChoosed={labelChoosed}
          updateLabel={(val) => handlerChooseLabel(val)}
        />
      </ModalMd>
    </>
  );
}

export default ProfileClientChat;
