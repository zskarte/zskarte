import { getTableName, isTable } from 'drizzle-orm';
import type { Database } from '../../src/db/client.js';

export interface CapturedSelectQuery {
  type: 'select';
  table?: any;
  tableName?: string;
  fields?: any;
  from?: any;
  joins: Array<{ type: string; table: any; condition: any }>;
  where?: any;
  orderBy: any[];
  groupBy: any[];
  limit?: number;
  offset?: number;
}

export interface CapturedInsertQuery {
  type: 'insert';
  table?: any;
  tableName?: string;
  values: any;
  onConflict?: {
    action: 'ignore' | 'update';
    target?: any;
    set?: any;
  };
  returningFields?: any;
}

export interface CapturedUpdateQuery {
  type: 'update';
  table?: any;
  tableName?: string;
  values: any;
  where?: any;
  returningFields?: any;
}

export interface CapturedDeleteQuery {
  type: 'delete';
  table?: any;
  tableName?: string;
  where?: any;
  returningFields?: any;
}

export type CapturedQuery = CapturedSelectQuery | CapturedInsertQuery | CapturedUpdateQuery | CapturedDeleteQuery;

export interface CapturedState {
  queries: CapturedQuery[];
  selects: CapturedSelectQuery[];
  inserts: CapturedInsertQuery[];
  updates: CapturedUpdateQuery[];
  deletes: CapturedDeleteQuery[];
  inserted: any[];
  updated: any[];
  deleted: any[];
  where: any[];
  tables: any[];
}

export interface MockDbOptions {
  /**
   * Queue of select results returned sequentially on each select query.
   */
  selects?: unknown[][];
  /**
   * Queue of returning results returned sequentially on insert/update/delete.
   */
  returning?: unknown[][];
  /**
   * Default rows returned by select queries when selects queue is empty.
   */
  rows?: unknown[];
  /**
   * Map of table name to rows or dynamic table handler function.
   */
  tables?: Record<string, unknown[] | ((query: CapturedSelectQuery) => unknown[])>;
  /**
   * Dynamic query handler for select queries.
   */
  queryHandler?: (query: CapturedSelectQuery) => unknown[] | Promise<unknown[]>;
  /**
   * Callback invoked whenever an insert query executes.
   */
  onInsert?: (values: unknown, table?: unknown, query?: CapturedInsertQuery) => void;
  /**
   * Callback invoked whenever an update query executes.
   */
  onUpdate?: (values: unknown, condition?: unknown, table?: unknown, query?: CapturedUpdateQuery) => void;
  /**
   * Callback invoked whenever a delete query executes.
   */
  onDelete?: (condition?: unknown, table?: unknown, query?: CapturedDeleteQuery) => void;
  /**
   * If set, select queries will throw/reject with this error.
   */
  selectError?: Error | unknown;
  /**
   * If set, insert queries will throw/reject with this error.
   */
  insertError?: Error | unknown;
  /**
   * If set, update queries will throw/reject with this error.
   */
  updateError?: Error | unknown;
  /**
   * If set, delete queries will throw/reject with this error.
   */
  deleteError?: Error | unknown;
}

export interface MockDbHandle {
  db: Database;
  captured: CapturedState;
  reset: () => void;
  setRows: (rows: unknown[]) => void;
  setSelects: (selects: unknown[][]) => void;
  setReturning: (returning: unknown[][]) => void;
  setTable: (tableName: string, rows: unknown[] | ((query: CapturedSelectQuery) => unknown[])) => void;
}

/**
 * Safely extracts the table name string from a Drizzle table instance or raw value.
 */
export function extractTableName(table: unknown): string | undefined {
  if (!table) return undefined;
  if (typeof table === 'string') return table;
  try {
    if (isTable(table)) {
      return getTableName(table);
    }
  } catch {
    // fallback to inspection
  }
  if (typeof table === 'object') {
    const t = table as Record<string, unknown>;
    if (typeof t.tableName === 'string') return t.tableName;
    if (typeof t.name === 'string') return t.name;
    const internal = t._ as Record<string, unknown> | undefined;
    if (typeof internal?.name === 'string') return internal.name;
    for (const sym of Object.getOwnPropertySymbols(t)) {
      if (sym.description && (sym.description.includes('Name') || sym.description.includes('drizzle'))) {
        const val = t[sym as unknown as string];
        if (typeof val === 'string') return val;
      }
    }
  }
  return undefined;
}

/**
 * Creates a unified, chainable mock Drizzle database for unit and integration testing.
 */
