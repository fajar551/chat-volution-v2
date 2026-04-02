import { useRef } from 'react';
import SimpleBar from 'simplebar-react';
import LoaderSpinner from '../../../Common/Components/Loader/LoaderSpinner';
import Skeletons from '../../../Common/Components/Skeletons/';

function Loader() {
  const ref = useRef();
  const { SkeletonHeaderChat, SkeletonInputChat } = Skeletons;
  return (
    <>
      <div className="w-lg-flex">
        <div className="w-100">
          <div className="p-3 p-lg-4 border-bottom">
            <SkeletonHeaderChat />
          </div>
          <SimpleBar
            style={{ maxHeight: '100%' }}
            ref={ref}
            className="chat-conversation p-3 p-lg-4"
            id="messages"
          >
            <ul className="list-unstyled mb-0">
              <div className="d-flex justify-content-center align-items-center mt-1 mb-0">
                <LoaderSpinner />
              </div>
            </ul>
          </SimpleBar>
          <div className="p-3 p-lg-3 border-top mb-0">
            <SkeletonInputChat />
          </div>
        </div>
      </div>
    </>
  );
}

export default Loader;
