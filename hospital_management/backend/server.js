require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const wardRoutes = require('./routes/wardRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Audit logging middleware
app.use((req, res, next) => {
    if (req.user) {
        pool.query(
            'INSERT INTO audit_log (user_id, action, table_affected, record_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, `${req.method} ${req.path}`, null, null, req.ip]
        ).catch(err => console.error('Audit log error:', err));
    }
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/ward', wardRoutes);

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        next();
    }
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Default error
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});