"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_USERNAME_INDEX = exports.CREATE_USERS_TABLE = void 0;
exports.CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
  )
`;
exports.CREATE_USERNAME_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_username ON users(username)
`;
