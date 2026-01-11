export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  created_at: string;
  last_login?: string;
}

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
  )
`;

export const CREATE_USERNAME_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_username ON users(username)
`;
