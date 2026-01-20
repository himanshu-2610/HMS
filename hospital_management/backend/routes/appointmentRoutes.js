const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// Public routes (if any) would go here

// Protected routes
router.use(auth(['admin', 'doctor', 'patient']));

// Routes accessible by all authenticated users
router.get('/:id', appointmentController.getAppointmentById);

// Admin-only routes
router.get('/', auth(['admin']), appointmentController.getAllAppointments);
router.post('/', auth(['admin']), appointmentController.createAppointment);
router.put('/:id', auth(['admin']), appointmentController.updateAppointment);
router.put('/:id/cancel', auth(['admin']), appointmentController.cancelAppointment);
router.delete('/:id', auth(['admin']), appointmentController.deleteAppointment);

// Doctor-specific routes
router.get('/doctor/:doctorId', auth(['doctor', 'admin']), appointmentController.getAppointmentsByDoctor);

// Patient-specific routes
router.get('/patient/:patientId', auth(['patient', 'admin']), appointmentController.getAppointmentsByPatient);

module.exports = router;