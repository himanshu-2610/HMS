const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const patientController = require('../controllers/patientController');

// Apply auth middleware to all patient routes
router.use(auth(['patient']));

// Profile
router.get('/profile', patientController.getMyProfile);
router.put('/profile', patientController.updateMyProfile);

// Doctors
router.get('/doctors', patientController.getDoctorsList);
router.get('/doctors/:id', patientController.getDoctorDetails);

// Appointments
router.get('/appointments', patientController.getMyAppointments);
router.post('/appointments', patientController.bookAppointment);
router.put('/appointments/:id/reschedule', patientController.rescheduleAppointment);
router.put('/appointments/:id/cancel', patientController.cancelAppointment);

// Ward/Bed
router.get('/bed-status', patientController.getMyBedStatus);

// Messaging
router.post('/messages/admin', patientController.sendMessageToAdmin);
router.get('/messages', patientController.getMyMessages);

module.exports = router;