import { Fragment } from 'react';
import { useSelector } from 'react-redux';

/* reduxer */

/* component */
import { TabContent } from 'reactstrap';
import { detailChatClientSelector } from '../../../DetailChat/DetailChatClientSlice';
import BackendV2 from './BackendV2';
import { listChatClientSelector } from './ListChatClientSlice';
import OnGoing from './OnGoing';
import Pending from './Pending';
import Transfer from './Transfer';
import WhatsApp from './WhatsApp';
import LiveChat from './LiveChat';

function ListChat(props) {
  /* configuration */
  const { activeMenu } = props;

  /* selector */
  const {
    pending,
    transfer,
    ongoing,
    loader_pending,
    loader_ongoing,
    loader_transfer,
  } = useSelector(listChatClientSelector);

  const { chatId } = useSelector(detailChatClientSelector);

  /* return view */
  return (
    <Fragment>
      <TabContent activeTab={activeMenu}>
        <Pending
          data={pending}
          isLoader={loader_pending}
          chatIdActive={chatId}
        />
        <Transfer
          data={transfer}
          isLoader={loader_transfer}
          chatIdActive={chatId}
        />
        <OnGoing
          data={ongoing}
          isLoader={loader_ongoing}
          chatIdActive={chatId}
        />
        <WhatsApp
          chatIdActive={chatId}
        />
        <LiveChat
          chatIdActive={chatId}
        />
        <BackendV2
          chatIdActive={chatId}
        />
      </TabContent>
    </Fragment>
  );
}

export default ListChat;
