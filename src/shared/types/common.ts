export interface Result<T, E = string> {
  ok: boolean;
  value?: T;
  error?: E;
}

export class AppError extends Error {
  public code: string;
public statusCode?: number;
constructor(message: string, code: string, statusCode?: number) {
  super(message);
  this.name = 'AppError';
  this.code = code;
  this.statusCode = statusCode;
}
}

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E = string>(error: E): Result<never, E> {
  return { ok: false, error };
}