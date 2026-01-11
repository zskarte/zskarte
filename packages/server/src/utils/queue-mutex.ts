import type { Context } from 'koa';

export type QueueTaskState =
  | 'queued'
  | 'waiting-to-start'
  | 'running'
  | 'finished'
  | 'rejected-before-start'
  | 'cancelled-during-run';

export interface EnqueueOptions<T = unknown> {
  maxWaitMs: number;
  fn: (task: QueueTask) => Promise<T>; // Critical work to execute
  /**
   * Called when task is rejected before start (timeout/client abort).
   * Can set ctx.status/ctx.body (e.g. 429).
   */
  onTimeout?: () => void;
}

export class QueueMutex {
  private isLocked = false;
  private queue: InternalQueueTask<any>[] = [];

  get locked() {
    return this.isLocked;
  }

  get queueLength() {
    return this.queue.length;
  }

  /**
   * Enqueues task with timeout + client abort handling.
   * Returns Promise<T> that resolves with result or rejects on error/timeout/abort.
   * Guarantees only ONE task runs at a time (serial execution).
   */
  enqueueWithTimeout<T>(ctx: Context, options: EnqueueOptions<T>): QueueTask<T> {
    const task = this.createTask(ctx, options);

    // Add to queue and process
    this.queue.push(task);
    this.processNext();

    return task;
  }

  private createTask<T>(ctx: Context, options: EnqueueOptions<T>): InternalQueueTask<T> {
    let resolveStarted: () => void;
    let rejectStarted: (e: unknown) => void;
    let resolveResult: (v: T) => void;
    let rejectResult: (e: unknown) => void;

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
      _resolveStarted: resolveStarted!,
      _rejectStarted: rejectStarted!,
      _resolveResult: resolveResult!,
      _rejectResult: rejectResult!,
      _ctx: ctx,
    };

    // Client abort handling
    const req: any = ctx.req;
    const res: any = ctx.res;

    const onClientAbort = () => {
      task.clientAborted = true;
      if (task.state === 'queued' || task.state === 'waiting-to-start') {
        this.rejectTaskBeforeStart(task, 'Client aborted');
      }
    };

    task._onClientAbort = onClientAbort;
    req.on('aborted', onClientAbort);
    res.on('close', onClientAbort);

    // Wait timeout before start
    task.state = 'waiting-to-start';
    task._waitTimeout = setTimeout(() => {
      if (task.state === 'waiting-to-start' || task.state === 'queued') {
        this.rejectTaskBeforeStart(task, 'Wait timeout');
      }
    }, options.maxWaitMs);

    return task;
  }

  private rejectTaskBeforeStart(task: InternalQueueTask<any>, reason: string) {
    task.aborted = true;
    task.state = 'rejected-before-start';

    if (task.options.onTimeout) {
      task.options.onTimeout();
    }

    task._rejectStarted(new Error(reason));
    task._rejectResult(new Error(reason));
    this.cleanupTask(task);
  }

  private async processNext() {
    // Skip if already locked
    if (this.isLocked) return;

    const task = this.queue.shift();
    if (!task) return;

    // Skip aborted tasks
    if (task.aborted || task.clientAborted) {
      this.cleanupTask(task);
      this.processNext();
      return;
    }

    this.isLocked = true;

    try {
      // Clear wait timeout - task is starting now
      if (task._waitTimeout) {
        clearTimeout(task._waitTimeout);
        task._waitTimeout = undefined;
      }

      // Signal task has started
      task.state = 'running';
      task._resolveStarted();

      // EXECUTE THE CRITICAL WORK - this is protected by the lock!
      const result = await task.options.fn(task);
      task._resolveResult(result);
      task.state = 'finished';
    } catch (error) {
      task.state = 'finished';
      task._rejectResult(error);
    } finally {
      // Lock released after fn() completes
      this.isLocked = false;
      this.cleanupTask(task);
      this.processNext(); // Process next task
    }
  }

  private cleanupTask(task: InternalQueueTask<any>) {
    if (task._waitTimeout) {
      clearTimeout(task._waitTimeout);
      task._waitTimeout = undefined;
    }

    if (task._ctx && task._onClientAbort) {
      const req: any = task._ctx.req;
      const res: any = task._ctx.res;
      req.off('aborted', task._onClientAbort);
      res.off('close', task._onClientAbort);
    }

    task._ctx = undefined;
    task._onClientAbort = undefined;
  }

  abortAll(reason = 'Tasks aborted by server'): void {
    // Copy queue to avoid mutation during iteration
    const waitingTasks = [...this.queue];

    for (const task of waitingTasks) {
      if (!task.aborted && !task.clientAborted) {
        this.rejectTaskBeforeStart(task, reason);
      }
    }
  }
}

export interface QueueTask<T = unknown> {
  state: QueueTaskState;
  aborted: boolean;
  clientAborted: boolean;
  started: Promise<void>;
  result: Promise<T>;
}

interface InternalQueueTask<T = unknown> extends QueueTask<T> {
  options: EnqueueOptions<T>;
  _resolveStarted: () => void;
  _rejectStarted: (e: unknown) => void;
  _resolveResult: (v: T) => void;
  _rejectResult: (e: unknown) => void;
  _waitTimeout?: NodeJS.Timeout;
  _onClientAbort?: () => void;
  _ctx?: Context;
}
