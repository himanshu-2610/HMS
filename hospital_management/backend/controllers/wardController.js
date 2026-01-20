const Bed = require('../models/Bed');
const Patient = require('../models/Patient');

const wardController = {
  // Get all beds
  getAllBeds: async (req, res) => {
    try {
      const beds = await Bed.findAll();
      res.json(beds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get bed by ID
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

  // Add new bed
  createBed: async (req, res) => {
    try {
      const { wardNumber, bedNumber } = req.body;
      
      // Check if bed already exists
      const [existing] = await pool.query(
        'SELECT id FROM beds WHERE ward_number = ? AND bed_number = ?',
        [wardNumber, bedNumber]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Bed already exists in this ward' });
      }

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

  // Assign patient to bed
  assignPatientToBed: async (req, res) => {
    try {
      const { bedId, patientId } = req.body;
      
      // Check if patient exists
      const [patient] = await pool.query(
        'SELECT id FROM patients WHERE id = ?',
        [patientId]
      );
      
      if (!patient.length) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Check if patient is already assigned to another bed
      const [existingAssignment] = await pool.query(
        'SELECT id FROM beds WHERE patient_id = ? AND status = "occupied"',
        [patientId]
      );
      
      if (existingAssignment.length > 0) {
        return res.status(400).json({ message: 'Patient is already assigned to another bed' });
      }
      
      await Bed.assignPatient(bedId, patientId);
      res.json({ message: 'Patient assigned to bed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Discharge patient from bed
  dischargePatientFromBed: async (req, res) => {
    try {
      await Bed.dischargePatient(req.params.bedId);
      res.json({ message: 'Patient discharged successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update bed status
  updateBedStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      if (status === 'occupied') {
        return res.status(400).json({ message: 'Use assign endpoint to occupy a bed' });
      }
      
      await Bed.updateStatus(req.params.bedId, status);
      res.json({ message: 'Bed status updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete bed
  deleteBed: async (req, res) => {
    try {
      await Bed.delete(req.params.bedId);
      res.json({ message: 'Bed deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get available beds
  getAvailableBeds: async (req, res) => {
    try {
      const beds = await Bed.findByStatus('available');
      res.json(beds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get beds by ward
  getBedsByWard: async (req, res) => {
    try {
      const { wardNumber } = req.params;
      const [beds] = await pool.query(
        'SELECT * FROM beds WHERE ward_number = ?',
        [wardNumber]
      );
      res.json(beds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get patient bed assignment
  getPatientBedAssignment: async (req, res) => {
    try {
      const [bed] = await pool.query(
        'SELECT * FROM beds WHERE patient_id = ?',
        [req.params.patientId]
      );
      
      if (!bed.length) {
        return res.status(404).json({ message: 'Patient not assigned to any bed' });
      }
      
      res.json(bed[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = wardController;