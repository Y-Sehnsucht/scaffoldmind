export function loadJson(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function saveJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
