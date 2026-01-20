const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const appointmentController = {
  // Get all appointments (for admin)
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.findAll();
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get appointment by ID
  getAppointmentById: async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create new appointment
  createAppointment: async (req, res) => {
    try {
      const { patientId, doctorId, appointmentDate, reason } = req.body;
      
      // Check if doctor is available
      const [conflictingAppointments] = await pool.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? 
         AND appointment_date = ? 
         AND status = 'scheduled'`,
        [doctorId, appointmentDate]
      );
      
      if (conflictingAppointments.length > 0) {
        return res.status(400).json({ message: 'Doctor already has an appointment at this time' });
      }

      const appointmentId = await Appointment.create({
        patientId,
        doctorId,
        appointmentDate,
        reason
      });
      
      res.status(201).json({ message: 'Appointment created', appointmentId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update appointment
  updateAppointment: async (req, res) => {
    try {
      await Appointment.update(req.params.id, req.body);
      res.json({ message: 'Appointment updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Cancel appointment
  cancelAppointment: async (req, res) => {
    try {
      await Appointment.update(req.params.id, { status: 'cancelled' });
      res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete appointment
  deleteAppointment: async (req, res) => {
    try {
      await Appointment.delete(req.params.id);
      res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get appointments by patient ID
  getAppointmentsByPatient: async (req, res) => {
    try {
      const appointments = await Appointment.findByPatientId(req.params.patientId);
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get appointments by doctor ID
  getAppointmentsByDoctor: async (req, res) => {
    try {
      const appointments = await Appointment.findByDoctorId(req.params.doctorId);
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = appointmentController;