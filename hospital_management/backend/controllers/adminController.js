const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const Bed = require('../models/Bed');

const adminController = {
  // Patient Management
  getAllPatients: async (req, res) => {
    try {
      const patients = await Patient.findAll();
      res.json(patients);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getPatientById: async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      res.json(patient);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  searchPatients: async (req, res) => {
    try {
      const { searchTerm } = req.query;
      const patients = await Patient.search(searchTerm);
      res.json(patients);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updatePatient: async (req, res) => {
    try {
      await Patient.update(req.params.id, req.body);
      res.json({ message: 'Patient updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deletePatient: async (req, res) => {
    try {
      // First find patient to get user_id
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      // Delete patient record
      await Patient.delete(req.params.id);
      
      // Delete associated user account
      await User.delete(patient.user_id);
      
      res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getPatientMedicalHistory: async (req, res) => {
    try {
      const history = await Patient.getMedicalHistory(req.params.patientId);
      res.json(history);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Doctor Management
  getAllDoctors: async (req, res) => {
    try {
      const doctors = await Doctor.findAll();
      res.json(doctors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getDoctorById: async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      res.json(doctor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createDoctor: async (req, res) => {
    try {
      const { username, password, firstName, lastName, specialization, licenseNumber, phone, email } = req.body;
      
      // Check if username exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const userId = await User.create({
        username,
        password: hashedPassword,
        role: 'doctor'
      });

      // Create doctor profile
      await Doctor.create({
        userId,
        firstName,
        lastName,
        specialization,
        licenseNumber,
        phone,
        email
      });

      res.status(201).json({ message: 'Doctor created successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateDoctor: async (req, res) => {
    try {
      await Doctor.update(req.params.id, req.body);
      res.json({ message: 'Doctor updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateDoctorStatus: async (req, res) => {
    try {
      const { isActive } = req.body;
      const doctor = await Doctor.findById(req.params.id);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      await Doctor.updateStatus(req.params.id, isActive);
      await User.updateStatus(doctor.user_id, isActive);
      
      res.json({ message: 'Doctor status updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteDoctor: async (req, res) => {
    try {
      // First find doctor to get user_id
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      // Delete doctor record
      await Doctor.delete(req.params.id);
      
      // Delete associated user account
      await User.delete(doctor.user_id);
      
      res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Appointment Management
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.findAll();
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

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

  createAppointment: async (req, res) => {
    try {
      const { patientId, doctorId, appointmentDate, reason } = req.body;
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

  updateAppointment: async (req, res) => {
    try {
      await Appointment.update(req.params.id, req.body);
      res.json({ message: 'Appointment updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  cancelAppointment: async (req, res) => {
    try {
      await Appointment.update(req.params.id, { status: 'cancelled' });
      res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteAppointment: async (req, res) => {
    try {
      await Appointment.delete(req.params.id);
      res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Pharmacy Management
  getAllMedicines: async (req, res) => {
    try {
      const medicines = await Medicine.findAll();
      res.json(medicines);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMedicineById: async (req, res) => {
    try {
      const medicine = await Medicine.findById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }
      res.json(medicine);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createMedicine: async (req, res) => {
    try {
      const { name, description, quantity, price, expiryDate, supplier } = req.body;
      const medicineId = await Medicine.create({
        name,
        description,
        quantity,
        price,
        expiryDate,
        supplier
      });
      res.status(201).json({ message: 'Medicine added', medicineId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateMedicine: async (req, res) => {
    try {
      await Medicine.update(req.params.id, req.body);
      res.json({ message: 'Medicine updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteMedicine: async (req, res) => {
    try {
      await Medicine.delete(req.params.id);
      res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getExpiringMedicines: async (req, res) => {
    try {
      const days = req.query.days || 30;
      const medicines = await Medicine.findExpiringSoon(days);
      res.json(medicines);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Ward/Bed Management
  getAllBeds: async (req, res) => {
    try {
      const beds = await Bed.findAll();
      res.json(beds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getBedById: async (req, res) => {
    try {
      const bed = await Bed.findById(req.params.id);
      if (!bed) {
        return res.status(404).json({ message: 'Bed not found' });
      }
      res.json(bed);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createBed: async (req, res) => {
    try {
      const { wardNumber, bedNumber } = req.body;
      const bedId = await Bed.create({
        wardNumber,
        bedNumber
      });
      res.status(201).json({ message: 'Bed added', bedId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  assignPatientToBed: async (req, res) => {
    try {
      const { bedId, patientId } = req.body;
      await Bed.assignPatient(bedId, patientId);
      res.json({ message: 'Patient assigned to bed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  dischargePatientFromBed: async (req, res) => {
    try {
      await Bed.dischargePatient(req.params.bedId);
      res.json({ message: 'Patient discharged successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateBedStatus: async (req, res) => {
    try {
      const { status } = req.body;
      await Bed.updateStatus(req.params.bedId, status);
      res.json({ message: 'Bed status updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteBed: async (req, res) => {
    try {
      await Bed.delete(req.params.bedId);
      res.json({ message: 'Bed deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAvailableBeds: async (req, res) => {
    try {
      const beds = await Bed.findByStatus('available');
      res.json(beds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // System & Messaging
  getAllMessages: async (req, res) => {
    try {
      const [messages] = await pool.query(
        `SELECT m.*, 
         sender.username AS sender_username, sender.role AS sender_role,
         receiver.username AS receiver_username, receiver.role AS receiver_role
         FROM messages m
         JOIN users sender ON m.sender_id = sender.id
         JOIN users receiver ON m.receiver_id = receiver.id
         ORDER BY m.created_at DESC`
      );
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMessageById: async (req, res) => {
    try {
      const [message] = await pool.query(
        `SELECT m.*, 
         sender.username AS sender_username, sender.role AS sender_role,
         receiver.username AS receiver_username, receiver.role AS receiver_role
         FROM messages m
         JOIN users sender ON m.sender_id = sender.id
         JOIN users receiver ON m.receiver_id = receiver.id
         WHERE m.id = ?`,
        [req.params.id]
      );
      
      if (!message.length) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Mark as read if not already
      if (!message[0].is_read) {
        await pool.query('UPDATE messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
      }
      
      res.json(message[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { receiverId, subject, message } = req.body;
      
      await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, subject, message) VALUES (?, ?, ?, ?)',
        [req.user.id, receiverId, subject, message]
      );
      
      res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  replyToMessage: async (req, res) => {
    try {
      const { messageId, reply } = req.body;
      
      // Get original message to know who to reply to
      const [originalMessage] = await pool.query(
        'SELECT sender_id FROM messages WHERE id = ?',
        [messageId]
      );
      
      if (!originalMessage.length) {
        return res.status(404).json({ message: 'Original message not found' });
      }
      
      const senderId = originalMessage[0].sender_id;
      
      await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, subject, message) VALUES (?, ?, ?, ?)',
        [req.user.id, senderId, 'RE: ' + req.body.subject || 'Reply', reply]
      );
      
      res.status(201).json({ message: 'Reply sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAuditLogs: async (req, res) => {
    try {
      const [logs] = await pool.query(
        `SELECT a.*, u.username 
         FROM audit_log a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT 100`
      );
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getUserAuditLogs: async (req, res) => {
    try {
      const [logs] = await pool.query(
        `SELECT a.*, u.username 
         FROM audit_log a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.user_id = ?
         ORDER BY a.created_at DESC`,
        [req.params.userId]
      );
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = adminController;