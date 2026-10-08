export function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/landing';
  }

  const route = getHashRoute();
  return route.split('?')[0] || '/landing';
}

export function getCurrentSearchParams() {
  const route = getHashRoute();
  const queryIndex = route.indexOf('?');
  return new URLSearchParams(queryIndex === -1 ? '' : route.slice(queryIndex + 1));
}

export function routeHref(path) {
  const baseUrl = import.meta.env?.BASE_URL || '/';
  return `${baseUrl}#${path}`;
}

export function navigateTo(path) {
  if (typeof window === 'undefined') {
    return;
  }

  window.history.pushState({}, '', routeHref(path));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function handleRouteClick(event, path) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  event.preventDefault();
  navigateTo(path);
}

function getHashRoute() {
  if (typeof window === 'undefined') {
    return '/landing';
  }

  const hash = window.location.hash.slice(1);
  return hash.startsWith('/') ? hash : '/landing';
}
