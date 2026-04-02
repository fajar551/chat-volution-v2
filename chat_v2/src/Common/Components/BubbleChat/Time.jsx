import React from 'react';
import { parseDateNowVWa, parseDateNowVWaComplete } from '../../utils/helpers';

function Time(props) {
  const { date, complete = false } = props;

  // Jika complete = true, gunakan format lengkap (tanggal dan jam) untuk detail chat
  // Jika complete = false, gunakan format biasa (jam jika hari ini, tanggal jika bukan hari ini) untuk list chat
  const dateFormatted = complete
    ? parseDateNowVWaComplete(date)
    : parseDateNowVWa(date);

  return (
    <p className="chat-time mb-0">
      <span className="align-middle">{dateFormatted}</span>
    </p>
  );
}

export default Time;
