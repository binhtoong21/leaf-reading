export type View = 'library' | 'notebook' | 'review';
export type Route = {view: View; reading: string | null};

// Hash routes also work when the production server serves one static entry point.
export function parseRoute(hash: string): Route {
  const match = hash.match(/^#\/(library|notebook|review)(?:\/read\/([^/]+))?$/);
  if (!match) return {view: 'library', reading: null};
  try {
    return {view: match[1] as View, reading: match[2] ? decodeURIComponent(match[2]) : null};
  } catch {
    return {view: 'library', reading: null};
  }
}

export function routeHash(route: Route): string {
  return `#/${route.view}${route.reading ? `/read/${encodeURIComponent(route.reading)}` : ''}`;
}
