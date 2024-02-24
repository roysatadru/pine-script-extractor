export const parseErrorObject = (
  error: unknown,
  extraData: Record<string, unknown> = {},
) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObject = {} as Record<string, unknown>;

    Object.getOwnPropertyNames(error).forEach((key) => {
      const errorKey = key as keyof typeof error;
      errorObject[errorKey] = error[errorKey];
    });

    return { ...errorObject, extraData };
  }

  return {
    extraData,
  } as Record<string, unknown>;
};

export const stringifyErrorObject = (
  error: unknown,
  extraData: Record<string, unknown> = {},
) => {
  return JSON.stringify(parseErrorObject(error, extraData), null, 2);
};
