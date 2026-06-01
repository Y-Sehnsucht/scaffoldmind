export function ok(data) {
  return {
    ok: true,
    data,
    error: null,
  };
}

export function validationError(message) {
  return {
    ok: false,
    data: null,
    error: {
      code: 'VALIDATION_ERROR',
      message,
    },
  };
}

export function sendValidationError(res, message) {
  return res.status(400).json(validationError(message));
}
