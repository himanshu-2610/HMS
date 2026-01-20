const pool = require('../config/db');

class Appointment {
  static async create({ patientId, doctorId, appointmentDate, reason }) {
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES (?, ?, ?, ?)',
      [patientId, doctorId, appointmentDate, reason]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(
      `SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
       d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
       d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByPatientId(patientId) {
    const [rows] = await pool.query(
      `SELECT a.*, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC`,
      [patientId]
    );
    return rows;
  }

  static async findByDoctorId(doctorId) {
    const [rows] = await pool.query(
      `SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC`,
      [doctorId]
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
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
  }
}

module.exports = Appointment;