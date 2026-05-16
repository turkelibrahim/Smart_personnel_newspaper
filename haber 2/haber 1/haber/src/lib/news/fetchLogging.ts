import { prisma } from '@/lib/db';

interface FetchLogContext {
  sourceId: string;
  status: string;
  message?: string;
  fetchedCount?: number;
  errorCount?: number;
  startedAt?: Date;
  finishedAt?: Date;
}

async function safeWrite(payload: FetchLogContext & { id?: string }) {
  try {
    if (payload.id) {
      return await prisma.fetchLog.update({
        where: { id: payload.id },
        data: {
          status: payload.status,
          message: payload.message,
          fetchedCount: payload.fetchedCount ?? 0,
          errorCount: payload.errorCount ?? 0,
          finishedAt: payload.finishedAt ?? new Date(),
        },
      });
    }

    return await prisma.fetchLog.create({
      data: {
        sourceId: payload.sourceId,
        status: payload.status,
        message: payload.message,
        fetchedCount: payload.fetchedCount ?? 0,
        errorCount: payload.errorCount ?? 0,
        startedAt: payload.startedAt ?? new Date(),
        finishedAt: payload.finishedAt,
      },
    });
  } catch (error) {
    console.error('[FETCH LOG FALLBACK]', payload, error);
    return null;
  }
}

export async function startFetchLog(sourceId: string, message?: string) {
  const record = await safeWrite({
    sourceId,
    status: 'RUNNING',
    message,
    fetchedCount: 0,
    errorCount: 0,
    startedAt: new Date(),
  });

  return record?.id ?? null;
}

export async function finishFetchLog(
  logId: string | null,
  sourceId: string,
  input: { message?: string; fetchedCount?: number; errorCount?: number }
) {
  return safeWrite({
    id: logId ?? undefined,
    sourceId,
    status: input.errorCount ? 'PARTIAL' : 'SUCCESS',
    message: input.message,
    fetchedCount: input.fetchedCount ?? 0,
    errorCount: input.errorCount ?? 0,
    finishedAt: new Date(),
  });
}

export async function failFetchLog(
  logId: string | null,
  sourceId: string,
  input: { message?: string; fetchedCount?: number; errorCount?: number }
) {
  return safeWrite({
    id: logId ?? undefined,
    sourceId,
    status: 'FAILED',
    message: input.message,
    fetchedCount: input.fetchedCount ?? 0,
    errorCount: input.errorCount ?? 1,
    finishedAt: new Date(),
  });
}
