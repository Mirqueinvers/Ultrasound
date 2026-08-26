// Типы для better-sqlite3 v11 (пакет не поставляет собственные типы,
// @types/better-sqlite3 не подключен). Описываем только используемое.
declare module "better-sqlite3" {
  interface Statement {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
  }
  interface Database {
    prepare(sql: string): Statement;
    close(): void;
  }
  interface DatabaseConstructor {
    new (
      path: string,
      options?: { readonly?: boolean; fileMustExist?: boolean }
    ): Database;
  }
  const DatabaseConstructor: DatabaseConstructor;
  export = DatabaseConstructor;
}
