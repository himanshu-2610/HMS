const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const validator = require('validator');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_management'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Role-based access control middleware
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

// Input validation middleware
const validateRegistration = (req, res, next) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    if (!['patient', 'doctor'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    next();
};

// Routes
// Auth routes
app.post('/api/auth/register', validateRegistration, async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if user exists
        const [existingUser] = await db.promise().query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.promise().query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        // Create corresponding profile based on role
        if (role === 'patient') {
            await db.promise().query(
                'INSERT INTO patients (user_id) VALUES (?)',
                [result.insertId]
            );
        } else if (role === 'doctor') {
            await db.promise().query(
                'INSERT INTO doctors (user_id) VALUES (?)',
                [result.insertId]
            );
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
        return res.status(400).json({ message: 'Username/email and password are required' });
    }

    try {
        // Find user by either username or email
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username || email, email || username]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token with shorter expiration
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Password reset request
app.post('/api/auth/reset-password-request', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Generate reset token (in production, send email with this token)
        const resetToken = jwt.sign(
            { id: users[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Password reset instructions sent to email' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.promise().query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, decoded.id]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

// Update profile
app.put('/api/profile', authenticateToken, async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;

    try {
        // Verify current password if changing password
        if (newPassword) {
            const [users] = await db.promise().query(
                'SELECT password FROM users WHERE id = ?',
                [req.user.id]
            );
            
            const validPassword = await bcrypt.compare(currentPassword, users[0].password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
        }

        // Update user profile
        const updates = [];
        const values = [];

        if (username) {
            updates.push('username = ?');
            values.push(username);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        if (updates.length > 0) {
            values.push(req.user.id);
            await db.promise().query(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// Book appointment
app.post('/api/appointments', authenticateToken, checkRole(['patient']), async (req, res) => {
    const { doctor_id, appointment_date, appointment_time } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ message: 'Doctor ID, date, and time are required' });
    }

    try {
        // Check if doctor exists and is available
        const [doctors] = await db.promise().query(
            'SELECT * FROM doctors WHERE id = ? AND is_active = 1',
            [doctor_id]
        );

        if (doctors.length === 0) {
            return res.status(404).json({ message: 'Doctor not found or not available' });
        }

        // Check if time slot is available
        const [existingAppointments] = await db.promise().query(
            'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?',
            [doctor_id, appointment_date, appointment_time]
        );

        if (existingAppointments.length > 0) {
            return res.status(400).json({ message: 'Time slot is already booked' });
        }

        // Create appointment
        await db.promise().query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
            [req.user.id, doctor_id, appointment_date, appointment_time]
        );

        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error('Appointment booking error:', error);
        res.status(500).json({ message: 'Server error during appointment booking' });
    }
});

// Admin routes
app.get('/api/admin/dashboard', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const [patients] = await db.promise().query('SELECT COUNT(*) as count FROM patients');
        const [doctors] = await db.promise().query('SELECT COUNT(*) as count FROM doctors');
        const [appointments] = await db.promise().query(
            'SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = CURDATE()'
        );

        res.json({
            totalPatients: patients[0].count,
            totalDoctors: doctors[0].count,
            todayAppointments: appointments[0].count
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent appointments for admin
app.get('/api/admin/appointments/recent', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const [appointments] = await db.promise().query(`
            SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            LIMIT 10
        `);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching recent appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get system messages for admin
app.get('/api/admin/messages', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const [messages] = await db.promise().query(`
            SELECT m.*, u.username as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            ORDER BY m.created_at DESC
            LIMIT 10
        `);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching system messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Routes
app.get('/api/admin/patients', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const [patients] = await db.promise().query(`
            SELECT p.*, u.username, u.email, u.role 
            FROM patients p 
            JOIN users u ON p.user_id = u.id
        `);
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/patients', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { first_name, last_name, email, phone, address, date_of_birth } = req.body;
        const [result] = await db.promise().query(
            'INSERT INTO patients (first_name, last_name, email, phone, address, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, address, date_of_birth]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/patients/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { first_name, last_name, email, phone, address, date_of_birth } = req.body;
        await db.promise().query(
            'UPDATE patients SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, date_of_birth = ? WHERE id = ?',
            [first_name, last_name, email, phone, address, date_of_birth, req.params.id]
        );
        res.json({ message: 'Patient updated successfully' });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/patients/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        await db.promise().query('DELETE FROM patients WHERE id = ?', [req.params.id]);
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Doctor Management
app.get('/api/admin/doctors', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const [doctors] = await db.promise().query(`
            SELECT d.*, u.username, u.email, u.role 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id
        `);
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/doctors', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { first_name, last_name, email, phone, specialization, is_active } = req.body;
        const [result] = await db.promise().query(
            'INSERT INTO doctors (first_name, last_name, email, phone, specialization, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, specialization, is_active]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/doctors/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { first_name, last_name, email, phone, specialization, is_active } = req.body;
        await db.promise().query(
            'UPDATE doctors SET first_name = ?, last_name = ?, email = ?, phone = ?, specialization = ?, is_active = ? WHERE id = ?',
            [first_name, last_name, email, phone, specialization, is_active, req.params.id]
        );
        res.json({ message: 'Doctor updated successfully' });
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Pharmacy Management
app.get('/api/admin/medicines', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const [medicines] = await db.promise().query('SELECT * FROM medicines');
        res.json(medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/medicines', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { name, description, quantity, expiry_date, price } = req.body;
        const [result] = await db.promise().query(
            'INSERT INTO medicines (name, description, quantity, expiry_date, price) VALUES (?, ?, ?, ?, ?)',
            [name, description, quantity, expiry_date, price]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Ward Management
app.get('/api/admin/wards', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const [wards] = await db.promise().query('SELECT * FROM wards');
        res.json(wards);
    } catch (error) {
        console.error('Error fetching wards:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/wards', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { name, capacity, current_occupancy } = req.body;
        const [result] = await db.promise().query(
            'INSERT INTO wards (name, capacity, current_occupancy) VALUES (?, ?, ?)',
            [name, capacity, current_occupancy]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating ward:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Doctor Routes
app.get('/api/doctor/dashboard', authenticateToken, checkRole(['doctor']), async (req, res) => {
    try {
        const [appointments] = await db.promise().query(
            'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE()',
            [req.user.id]
        );
        const [patients] = await db.promise().query(
            'SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = ?',
            [req.user.id]
        );
        const [messages] = await db.promise().query(
            'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
            [req.user.id]
        );

        res.json({
            todayAppointments: appointments[0].count,
            totalPatients: patients[0].count,
            pendingMessages: messages[0].count
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get today's schedule for doctor
app.get('/api/doctor/schedule/today', authenticateToken, checkRole(['doctor']), async (req, res) => {
    try {
        const [appointments] = await db.promise().query(`
            SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = ? AND DATE(a.appointment_date) = CURDATE()
            ORDER BY a.appointment_time ASC
        `, [req.user.id]);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching today\'s schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent messages for doctor
app.get('/api/doctor/messages/recent', authenticateToken, checkRole(['doctor']), async (req, res) => {
    try {
        const [messages] = await db.promise().query(`
            SELECT m.*, u.username as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = ?
            ORDER BY m.created_at DESC
            LIMIT 10
        `, [req.user.id]);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching recent messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update appointment status
app.put('/api/doctor/appointments/:id/status', authenticateToken, checkRole(['doctor']), async (req, res) => {
    try {
        const { status } = req.body;
        const [result] = await db.promise().query(
            'UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?',
            [status, req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.json({ message: 'Appointment status updated successfully' });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Doctor Routes
app.get('/api/doctor/patients', authenticateToken, checkRole(['doctor']), async (req, res) => {
    try {
        const [patients] = await db.promise().query(`
            SELECT p.* FROM patients p
            JOIN appointments a ON p.id = a.patient_id
            WHERE a.doctor_id = ?
            GROUP BY p.id
        `, [req.user.id]);
        res.json(patients);
    } catch (error) {
        console.error('Error fetching doctor patients:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/doctor/appointments', authenticateToken, checkRole(['doctor']), async (req, res) => {
    try {
        const [appointments] = await db.promise().query(`
            SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = ?
        `, [req.user.id]);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Patient Routes
app.get('/api/patient/dashboard', authenticateToken, checkRole(['patient']), async (req, res) => {
    try {
        const [appointments] = await db.promise().query(
            'SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND appointment_date >= CURDATE()',
            [req.user.id]
        );
        const [records] = await db.promise().query(
            'SELECT COUNT(*) as count FROM medical_records WHERE patient_id = ?',
            [req.user.id]
        );
        const [messages] = await db.promise().query(
            'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
            [req.user.id]
        );

        res.json({
            upcomingAppointments: appointments[0].count,
            totalRecords: records[0].count,
            unreadMessages: messages[0].count
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get upcoming appointments for patient
app.get('/api/patient/appointments/upcoming', authenticateToken, checkRole(['patient']), async (req, res) => {
    try {
        const [appointments] = await db.promise().query(`
            SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = ? AND a.appointment_date >= CURDATE()
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
        `, [req.user.id]);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent medical records for patient
app.get('/api/patient/medical-records/recent', authenticateToken, checkRole(['patient']), async (req, res) => {
    try {
        const [records] = await db.promise().query(`
            SELECT mr.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM medical_records mr
            JOIN doctors d ON mr.doctor_id = d.id
            WHERE mr.patient_id = ?
            ORDER BY mr.created_at DESC
            LIMIT 10
        `, [req.user.id]);
        res.json(records);
    } catch (error) {
        console.error('Error fetching recent medical records:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel appointment
app.put('/api/patient/appointments/:id/cancel', authenticateToken, checkRole(['patient']), async (req, res) => {
    try {
        const [result] = await db.promise().query(
            'UPDATE appointments SET status = "cancelled" WHERE id = ? AND patient_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get medical record details
app.get('/api/patient/medical-records/:id', authenticateToken, checkRole(['patient']), async (req, res) => {
    try {
        const [records] = await db.promise().query(`
            SELECT mr.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM medical_records mr
            JOIN doctors d ON mr.doctor_id = d.id
            WHERE mr.id = ? AND mr.patient_id = ?
        `, [req.params.id, req.user.id]);
        
        if (records.length === 0) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        
        res.json(records[0]);
    } catch (error) {
        console.error('Error fetching medical record:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Patient Routes
app.get('/api/patient/appointments', authenticateToken, checkRole(['patient']), async (req, res) => {
    try {
        const [appointments] = await db.promise().query(`
            SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = ?
        `, [req.user.id]);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/patient/appointments', authenticateToken, checkRole(['patient']), async (req, res) => {
    try {
        const { doctor_id, appointment_date, appointment_time } = req.body;
        const [result] = await db.promise().query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
            [req.user.id, doctor_id, appointment_date, appointment_time]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
}); 