const pool = require('../config/db');

class Doctor {
  static async create({ userId, firstName, lastName, specialization, licenseNumber, phone, email }) {
    const [result] = await pool.query(
      'INSERT INTO doctors (user_id, first_name, last_name, specialization, license_number, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, firstName, lastName, specialization, licenseNumber, phone, email]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM doctors');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM doctors WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM doctors WHERE user_id = ?', [userId]);
    return rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    values.push(id);
    
    await pool.query(
      `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  static async updateStatus(id, isActive) {
    await pool.query('UPDATE doctors SET is_active = ? WHERE id = ?', [isActive, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM doctors WHERE id = ?', [id]);
  }
}

module.exports = Doctor;