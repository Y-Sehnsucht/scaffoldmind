export function ok(data) {
  return {
    ok: true,
    data,
  };
}

export function validationError(message) {
  return {
    ok: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
    },
  };
}

export function sendValidationError(res, message) {
  return res.status(400).json(validationError(message));
}
