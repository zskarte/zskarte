import { TRPCError } from '@trpc/server';

export type QueueTaskState =
  | 'queued'
  | 'waiting-to-start'
  | 'running'
  | 'finished'
  | 'rejected-before-start'
  | 'cancelled-during-run';

export interface EnqueueOptions<T = unknown> {
  maxWaitMs: number;
  fn: (task: QueueTask) => Promise<T>;
  signal?: AbortSignal;
  req?: any;
  res?: any;
  onTimeout?: () => void;
}

export interface QueueTask<T = unknown> {
  readonly state: QueueTaskState;
  readonly aborted: boolean;
  readonly clientAborted: boolean;
  readonly started: Promise<void>;
  readonly result: Promise<T>;
}

interface InternalQueueTask<T = unknown> extends QueueTask<T> {
  state: QueueTaskState;
  aborted: boolean;
  clientAborted: boolean;
  options: EnqueueOptions<T>;
  started: Promise<void>;
  result: Promise<T>;
  _resolveStarted: () => void;
  _rejectStarted: (e: unknown) => void;
  _resolveResult: (v: T) => void;
  _rejectResult: (e: unknown) => void;
  _waitTimeout?: ReturnType<typeof setTimeout>;
  _onAbortListener?: () => void;
  _onReqAbortListener?: () => void;
  _onResCloseListener?: () => void;
}

export class QueueMutex {
  private isLocked = false;
  private queue: InternalQueueTask<any>[] = [];

  get locked(): boolean {
    return this.isLocked;
  }

  get queueLength(): number {
    return this.queue.length;
  }

  enqueueWithTimeout<T>(options: EnqueueOptions<T>): QueueTask<T> {
    const task = this.createTask(options);

    this.queue.push(task);
    this.processNext();

    return task;
  }

  abortAll(reason = 'Operation aborted'): void {
    const queuedTasks = [...this.queue];
    this.queue = [];

    for (const task of queuedTasks) {
      this.rejectTaskBeforeStart(task, reason);
    }
  }

  private createTask<T>(options: EnqueueOptions<T>): InternalQueueTask<T> {
    let resolveStarted!: () => void;
    let rejectStarted!: (e: unknown) => void;
    let resolveResult!: (v: T) => void;
    let rejectResult!: (e: unknown) => void;

    const started = new Promise<void>((resolve, reject) => {
      resolveStarted = resolve;
      rejectStarted = reject;
    });

    const result = new Promise<T>((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    });

    const task: InternalQueueTask<T> = {
      state: 'queued',
      aborted: false,
      clientAborted: false,
      options,
      started,
      result,
      _resolveStarted: resolveStarted,
      _rejectStarted: rejectStarted,
      _resolveResult: resolveResult,
      _rejectResult: rejectResult,
    };

    const onClientAbort = () => {
      task.clientAborted = true;
      if (task.state === 'queued' || task.state === 'waiting-to-start') {
        this.rejectTaskBeforeStart(task, 'Client aborted');
      }
    };

    if (options.signal) {
      if (options.signal.aborted) {
        onClientAbort();
      } else {
        task._onAbortListener = onClientAbort;
        options.signal.addEventListener('abort', onClientAbort, { once: true });
      }
    }

    if (options.req?.on) {
      task._onReqAbortListener = onClientAbort;
      options.req.on('aborted', onClientAbort);
    }
    if (options.res?.on) {
      task._onResCloseListener = onClientAbort;
      options.res.on('close', onClientAbort);
    }

    task.state = 'waiting-to-start';
    task._waitTimeout = setTimeout(() => {
      if (task.state === 'waiting-to-start' || task.state === 'queued') {
        this.rejectTaskBeforeStart(task, 'Wait timeout');
      }
    }, options.maxWaitMs);

    return task;
  }

  private rejectTaskBeforeStart(task: InternalQueueTask<any>, reason: string): void {
    task.aborted = true;
    task.state = 'rejected-before-start';

    if (task.options.onTimeout) {
      task.options.onTimeout();
    }

    this.cleanupListeners(task);

    const index = this.queue.indexOf(task);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }

    const error =
      reason === 'Wait timeout' ?
        new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Lock not available within 15 seconds' })
      : new TRPCError({ code: 'BAD_REQUEST', message: reason });

    task._rejectStarted(error);
    task._rejectResult(error);
  }

  private cleanupListeners(task: InternalQueueTask<any>): void {
    if (task._waitTimeout) {
      clearTimeout(task._waitTimeout);
      task._waitTimeout = undefined;
    }
    if (task._onAbortListener && task.options.signal) {
      task.options.signal.removeEventListener('abort', task._onAbortListener);
      task._onAbortListener = undefined;
    }
    if (task._onReqAbortListener && task.options.req?.removeListener) {
      task.options.req.removeListener('aborted', task._onReqAbortListener);
      task._onReqAbortListener = undefined;
    }
    if (task._onResCloseListener && task.options.res?.removeListener) {
      task.options.res.removeListener('close', task._onResCloseListener);
      task._onResCloseListener = undefined;
    }
  }

  private async processNext(): Promise<void> {
    if (this.isLocked || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    if (task.aborted || task.state === 'rejected-before-start') {
      this.processNext();
      return;
    }

    this.isLocked = true;
    task.state = 'running';

    if (task._waitTimeout) {
      clearTimeout(task._waitTimeout);
      task._waitTimeout = undefined;
    }

    task._resolveStarted();

    try {
      const value = await task.options.fn(task);
      task.state = 'finished';
      this.cleanupListeners(task);
      task._resolveResult(value);
    } catch (err) {
      task.state = 'finished';
      this.cleanupListeners(task);
      task._rejectResult(err);
    } finally {
      this.isLocked = false;
      this.processNext();
    }
  }
}
