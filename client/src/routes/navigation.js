export function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/landing';
  }

  return window.location.pathname || '/landing';
}

export function navigateTo(path) {
  if (typeof window === 'undefined') {
    return;
  }

  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function handleRouteClick(event, path) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  event.preventDefault();
  navigateTo(path);
}
