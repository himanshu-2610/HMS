const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');

const patientController = {
  getMyProfile: async (req, res) => {
    try {
      const patient = await Patient.findByUserId(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      res.json(patient);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateMyProfile: async (req, res) => {
    try {
      const patient = await Patient.findByUserId(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      
      await Patient.update(patient.id, req.body);
      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getDoctorsList: async (req, res) => {
    try {
      const [doctors] = await pool.query(
        `SELECT id, first_name, last_name, specialization 
         FROM doctors 
         WHERE is_active = TRUE`
      );
      res.json(doctors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getDoctorDetails: async (req, res) => {
    try {
      const [doctor] = await pool.query(
        `SELECT id, first_name, last_name, specialization 
         FROM doctors 
         WHERE id = ? AND is_active = TRUE`,
        [req.params.id]
      );
      
      if (!doctor.length) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      res.json(doctor[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyAppointments: async (req, res) => {
    try {
      const patient = await Patient.findByUserId(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      
      const appointments = await Appointment.findByPatientId(patient.id);
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  bookAppointment: async (req, res) => {
    try {
      const { doctorId, appointmentDate, reason } = req.body;
      const patient = await Patient.findByUserId(req.user.id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      
      const appointmentId = await Appointment.create({
        patientId: patient.id,
        doctorId,
        appointmentDate,
        reason
      });
      
      res.status(201).json({ message: 'Appointment booked', appointmentId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  rescheduleAppointment: async (req, res) => {
    try {
      const { newAppointmentDate } = req.body;
      const patient = await Patient.findByUserId(req.user.id);
      
      // Verify this patient owns the appointment
      const [appointment] = await pool.query(
        'SELECT 1 FROM appointments WHERE id = ? AND patient_id = ? LIMIT 1',
        [req.params.id, patient.id]
      );
      
      if (!appointment.length) {
        return res.status(403).json({ message: 'Not authorized to reschedule this appointment' });
      }
      
      await Appointment.update(req.params.id, { 
        appointmentDate: newAppointmentDate,
        status: 'rescheduled'
      });
      
      res.json({ message: 'Appointment rescheduled successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  cancelAppointment: async (req, res) => {
    try {
      const patient = await Patient.findByUserId(req.user.id);
      
      // Verify this patient owns the appointment
      const [appointment] = await pool.query(
        'SELECT 1 FROM appointments WHERE id = ? AND patient_id = ? LIMIT 1',
        [req.params.id, patient.id]
      );
      
      if (!appointment.length) {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
      }
      
      await Appointment.update(req.params.id, { status: 'cancelled' });
      res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyBedStatus: async (req, res) => {
    try {
      const patient = await Patient.findByUserId(req.user.id);
      const [bed] = await pool.query(
        `SELECT b.* 
         FROM beds b
         WHERE b.patient_id = ? AND b.status = 'occupied'`,
        [patient.id]
      );
      
      res.json(bed[0] || null);
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

module.exports = patientController;