export const response = (message: string, data?: Record<string, any>) => ({
  message,
  ...data,
});
