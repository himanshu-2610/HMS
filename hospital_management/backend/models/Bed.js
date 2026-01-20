const pool = require('../config/db');

class Bed {
  static async create({ wardNumber, bedNumber }) {
    const [result] = await pool.query(
      'INSERT INTO beds (ward_number, bed_number) VALUES (?, ?)',
      [wardNumber, bedNumber]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(
      `SELECT b.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name
       FROM beds b
       LEFT JOIN patients p ON b.patient_id = p.id`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM beds WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByStatus(status) {
    const [rows] = await pool.query('SELECT * FROM beds WHERE status = ?', [status]);
    return rows;
  }

  static async assignPatient(bedId, patientId) {
    await pool.query(
      'UPDATE beds SET status = "occupied", patient_id = ?, admission_date = NOW() WHERE id = ?',
      [patientId, bedId]
    );
  }

  static async dischargePatient(bedId) {
    await pool.query(
      'UPDATE beds SET status = "available", patient_id = NULL, discharge_date = NOW() WHERE id = ?',
      [bedId]
    );
  }

  static async updateStatus(bedId, status) {
    await pool.query('UPDATE beds SET status = ? WHERE id = ?', [status, bedId]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM beds WHERE id = ?', [id]);
  }
}

module.exports = Bed;