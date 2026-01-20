const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const wardController = require('../controllers/wardController');

// Public routes (if any) would go here

// Protected routes
router.use(auth(['admin', 'doctor', 'patient']));

// Admin-only routes
router.get('/', auth(['admin']), wardController.getAllBeds);
router.get('/:id', auth(['admin']), wardController.getBedById);
router.post('/', auth(['admin']), wardController.createBed);
router.post('/assign', auth(['admin']), wardController.assignPatientToBed);
router.put('/:bedId/discharge', auth(['admin']), wardController.dischargePatientFromBed);
router.put('/:bedId/status', auth(['admin']), wardController.updateBedStatus);
router.delete('/:bedId', auth(['admin']), wardController.deleteBed);
router.get('/available', auth(['admin']), wardController.getAvailableBeds);
router.get('/ward/:wardNumber', auth(['admin']), wardController.getBedsByWard);

// Doctor access
router.get('/', auth(['doctor']), wardController.getAllBeds);
router.get('/available', auth(['doctor']), wardController.getAvailableBeds);

// Patient access
router.get('/patient/:patientId', auth(['patient']), wardController.getPatientBedAssignment);

module.exports = router;