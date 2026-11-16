import {useEffect, useLayoutEffect, useState} from 'react';

type ReaderSession = {scrollY: number; size: number; focus: boolean};
const keyFor = (id: string) => `leaf:reader:${id}`;

function readSession(id: string): ReaderSession {
  try {
    const data = JSON.parse(sessionStorage.getItem(keyFor(id)) || '{}');
    return {
      scrollY: Number.isFinite(data.scrollY) && data.scrollY >= 0 ? data.scrollY : 0,
      size: [18, 20, 22, 24].includes(data.size) ? data.size : 20,
      focus: data.focus === true,
    };
  } catch {
    return {scrollY: 0, size: 20, focus: false};
  }
}

function saveSession(id: string, session: ReaderSession) {
  try {
    sessionStorage.setItem(keyFor(id), JSON.stringify(session));
  } catch {
    // Reading and annotation still work when browser storage is unavailable.
  }
}

export function useReaderSession(passageId: string) {
  const [initial] = useState(() => readSession(passageId));
  const [size, setSize] = useState(initial.size);
  const [focus, setFocus] = useState(initial.focus);

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const frame = requestAnimationFrame(() => window.scrollTo(0, initial.scrollY));
    return () => {
      cancelAnimationFrame(frame);
      window.history.scrollRestoration = previous;
    };
  }, [passageId, initial]);

  useEffect(() => {
    let position = readSession(passageId).scrollY;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const save = () => saveSession(passageId, {scrollY: position, size, focus});
    const onScroll = () => {
      position = window.scrollY;
      clearTimeout(timer);
      timer = setTimeout(save, 150);
    };
    const onHidden = () => { if (document.visibilityState === 'hidden') save(); };
    save();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      clearTimeout(timer);
      save();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [passageId, size, focus]);

  return {size, setSize, focus, setFocus};
}
