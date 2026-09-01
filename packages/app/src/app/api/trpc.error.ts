import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@zskarte/server-next/router';

export interface TrpcError {
  status: number;
  code?: string;
  message: string;
}

/** mirrors the `{ result, error }` shape of the strapi era `ApiService` so call sites keep their branches. */
export interface TrpcResponse<T> {
  result?: T;
  error?: TrpcError;
}

export function isTRPCClientError(error: unknown): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

/** maps a tRPC client error onto the `{ status, message }` shape the call sites branch on. */
export function mapTRPCError(error: unknown): TrpcError {
  if (isTRPCClientError(error)) {
    return {
      status: error.data?.httpStatus ?? 500,
      code: error.data?.code,
      message: error.message,
    };
  }
  if (error instanceof Error) {
    return { status: 0, message: error.message };
  }
  return { status: 0, message: String(error) };
}

/** runs a procedure call and answers `{ result }` or `{ error }` instead of throwing. */
export async function trpcRequest<T>(request: Promise<T>): Promise<TrpcResponse<T>> {
  try {
    return { result: await request };
  } catch (error) {
    console.error('Error on trpc call', error);
    return { error: mapTRPCError(error) };
  }
}
