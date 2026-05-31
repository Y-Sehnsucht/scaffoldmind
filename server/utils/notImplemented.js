export function notImplemented(code, message) {
  return {
    ok: false,
    error: {
      code,
      message,
    },
  };
}
