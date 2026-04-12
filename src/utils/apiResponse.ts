export const sendSuccess = <T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>,
) => {
  return {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
};
