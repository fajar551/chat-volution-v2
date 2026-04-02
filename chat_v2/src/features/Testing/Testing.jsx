import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import useSound from 'use-sound';
import boopSfx from '../../assets/sound/bell.mp3';

function Testing() {
  const btnRef = useRef(null);
  const [volume, setvolume] = useState(0);
  const [play] = useSound(boopSfx, {
    volume,
  });

  useEffect(() => {
    window.addEventListener('click', () => {
      btnRef.current.click();
    });
  }, []);

  const playSound = () => {
    setvolume(1);
    play();
  };

  return (
    <button ref={btnRef} onClick={() => playSound()}>
      Boop!
    </button>
  );
}

export default Testing;
