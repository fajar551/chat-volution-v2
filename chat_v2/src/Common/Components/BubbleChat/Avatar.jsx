import React from 'react';

import avatarDefault from '../../../assets/images/users/avatar/avatar-4.png';

const Image = React.memo(
  function Image({ src }) {
    const avatar = !Boolean(src) ? avatarDefault : src;
    return <img src={avatar} alt="avatar-user" />;
  },
  (prevProps, nextProps) => {
    return prevProps.src === nextProps.src;
  }
);

function Avatar(props) {
  /* config */
  const { avatar, dtClass } = props;

  return (
    <div className={dtClass}>
      <Image src={avatar} />
    </div>
  );
}

export default Avatar;
