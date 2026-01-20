const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

const doctorController = {
  getMyProfile: async (req, res) => {
    try {
      const doctor = await Doctor.findByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      res.json(doctor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateMyProfile: async (req, res) => {
    try {
      const doctor = await Doctor.findByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      
      await Doctor.update(doctor.id, req.body);
      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyPatients: async (req, res) => {
    try {
      // Get patients who have appointments with this doctor
      const [patients] = await pool.query(
        `SELECT DISTINCT p.* 
         FROM patients p
         JOIN appointments a ON p.id = a.patient_id
         WHERE a.doctor_id = (SELECT id FROM doctors WHERE user_id = ?)`,
        [req.user.id]
      );
      
      res.json(patients);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getPatientMedicalHistory: async (req, res) => {
    try {
      // Verify this doctor has treated this patient
      const [appointments] = await pool.query(
        `SELECT 1 FROM appointments 
         WHERE doctor_id = (SELECT id FROM doctors WHERE user_id = ?) 
         AND patient_id = ? LIMIT 1`,
        [req.user.id, req.params.patientId]
      );
      
      if (!appointments.length) {
        return res.status(403).json({ message: 'Not authorized to view this patient' });
      }
      
      const history = await Patient.getMedicalHistory(req.params.patientId);
      res.json(history);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyAppointments: async (req, res) => {
    try {
      const doctor = await Doctor.findByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      
      const appointments = await Appointment.findByDoctorId(doctor.id);
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateAppointmentNotes: async (req, res) => {
    try {
      const { notes } = req.body;
      const doctor = await Doctor.findByUserId(req.user.id);
      
      // Verify this doctor owns the appointment
      const [appointment] = await pool.query(
        'SELECT 1 FROM appointments WHERE id = ? AND doctor_id = ? LIMIT 1',
        [req.params.id, doctor.id]
      );
      
      if (!appointment.length) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
      
      await Appointment.update(req.params.id, { notes });
      res.json({ message: 'Appointment notes updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  sendMessageToAdmin: async (req, res) => {
    try {
      const { subject, message } = req.body;
      
      // Find an admin user
      const [admin] = await pool.query(
        'SELECT id FROM users WHERE role = "admin" LIMIT 1'
      );
      
      if (!admin.length) {
        return res.status(404).json({ message: 'No admin found' });
      }
      
      await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, subject, message) VALUES (?, ?, ?, ?)',
        [req.user.id, admin[0].id, subject, message]
      );
      
      res.status(201).json({ message: 'Message sent to admin successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyMessages: async (req, res) => {
    try {
      const [messages] = await pool.query(
        `SELECT m.*, u.username AS sender_username 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.receiver_id = ?
         ORDER BY m.created_at DESC`,
        [req.user.id]
      );
      
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = doctorController;