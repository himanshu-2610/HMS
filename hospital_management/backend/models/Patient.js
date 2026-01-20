const pool = require('../config/db');

class Patient {
  static async create({ userId, firstName, lastName, dob, gender, address, phone, emergencyContact, bloodType, allergies }) {
    const [result] = await pool.query(
      'INSERT INTO patients (user_id, first_name, last_name, dob, gender, address, phone, emergency_contact, blood_type, allergies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, firstName, lastName, dob, gender, address, phone, emergencyContact, bloodType, allergies]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM patients');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM patients WHERE user_id = ?', [userId]);
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
      `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM patients WHERE id = ?', [id]);
  }

  static async search(searchTerm) {
    const [rows] = await pool.query(
      `SELECT * FROM patients 
       WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR emergency_contact LIKE ? OR blood_type LIKE ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  static async getMedicalHistory(patientId) {
    const [rows] = await pool.query(
      `SELECT mr.*, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name 
       FROM medical_records mr
       JOIN doctors d ON mr.doctor_id = d.id
       WHERE mr.patient_id = ?
       ORDER BY mr.record_date DESC`,
      [patientId]
    );
    return rows;
  }
}



module.exports = Patient;