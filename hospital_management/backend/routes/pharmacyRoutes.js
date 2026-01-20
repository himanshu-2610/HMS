const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pharmacyController = require('../controllers/pharmacyController');

// Public routes (if any) would go here

// Protected routes
router.use(auth(['admin', 'doctor']));

// Admin-only routes
router.get('/', auth(['admin']), pharmacyController.getAllMedicines);
router.get('/:id', auth(['admin']), pharmacyController.getMedicineById);
router.post('/', auth(['admin']), pharmacyController.createMedicine);
router.put('/:id', auth(['admin']), pharmacyController.updateMedicine);
router.delete('/:id', auth(['admin']), pharmacyController.deleteMedicine);
router.get('/expiring', auth(['admin']), pharmacyController.getExpiringMedicines);
router.get('/search', auth(['admin']), pharmacyController.searchMedicines);
router.put('/:id/stock', auth(['admin']), pharmacyController.updateStock);

// Doctor access (read-only)
router.get('/', auth(['doctor']), pharmacyController.getAllMedicines);
router.get('/:id', auth(['doctor']), pharmacyController.getMedicineById);

module.exports = router;