import {useEffect, useState} from 'react';
import {parseRoute, routeHash, type Route} from './navigation';

export function useNavigation() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const sync = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  function go(next: Route, replace = false) {
    const hash = routeHash(next);
    if (hash !== window.location.hash) {
      window.history[replace ? 'replaceState' : 'pushState'](null, '', hash);
    }
    setRoute(next);
  }

  return { ...route, go };
}
