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
    this.runMigrations();

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

  private runMigrations(): void {
    // Проверяем существует ли колонка organization
    const tableInfo = this.db.pragma('table_info(users)') as Array<{ name: string }>;
    const hasOrganization = tableInfo.some((col) => col.name === 'organization');

    if (!hasOrganization) {
      console.log('🔄 Добавляем колонку organization...');
      this.db.exec('ALTER TABLE users ADD COLUMN organization TEXT');
      console.log('✅ Колонка organization добавлена');
    }
  }


  public async registerUser(
    username: string,
    password: string,
    name: string,
    organization?: string
  ): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (existingUser) {
        return { success: false, message: 'Пользователь с таким логином уже существует' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insert = this.db.prepare(
        'INSERT INTO users (username, password, name, organization) VALUES (?, ?, ?, ?)'
      );
      const result = insert.run(username, hashedPassword, name, organization || null);

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
        'SELECT id, username, password, name, organization, created_at FROM users WHERE username = ?'
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
      'SELECT id, username, name, organization, created_at, last_login FROM users WHERE id = ?'
    ).get(id) as User | undefined;

    return user;
  }

  public async updateUser(
    id: number,
    name: string,
    username: string,
    organization?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const existingUser = this.db.prepare('SELECT id FROM users WHERE id = ?').get(id);
      if (!existingUser) {
        return { success: false, message: 'Пользователь не найден' };
      }

      const userWithSameUsername = this.db.prepare(
        'SELECT id FROM users WHERE username = ? AND id != ?'
      ).get(username, id);
      
      if (userWithSameUsername) {
        return { success: false, message: 'Этот email уже используется другим пользователем' };
      }

      this.db.prepare(
        'UPDATE users SET name = ?, username = ?, organization = ? WHERE id = ?'
      ).run(name, username, organization || null, id);

      return { success: true, message: 'Профиль успешно обновлен' };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, message: 'Ошибка при обновлении профиля' };
    }
  }

  public async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = this.db.prepare(
        'SELECT id, password FROM users WHERE id = ?'
      ).get(userId) as { id: number; password: string } | undefined;

      if (!user) {
        return { success: false, message: 'Пользователь не найден' };
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Неверный текущий пароль' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: 'Новый пароль должен содержать минимум 6 символов' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      this.db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

      return { success: true, message: 'Пароль успешно изменен' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Ошибка при смене пароля' };
    }
  }

  public close(): void {
    this.db.close();
  }
}
