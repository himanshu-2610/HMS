const Medicine = require('../models/Medicine');

const pharmacyController = {
  // Get all medicines
  getAllMedicines: async (req, res) => {
    try {
      const medicines = await Medicine.findAll();
      res.json(medicines);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get medicine by ID
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

  // Add new medicine
  createMedicine: async (req, res) => {
    try {
      const { name, description, quantity, price, expiryDate, supplier } = req.body;
      
      // Check if medicine already exists
      const [existing] = await pool.query(
        'SELECT id FROM medicines WHERE name = ? AND supplier = ?',
        [name, supplier]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Medicine from this supplier already exists' });
      }

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

  // Update medicine
  updateMedicine: async (req, res) => {
    try {
      await Medicine.update(req.params.id, req.body);
      res.json({ message: 'Medicine updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete medicine
  deleteMedicine: async (req, res) => {
    try {
      await Medicine.delete(req.params.id);
      res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get expiring medicines
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

  // Search medicines by name
  searchMedicines: async (req, res) => {
    try {
      const { searchTerm } = req.query;
      const [medicines] = await pool.query(
        'SELECT * FROM medicines WHERE name LIKE ?',
        [`%${searchTerm}%`]
      );
      res.json(medicines);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update medicine stock
  updateStock: async (req, res) => {
    try {
      const { quantity } = req.body;
      const [current] = await pool.query(
        'SELECT quantity FROM medicines WHERE id = ?',
        [req.params.id]
      );
      
      if (!current.length) {
        return res.status(404).json({ message: 'Medicine not found' });
      }
      
      const newQuantity = current[0].quantity + quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      
      await pool.query(
        'UPDATE medicines SET quantity = ? WHERE id = ?',
        [newQuantity, req.params.id]
      );
      
      res.json({ message: 'Stock updated successfully', newQuantity });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = pharmacyController;