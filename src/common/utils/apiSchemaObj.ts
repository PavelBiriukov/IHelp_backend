export const schema = (schemaMessage, schemaError, schemaStatusCode) => {
  let obj;
  if (schemaError) {
    obj = {
      type: 'object',
      example: {
        message: schemaMessage,
        error: schemaError,
        statusCode: schemaStatusCode,
      },
    };
  } else {
    obj = {
      type: 'object',
      example: {
        message: schemaMessage,
        statusCode: schemaStatusCode,
      },
    };
  }
  return obj;
};
