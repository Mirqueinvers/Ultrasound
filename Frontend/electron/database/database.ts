import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { CREATE_USERS_TABLE, CREATE_USERNAME_INDEX, User } from './schema';

export class DatabaseManager {
  private db: Database.Database;
  private static instance: DatabaseManager;

  private constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'ultrasound.db');

    console.log('📁 Путь к БД:', dbPath);

    this.db = new Database(dbPath);
    this.initializeDatabase();

    console.log('✅ База данных инициализирована');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializeDatabase(): void {
    this.db.exec(CREATE_USERS_TABLE);
    this.db.exec(CREATE_USERNAME_INDEX);
  }

  public async registerUser(
    username: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (existingUser) {
        return { success: false, message: 'Пользователь с таким логином уже существует' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insert = this.db.prepare(
        'INSERT INTO users (username, password, name) VALUES (?, ?, ?)'
      );
      const result = insert.run(username, hashedPassword, name);

      return {
        success: true,
        message: 'Регистрация успешна',
        userId: result.lastInsertRowid as number
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Ошибка при регистрации' };
    }
  }

  public async loginUser(
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: Partial<User> }> {
    try {
      const user = this.db.prepare(
        'SELECT id, username, password, name, created_at FROM users WHERE username = ?'
      ).get(username) as User | undefined;

      if (!user) {
        return { success: false, message: 'Неверный логин или пароль' };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Неверный логин или пароль' };
      }

      this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Вход выполнен успешно',
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Ошибка при входе' };
    }
  }

  public getUserById(id: number): Partial<User> | undefined {
    const user = this.db.prepare(
      'SELECT id, username, name, created_at, last_login FROM users WHERE id = ?'
    ).get(id) as User | undefined;

    return user;
  }

  public close(): void {
    this.db.close();
  }
}
