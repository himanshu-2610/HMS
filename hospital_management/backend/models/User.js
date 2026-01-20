const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, password, role, email }) {
    try {
      // Validate input
      if (!username || !password || !role || !email) {
        throw new Error('Missing required fields');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await pool.query(
        'INSERT INTO users (username, password, role, email, is_active) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, role, email, true]
      );
      return result.insertId;
    } catch (err) {
      console.error('User creation error:', err);
      throw err;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (err) {
      console.error('Find user by username error:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (err) {
      console.error('Find user by ID error:', err);
      throw err;
    }
  }

  static async updateStatus(id, isActive) {
    try {
      await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
    } catch (err) {
      console.error('Update user status error:', err);
      throw err;
    }
  }

  static async updatePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    } catch (err) {
      console.error('Update password error:', err);
      throw err;
    }
  }

  static async updateProfile(id, { username, email }) {
    try {
      await pool.query(
        'UPDATE users SET username = ?, email = ? WHERE id = ?',
        [username, email, id]
      );
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
    } catch (err) {
      console.error('Delete user error:', err);
      throw err;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;