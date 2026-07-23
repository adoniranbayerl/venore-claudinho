export type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
