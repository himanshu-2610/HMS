const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

// Apply auth middleware to all doctor routes
router.use(auth(['doctor']));

// Profile
router.get('/profile', doctorController.getMyProfile);
router.put('/profile', doctorController.updateMyProfile);

// Patients
router.get('/patients', doctorController.getMyPatients);
router.get('/patients/:patientId/medical-history', doctorController.getPatientMedicalHistory);

// Appointments
router.get('/appointments', doctorController.getMyAppointments);
router.put('/appointments/:id/notes', doctorController.updateAppointmentNotes);

// Messaging
router.post('/messages/admin', doctorController.sendMessageToAdmin);
router.get('/messages', doctorController.getMyMessages);

module.exports = router;