export function createMockDb(initialOptions: MockDbOptions = {}): MockDbHandle {
  const selectsQueue: unknown[][] = initialOptions.selects ? [...initialOptions.selects] : [];
  const returningQueue: unknown[][] = initialOptions.returning ? [...initialOptions.returning] : [];
  let defaultRows: unknown[] = initialOptions.rows ? [...initialOptions.rows] : [];
  const tableRegistry: Record<string, unknown[] | ((query: CapturedSelectQuery) => unknown[])> = {
    ...(initialOptions.tables ?? {}),
  };

  const captured: CapturedState = {
    queries: [],
    selects: [],
    inserts: [],
    updates: [],
    deletes: [],
    inserted: [],
    updated: [],
    deleted: [],
    where: [],
    tables: [],
  };

  const recordTable = (table: unknown) => {
    if (table !== undefined && !captured.tables.includes(table)) {
      captured.tables.push(table);
    }
  };

  const recordWhere = (where: unknown) => {
    if (where !== undefined) {
      captured.where.push(where);
    }
  };

  const executeSelect = async (query: CapturedSelectQuery): Promise<unknown[]> => {
    if (initialOptions.selectError) {
      throw initialOptions.selectError;
    }

    if (selectsQueue.length > 0) {
      return selectsQueue.shift()!;
    }

    if (initialOptions.queryHandler) {
      return initialOptions.queryHandler(query);
    }

    const tableName = query.tableName;
    if (tableName && tableRegistry[tableName]) {
      const tableSource = tableRegistry[tableName];
      const rows = typeof tableSource === 'function' ? tableSource(query) : tableSource;
      let result = [...rows];
      if (query.offset !== undefined && query.offset > 0) {
        result = result.slice(query.offset);
      }
      if (query.limit !== undefined) {
        result = result.slice(0, query.limit);
      }
      return result;
    }

    return [...defaultRows];
  };

  const createSelectBuilder = (fields?: unknown) => {
    const query: CapturedSelectQuery = {
      type: 'select',
      fields,
      joins: [],
      orderBy: [],
      groupBy: [],
    };

    const builder: any = {
      from: (table: unknown) => {
        query.from = table;
        query.table = table;
        query.tableName = extractTableName(table);
        recordTable(table);
        return builder;
      },
      where: (condition: unknown) => {
        query.where = condition;
        recordWhere(condition);
        return builder;
      },
      leftJoin: (table: unknown, condition: unknown) => {
        query.joins.push({ type: 'left', table, condition });
        recordTable(table);
        return builder;
      },
      innerJoin: (table: unknown, condition: unknown) => {
        query.joins.push({ type: 'inner', table, condition });
        recordTable(table);
        return builder;
      },
      rightJoin: (table: unknown, condition: unknown) => {
        query.joins.push({ type: 'right', table, condition });
        recordTable(table);
        return builder;
      },
      fullJoin: (table: unknown, condition: unknown) => {
        query.joins.push({ type: 'full', table, condition });
        recordTable(table);
        return builder;
      },
      orderBy: (...expressions: unknown[]) => {
        query.orderBy.push(...expressions);
        return builder;
      },
      groupBy: (...expressions: unknown[]) => {
        query.groupBy.push(...expressions);
        return builder;
      },
      having: (condition: unknown) => {
        return builder;
      },
      limit: (count: number) => {
        query.limit = count;
        return builder;
      },
      offset: (count: number) => {
        query.offset = count;
        return builder;
      },
      // biome-ignore lint/suspicious/noThenProperty: PromiseLike implementation for Drizzle query builder
      then: (onfulfilled?: (val: unknown[]) => unknown, onrejected?: (err: unknown) => unknown) => {
        captured.queries.push(query);
        captured.selects.push(query);
        return executeSelect(query).then(onfulfilled, onrejected);
      },
      catch: (onrejected?: (err: unknown) => unknown) => {
        captured.queries.push(query);
        captured.selects.push(query);
        return executeSelect(query).catch(onrejected);
      },
      finally: (onfinally?: () => void) => {
        return executeSelect(query).finally(onfinally);
      },
      execute: () => {
        captured.queries.push(query);
        captured.selects.push(query);
        return executeSelect(query);
      },
    };

    return builder;
  };

  const createInsertBuilder = (table?: unknown) => {
    const tableName = extractTableName(table);
    recordTable(table);

    return {
      values: (recordOrRecords: unknown) => {
        const query: CapturedInsertQuery = {
          type: 'insert',
          table,
          tableName,
          values: recordOrRecords,
        };

        const resolveInsert = async (isReturning = false) => {
          if (initialOptions.insertError) {
            throw initialOptions.insertError;
          }

          captured.queries.push(query);
          captured.inserts.push(query);
          if (Array.isArray(recordOrRecords)) {
            captured.inserted.push(...recordOrRecords);
          } else {
            captured.inserted.push(recordOrRecords);
          }

          if (initialOptions.onInsert) {
            initialOptions.onInsert(recordOrRecords, table, query);
          }

          if (isReturning && returningQueue.length > 0) {
            return returningQueue.shift()!;
          }

          if (isReturning) {
            return Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
          }

          return Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
        };

        const insertBuilder: any = {
          returning: (fields?: unknown) => {
            query.returningFields = fields;
            return {
              // biome-ignore lint/suspicious/noThenProperty: PromiseLike implementation for Drizzle query builder
              then: (onfulfilled?: (val: unknown) => unknown, onrejected?: (err: unknown) => unknown) => {
                return resolveInsert(true).then(onfulfilled, onrejected);
              },
              catch: (onrejected?: (err: unknown) => unknown) => {
                return resolveInsert(true).catch(onrejected);
              },
              finally: (onfinally?: () => void) => {
                return resolveInsert(true).finally(onfinally);
              },
              execute: () => resolveInsert(true),
            };
          },
          onConflictDoNothing: () => {
            query.onConflict = { action: 'ignore' };
            return insertBuilder;
          },
          onConflictDoUpdate: (config?: { target?: unknown; set?: unknown }) => {
            query.onConflict = { action: 'update', target: config?.target, set: config?.set };
            return insertBuilder;
          },
          // biome-ignore lint/suspicious/noThenProperty: PromiseLike implementation for Drizzle query builder
          then: (onfulfilled?: (val: unknown) => unknown, onrejected?: (err: unknown) => unknown) => {
            return resolveInsert(false).then(onfulfilled, onrejected);
          },
          catch: (onrejected?: (err: unknown) => unknown) => {
            return resolveInsert(false).catch(onrejected);
          },
          finally: (onfinally?: () => void) => {
            return resolveInsert(false).finally(onfinally);
          },
          execute: () => resolveInsert(false),
        };

        return insertBuilder;
      },
    };
  };

  const createUpdateBuilder = (table?: unknown) => {
    const tableName = extractTableName(table);
    recordTable(table);

    return {
      set: (values: unknown) => {
        const query: CapturedUpdateQuery = {
          type: 'update',
          table,
          tableName,
          values,
        };

        const resolveUpdate = async (isReturning = false) => {
          if (initialOptions.updateError) {
            throw initialOptions.updateError;
          }

          captured.queries.push(query);
          captured.updates.push(query);
          captured.updated.push(values);

          if (initialOptions.onUpdate) {
            initialOptions.onUpdate(values, query.where, table, query);
          }

          if (isReturning && returningQueue.length > 0) {
            return returningQueue.shift()!;
          }

          return [values];
        };

        const updateBuilder: any = {
          where: (condition: unknown) => {
            query.where = condition;
            recordWhere(condition);
            return updateBuilder;
          },
          returning: (fields?: unknown) => {
            query.returningFields = fields;
            return {
              // biome-ignore lint/suspicious/noThenProperty: PromiseLike implementation for Drizzle query builder
              then: (onfulfilled?: (val: unknown) => unknown, onrejected?: (err: unknown) => unknown) => {
                return resolveUpdate(true).then(onfulfilled, onrejected);
              },
              catch: (onrejected?: (err: unknown) => unknown) => {
                return resolveUpdate(true).catch(onrejected);
              },
              finally: (onfinally?: () => void) => {
                return resolveUpdate(true).finally(onfinally);
              },
              execute: () => resolveUpdate(true),
            };
          },
          // biome-ignore lint/suspicious/noThenProperty: PromiseLike implementation for Drizzle query builder
          then: (onfulfilled?: (val: unknown) => unknown, onrejected?: (err: unknown) => unknown) => {
            return resolveUpdate(false).then(onfulfilled, onrejected);
          },
          catch: (onrejected?: (err: unknown) => unknown) => {
            return resolveUpdate(false).catch(onrejected);
          },
          finally: (onfinally?: () => void) => {
            return resolveUpdate(false).finally(onfinally);
          },
          execute: () => resolveUpdate(false),
        };

        return updateBuilder;
      },
    };
  };

  const createDeleteBuilder = (table?: unknown) => {
    const tableName = extractTableName(table);
    recordTable(table);

    const query: CapturedDeleteQuery = {
      type: 'delete',
      table,
      tableName,
    };

    const resolveDelete = async (isReturning = false) => {
      if (initialOptions.deleteError) {
        throw initialOptions.deleteError;
      }

      captured.queries.push(query);
      captured.deletes.push(query);
      if (query.where !== undefined) {
        captured.deleted.push(query.where);
      } else {
        captured.deleted.push(table);
      }

      if (initialOptions.onDelete) {
        initialOptions.onDelete(query.where, table, query);
      }

      if (isReturning && returningQueue.length > 0) {
        return returningQueue.shift()!;
      }

      return [];
    };

    const deleteBuilder: any = {
      where: (condition: unknown) => {
        query.where = condition;
        recordWhere(condition);
        return deleteBuilder;
      },
      returning: (fields?: unknown) => {
        query.returningFields = fields;
        return {
          // biome-ignore lint/suspicious/noThenProperty: PromiseLike implementation for Drizzle query builder
          then: (onfulfilled?: (val: unknown) => unknown, onrejected?: (err: unknown) => unknown) => {
            return resolveDelete(true).then(onfulfilled, onrejected);
          },
          catch: (onrejected?: (err: unknown) => unknown) => {
            return resolveDelete(true).catch(onrejected);
          },
          finally: (onfinally?: () => void) => {
            return resolveDelete(true).finally(onfinally);
          },
          execute: () => resolveDelete(true),
        };
      },
      // biome-ignore lint/suspicious/noThenProperty: PromiseLike implementation for Drizzle query builder
      then: (onfulfilled?: (val: unknown) => unknown, onrejected?: (err: unknown) => unknown) => {
        return resolveDelete(false).then(onfulfilled, onrejected);
      },
      catch: (onrejected?: (err: unknown) => unknown) => {
        return resolveDelete(false).catch(onrejected);
      },
      finally: (onfinally?: () => void) => {
        return resolveDelete(false).finally(onfinally);
      },
      execute: () => resolveDelete(false),
    };

    return deleteBuilder;
  };

  const relationalQueryProxy = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return {
          findFirst: async (_config?: unknown) => {
            const tableSource = tableRegistry[prop];
            const rows =
              typeof tableSource === 'function' ?
                tableSource({ type: 'select', joins: [], orderBy: [], groupBy: [] })
              : tableSource;
            return rows && rows.length > 0 ? rows[0] : (defaultRows[0] ?? null);
          },
          findMany: async (_config?: unknown) => {
            const tableSource = tableRegistry[prop];
            const rows =
              typeof tableSource === 'function' ?
                tableSource({ type: 'select', joins: [], orderBy: [], groupBy: [] })
              : tableSource;
            return rows ? [...rows] : [...defaultRows];
          },
        };
      },
    },
  );

  const mockDbObject: any = {
    select: (fields?: unknown) => createSelectBuilder(fields),
    insert: (table?: unknown) => createInsertBuilder(table),
    update: (table?: unknown) => createUpdateBuilder(table),
    delete: (table?: unknown) => createDeleteBuilder(table),
    transaction: async (callback: (tx: Database) => unknown) => {
      return callback(mockDbObject as unknown as Database);
    },
    execute: async (_sql: unknown) => {
      return [...defaultRows];
    },
    query: relationalQueryProxy,
  };

  const reset = () => {
    captured.queries.length = 0;
    captured.selects.length = 0;
    captured.inserts.length = 0;
    captured.updates.length = 0;
    captured.deletes.length = 0;
    captured.inserted.length = 0;
    captured.updated.length = 0;
    captured.deleted.length = 0;
    captured.where.length = 0;
    captured.tables.length = 0;
    selectsQueue.length = 0;
    returningQueue.length = 0;
  };

  const setRows = (rows: unknown[]) => {
    defaultRows = [...rows];
  };

  const setSelects = (selects: unknown[][]) => {
    selectsQueue.length = 0;
    selectsQueue.push(...selects);
  };

  const setReturning = (returning: unknown[][]) => {
    returningQueue.length = 0;
    returningQueue.push(...returning);
  };

  const setTable = (tableName: string, rows: unknown[] | ((query: CapturedSelectQuery) => unknown[])) => {
    tableRegistry[tableName] = rows;
  };

  return {
    db: mockDbObject as unknown as Database,
    captured,
    reset,
    setRows,
    setSelects,
    setReturning,
    setTable,
  };
}
