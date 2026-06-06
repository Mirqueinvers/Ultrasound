declare module "sql.js" {
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  interface QueryExecResult {
    columns: string[];
    values: any[][];
  }

  interface Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    getAsObject(params?: object): Record<string, any>;
    free(): boolean;
    reset(): void;
  }

  interface Database {
    run(sql: string, params?: any[]): { changes: number };
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export { Database, Statement, SqlJsStatic, QueryExecResult };

  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
}
