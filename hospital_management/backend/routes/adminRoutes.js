const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply auth middleware to all admin routes
router.use(auth(['admin']));

// Patient Management
router.get('/patients', adminController.getAllPatients);
router.get('/patients/:id', adminController.getPatientById);
router.get('/patients/search', adminController.searchPatients);
router.put('/patients/:id', adminController.updatePatient);
router.delete('/patients/:id', adminController.deletePatient);
router.get('/patients/:patientId/medical-history', adminController.getPatientMedicalHistory);

// Doctor Management
router.get('/doctors', adminController.getAllDoctors);
router.get('/doctors/:id', adminController.getDoctorById);
router.post('/doctors', adminController.createDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.put('/doctors/:id/status', adminController.updateDoctorStatus);
router.delete('/doctors/:id', adminController.deleteDoctor);

// Appointment Management
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments/:id', adminController.getAppointmentById);
router.post('/appointments', adminController.createAppointment);
router.put('/appointments/:id', adminController.updateAppointment);
router.put('/appointments/:id/cancel', adminController.cancelAppointment);
router.delete('/appointments/:id', adminController.deleteAppointment);

// Pharmacy Management
router.get('/medicines', adminController.getAllMedicines);
router.get('/medicines/:id', adminController.getMedicineById);
router.post('/medicines', adminController.createMedicine);
router.put('/medicines/:id', adminController.updateMedicine);
router.delete('/medicines/:id', adminController.deleteMedicine);
router.get('/medicines/expiring', adminController.getExpiringMedicines);

// Ward/Bed Management
router.get('/beds', adminController.getAllBeds);
router.get('/beds/:id', adminController.getBedById);
router.post('/beds', adminController.createBed);
router.post('/beds/assign', adminController.assignPatientToBed);
router.put('/beds/:bedId/discharge', adminController.dischargePatientFromBed);
router.put('/beds/:bedId/status', adminController.updateBedStatus);
router.delete('/beds/:bedId', adminController.deleteBed);
router.get('/beds/available', adminController.getAvailableBeds);

// System & Messaging
router.get('/messages', adminController.getAllMessages);
router.get('/messages/:id', adminController.getMessageById);
router.post('/messages', adminController.sendMessage);
router.post('/messages/:messageId/reply', adminController.replyToMessage);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/audit-logs/:userId', adminController.getUserAuditLogs);

module.exports = router;