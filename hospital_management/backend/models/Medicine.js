const pool = require('../config/db');

class Medicine {
  static async create({ name, description, quantity, price, expiryDate, supplier }) {
    const [result] = await pool.query(
      'INSERT INTO medicines (name, description, quantity, price, expiry_date, supplier) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, quantity, price, expiryDate, supplier]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM medicines');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM medicines WHERE id = ?', [id]);
    return rows[0];
  }

  static async findExpiringSoon(days = 30) {
    const [rows] = await pool.query(
      'SELECT * FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)',
      [days]
    );
    return rows;
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
      `UPDATE medicines SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM medicines WHERE id = ?', [id]);
  }
}

module.exports = Medicine;