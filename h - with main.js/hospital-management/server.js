require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Database connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'himanshu',
    database: 'hospital_management'
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'hospital_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
};

const requireDoctor = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.redirect('/login');
    }
    next();
};

const requirePatient = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.redirect('/login');
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Auth routes
app.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        if (role === 'admin') {
            const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
            if (rows.length === 0) {
                return res.render('auth/login', { error: 'Invalid admin credentials' });
            }
            
            const admin = rows[0];
            // Replace bcrypt.compare with direct comparison
            if (password !== admin.password) {
                return res.render('auth/login', { error: 'Invalid admin credentials' });
            }
            
            req.session.user = {
                id: admin.admin_id,
                username: admin.username,
                full_name: admin.full_name,
                email: admin.email,
                role: 'admin'
            };
            
            return res.redirect('/admin/dashboard');
        } 
        else if (role === 'doctor') {
            const [rows] = await db.query('SELECT * FROM doctors WHERE username = ?', [username]);
            if (rows.length === 0) {
                return res.render('auth/login', { error: 'Invalid doctor credentials' });
            }
            
            const doctor = rows[0];
            // Replace bcrypt.compare with direct comparison
            if (password !== doctor.password) {
                return res.render('auth/login', { error: 'Invalid doctor credentials' });
            }
            
            if (!doctor.is_active) {
                return res.render('auth/login', { error: 'Your account is deactivated. Please contact admin.' });
            }
            
            req.session.user = {
                id: doctor.doctor_id,
                username: doctor.username,
                full_name: doctor.full_name,
                email: doctor.email,
                specialization: doctor.specialization,
                role: 'doctor'
            };
            
            return res.redirect('/doctor/dashboard');
        } 
        else if (role === 'patient') {
            const [rows] = await db.query('SELECT * FROM patients WHERE username = ?', [username]);
            if (rows.length === 0) {
                return res.render('auth/login', { error: 'Invalid patient credentials' });
            }
            
            const patient = rows[0];
            // Replace bcrypt.compare with direct comparison
            if (password !== patient.password) {
                return res.render('auth/login', { error: 'Invalid patient credentials' });
            }
            
            req.session.user = {
                id: patient.patient_id,
                username: patient.username,
                full_name: patient.full_name,
                email: patient.email,
                role: 'patient'
            };
            
            return res.redirect('/patient/dashboard');
        }
    } catch (err) {
        console.error(err);
        return res.render('auth/login', { error: 'An error occurred during login' });
    }
});

app.get('/register/patient', (req, res) => {
    res.render('auth/register-patient', { error: null });
});

app.post('/register/patient', async (req, res) => {
    const { username, password, full_name, email, dob, gender, phone, address, blood_group } = req.body;
    
    try {
        // Check if username or email already exists
        const [existing] = await db.query('SELECT * FROM patients WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.render('auth/register-patient', { error: 'Username or email already exists' });
        }
        
        // Remove password hashing
        await db.query(
            'INSERT INTO patients (username, password, full_name, email, dob, gender, phone, address, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [username, password, full_name, email, dob, gender, phone, address, blood_group]
        );
        
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('auth/register-patient', { error: 'An error occurred during registration' });
    }
});

app.post('/register/doctor', requireAdmin, async (req, res) => {
    const { username, password, full_name, email, specialization, phone, address } = req.body;
    
    try {
        // Check if username or email already exists
        const [existing] = await db.query('SELECT * FROM doctors WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.render('auth/register-doctor', { error: 'Username or email already exists' });
        }
        
        // Remove password hashing
        await db.query(
            'INSERT INTO doctors (username, password, full_name, email, specialization, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, password, full_name, email, specialization, phone, address]
        );
        
        res.redirect('/admin/doctors');
    } catch (err) {
        console.error(err);
        res.render('auth/register-doctor', { error: 'An error occurred during registration' });
    }
});

app.get('/register/doctor', requireAdmin, (req, res) => {
    res.render('auth/register-doctor', { error: null, user: req.session.user });
});

app.post('/register/doctor', requireAdmin, async (req, res) => {
    const { username, password, full_name, email, specialization, phone, address } = req.body;
    
    try {
        // Check if username or email already exists
        const [existing] = await db.query('SELECT * FROM doctors WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.render('auth/register-doctor', { error: 'Username or email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new doctor
        await db.query(
            'INSERT INTO doctors (username, password, full_name, email, specialization, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, full_name, email, specialization, phone, address]
        );
        
        res.redirect('/admin/doctors');
    } catch (err) {
        console.error(err);
        res.render('auth/register-doctor', { error: 'An error occurred during registration' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Admin routes
app.get('/admin/dashboard', requireAdmin, async (req, res) => {
    try {
        // Get counts for dashboard
        const [patients] = await db.query('SELECT COUNT(*) as count FROM patients');
        const [doctors] = await db.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = TRUE');
        const [appointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE status = "Scheduled"');
        const [beds] = await db.query('SELECT COUNT(*) as count FROM beds WHERE status = "Occupied"');
        
        res.render('admin/dashboard', {
            user: req.session.user,
            counts: {
                patients: patients[0].count,
                doctors: doctors[0].count,
                appointments: appointments[0].count,
                beds: beds[0].count
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/admin/patients', requireAdmin, async (req, res) => {
    try {
        const [patients] = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
        res.render('admin/patients', { user: req.session.user, patients });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/admin/patient/:id', requireAdmin, async (req, res) => {
    try {
        const [patient] = await db.query('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
        if (patient.length === 0) {
            return res.status(404).send('Patient not found');
        }
        
        const [appointments] = await db.query('SELECT a.*, d.full_name as doctor_name FROM appointments a JOIN doctors d ON a.doctor_id = d.doctor_id WHERE a.patient_id = ? ORDER BY a.appointment_date DESC', [req.params.id]);
        const [medicalRecords] = await db.query('SELECT mr.*, d.full_name as doctor_name FROM medical_records mr JOIN doctors d ON mr.doctor_id = d.doctor_id WHERE mr.patient_id = ? ORDER BY mr.record_date DESC', [req.params.id]);
        const [bed] = await db.query('SELECT * FROM beds WHERE patient_id = ?', [req.params.id]);
        
        res.render('admin/patient-detail', {
            user: req.session.user,
            patient: patient[0],
            appointments,
            medicalRecords,
            bed: bed.length > 0 ? bed[0] : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/patient/delete/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM patients WHERE patient_id = ?', [req.params.id]);
        res.redirect('/admin/patients');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/admin/doctors', requireAdmin, async (req, res) => {
    try {
        const [doctors] = await db.query('SELECT * FROM doctors ORDER BY created_at DESC');
        res.render('admin/doctors', { user: req.session.user, doctors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/admin/doctor/:id', requireAdmin, async (req, res) => {
    try {
        const [doctor] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [req.params.id]);
        if (doctor.length === 0) {
            return res.status(404).send('Doctor not found');
        }
        
        const [appointments] = await db.query('SELECT a.*, p.full_name as patient_name FROM appointments a JOIN patients p ON a.patient_id = p.patient_id WHERE a.doctor_id = ? ORDER BY a.appointment_date DESC', [req.params.id]);
        
        res.render('admin/doctor-detail', {
            user: req.session.user,
            doctor: doctor[0],
            appointments
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/doctor/status/:id', requireAdmin, async (req, res) => {
    try {
        const [doctor] = await db.query('SELECT is_active FROM doctors WHERE doctor_id = ?', [req.params.id]);
        if (doctor.length === 0) {
            return res.status(404).send('Doctor not found');
        }
        
        const newStatus = !doctor[0].is_active;
        await db.query('UPDATE doctors SET is_active = ? WHERE doctor_id = ?', [newStatus, req.params.id]);
        
        res.redirect('/admin/doctors');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/doctor/delete/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM doctors WHERE doctor_id = ?', [req.params.id]);
        res.redirect('/admin/doctors');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/admin/appointments', requireAdmin, async (req, res) => {
    try {
        const [appointments] = await db.query(`
            SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.patient_id 
            JOIN doctors d ON a.doctor_id = d.doctor_id 
            ORDER BY a.appointment_date DESC
        `);
        res.render('admin/appointments', { user: req.session.user, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/admin/beds', requireAdmin, async (req, res) => {
    try {
        const [beds] = await db.query(`
            SELECT b.*, p.full_name as patient_name 
            FROM beds b 
            LEFT JOIN patients p ON b.patient_id = p.patient_id 
            ORDER BY b.ward, b.bed_number
        `);
        res.render('admin/beds', { user: req.session.user, beds });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/beds', requireAdmin, async (req, res) => {
    const { bed_number, ward } = req.body;
    
    try {
        await db.query('INSERT INTO beds (bed_number, ward) VALUES (?, ?)', [bed_number, ward]);
        res.redirect('/admin/beds');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/bed/assign/:id', requireAdmin, async (req, res) => {
    const { patient_id, admission_date } = req.body;
    
    try {
        await db.query('UPDATE beds SET status = "Occupied", patient_id = ?, admission_date = ? WHERE bed_id = ?', [patient_id, admission_date, req.params.id]);
        res.redirect('/admin/beds');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/bed/discharge/:id', requireAdmin, async (req, res) => {
    const { discharge_date } = req.body;
    
    try {
        await db.query('UPDATE beds SET status = "Available", patient_id = NULL, admission_date = NULL, discharge_date = ? WHERE bed_id = ?', [discharge_date, req.params.id]);
        res.redirect('/admin/beds');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/admin/medicines', requireAdmin, async (req, res) => {
    try {
        const [medicines] = await db.query('SELECT * FROM medicines ORDER BY name');
        res.render('admin/medicines', { user: req.session.user, medicines });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/medicines', requireAdmin, async (req, res) => {
    const { name, description, quantity, price, expiry_date, supplier } = req.body;
    
    try {
        await db.query(
            'INSERT INTO medicines (name, description, quantity, price, expiry_date, supplier) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, quantity, price, expiry_date, supplier]
        );
        res.redirect('/admin/medicines');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/medicine/delete/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM medicines WHERE medicine_id = ?', [req.params.id]);
        res.redirect('/admin/medicines');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



// Doctor routes
app.get('/doctor/dashboard', requireDoctor, async (req, res) => {
    try {
        // Get counts for dashboard
        const [appointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = "Scheduled"', [req.session.user.id]);
        const [patients] = await db.query('SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = ?', [req.session.user.id]);
        
        // Get today's appointments
        const today = new Date().toISOString().split('T')[0];
        const [todaysAppointments] = await db.query(`
            SELECT a.*, p.full_name as patient_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.patient_id 
            WHERE a.doctor_id = ? AND a.appointment_date = ? AND a.status = 'Scheduled'
            ORDER BY a.appointment_time
        `, [req.session.user.id, today]);
        
        res.render('doctor/dashboard', {
            user: req.session.user,
            counts: {
                appointments: appointments[0].count,
                patients: patients[0].count
            },
            todaysAppointments
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/doctor/appointments', requireDoctor, async (req, res) => {
    try {
        const [appointments] = await db.query(`
            SELECT a.*, p.full_name as patient_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.patient_id 
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date DESC
        `, [req.session.user.id]);
        
        res.render('doctor/appointments', { user: req.session.user, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/doctor/appointment/status/:id', requireDoctor, async (req, res) => {
    const { status } = req.body;
    
    try {
        await db.query('UPDATE appointments SET status = ? WHERE appointment_id = ? AND doctor_id = ?', [status, req.params.id, req.session.user.id]);
        res.redirect('/doctor/appointments');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/doctor/patients', requireDoctor, async (req, res) => {
    try {
        const [patients] = await db.query(`
            SELECT DISTINCT p.* 
            FROM patients p 
            JOIN appointments a ON p.patient_id = a.patient_id 
            WHERE a.doctor_id = ?
            ORDER BY p.full_name
        `, [req.session.user.id]);
        
        res.render('doctor/patients', { user: req.session.user, patients });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/doctor/patient/:id', requireDoctor, async (req, res) => {
    try {
        // Check if doctor has any appointments with this patient
        const [hasAccess] = await db.query('SELECT 1 FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1', [req.session.user.id, req.params.id]);
        if (hasAccess.length === 0) {
            return res.status(403).send('Access denied');
        }
        
        const [patient] = await db.query('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
        if (patient.length === 0) {
            return res.status(404).send('Patient not found');
        }
        
        const [appointments] = await db.query('SELECT * FROM appointments WHERE doctor_id = ? AND patient_id = ? ORDER BY appointment_date DESC', [req.session.user.id, req.params.id]);
        const [medicalRecords] = await db.query('SELECT * FROM medical_records WHERE doctor_id = ? AND patient_id = ? ORDER BY record_date DESC', [req.session.user.id, req.params.id]);
        
        res.render('doctor/patient-detail', {
            user: req.session.user,
            patient: patient[0],
            appointments,
            medicalRecords
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/doctor/medical-record', requireDoctor, async (req, res) => {
    const { patient_id, diagnosis, treatment, prescription, notes, record_date } = req.body;
    
    try {
        // Check if doctor has any appointments with this patient
        const [hasAccess] = await db.query('SELECT 1 FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1', [req.session.user.id, patient_id]);
        if (hasAccess.length === 0) {
            return res.status(403).send('Access denied');
        }
        
        await db.query(
            'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, prescription, notes, record_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [patient_id, req.session.user.id, diagnosis, treatment, prescription, notes, record_date]
        );
        
        res.redirect(`/doctor/patient/${patient_id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Patient routes
app.get('/patient/dashboard', requirePatient, async (req, res) => {
    try {
        // Get counts for dashboard
        const [appointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status = "Scheduled"', [req.session.user.id]);
        const [doctors] = await db.query('SELECT COUNT(DISTINCT doctor_id) as count FROM appointments WHERE patient_id = ?', [req.session.user.id]);
        
        // Get today's appointments
        const today = new Date().toISOString().split('T')[0];
        const [todaysAppointments] = await db.query(`
            SELECT a.*, d.full_name as doctor_name, d.specialization 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.doctor_id 
            WHERE a.patient_id = ? AND a.appointment_date = ? AND a.status = 'Scheduled'
            ORDER BY a.appointment_time
        `, [req.session.user.id, today]);
        
        // Check bed status
        const [bed] = await db.query('SELECT * FROM beds WHERE patient_id = ?', [req.session.user.id]);
        
        res.render('patient/dashboard', {
            user: req.session.user,
            counts: {
                appointments: appointments[0].count,
                doctors: doctors[0].count
            },
            todaysAppointments,
            bed: bed.length > 0 ? bed[0] : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/patient/profile', requirePatient, async (req, res) => {
    try {
        const [patient] = await db.query('SELECT * FROM patients WHERE patient_id = ?', [req.session.user.id]);
        res.render('patient/profile', { user: req.session.user, patient: patient[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/patient/profile', requirePatient, async (req, res) => {
    const { full_name, email, phone, address, blood_group } = req.body;
    
    try {
        await db.query(
            'UPDATE patients SET full_name = ?, email = ?, phone = ?, address = ?, blood_group = ? WHERE patient_id = ?',
            [full_name, email, phone, address, blood_group, req.session.user.id]
        );
        
        // Update session
        req.session.user.full_name = full_name;
        req.session.user.email = email;
        
        res.redirect('/patient/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/patient/change-password', requirePatient, (req, res) => {
    res.render('patient/change-password', {
        user: req.session.user,
        error: null
    });
});

app.post('/patient/change-password', requirePatient, async (req, res) => {
    const { current_password, new_password } = req.body;
    
    try {
        const [patient] = await db.query(
            'SELECT password FROM patients WHERE patient_id = ?', 
            [req.session.user.id]
        );

        if (current_password !== patient[0].password) {
            return res.render('patient/change-password', {
                error: 'Current password is incorrect',
                user: req.session.user
            });
        }

        await db.query(
            'UPDATE patients SET password = ? WHERE patient_id = ?', 
            [new_password, req.session.user.id]
        );

        res.redirect('/patient/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/patient/appointments', requirePatient, async (req, res) => {
    try {
        const [appointments] = await db.query(`
            SELECT a.*, d.full_name as doctor_name, d.specialization 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.doctor_id 
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC
        `, [req.session.user.id]);
        
        res.render('patient/appointments', { user: req.session.user, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/patient/appointments/book', requirePatient, async (req, res) => {
    try {
        const [doctors] = await db.query('SELECT * FROM doctors WHERE is_active = TRUE ORDER BY full_name');
        res.render('patient/book-appointment', { user: req.session.user, doctors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/patient/appointments/book', requirePatient, async (req, res) => {
    const { doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    try {
        await db.query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)',
            [req.session.user.id, doctor_id, appointment_date, appointment_time, reason]
        );
        
        res.redirect('/patient/appointments');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/patient/appointment/cancel/:id', requirePatient, async (req, res) => {
    try {
        await db.query('UPDATE appointments SET status = "Cancelled" WHERE appointment_id = ? AND patient_id = ?', [req.params.id, req.session.user.id]);
        res.redirect('/patient/appointments');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/patient/doctors', requirePatient, async (req, res) => {
    try {
        const [doctors] = await db.query('SELECT * FROM doctors WHERE is_active = TRUE ORDER BY full_name');
        res.render('patient/doctors', { user: req.session.user, doctors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/patient/medical-records', requirePatient, async (req, res) => {
    try {
        const [medicalRecords] = await db.query(`
            SELECT mr.*, d.full_name as doctor_name 
            FROM medical_records mr 
            JOIN doctors d ON mr.doctor_id = d.doctor_id 
            WHERE mr.patient_id = ?
            ORDER BY mr.record_date DESC
        `, [req.session.user.id]);
        
        res.render('patient/medical-records', { user: req.session.user, medicalRecords });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to send message
app.post('/send/message', requireAuth, async (req, res) => {
    const { receiver_type, receiver_id, subject, message } = req.body;
    const sender_id = req.session.user.id; // This gets the sender's ID from the session
    const sender_type = req.session.user.role; // This gets the sender's role (admin/doctor/patient)

    try {
        await db.query(
            'INSERT INTO messages (sender_type, sender_id, receiver_type, receiver_id, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
            [sender_type, sender_id, receiver_type, receiver_id, subject, message]
        );
        res.redirect('/messages');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to view messages
app.get('/messages', requireAuth, async (req, res) => {
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        const [messages] = await db.query(
            `SELECT m.*, 
                CASE 
                    WHEN m.sender_type = 'doctor' THEN (SELECT full_name FROM doctors WHERE doctor_id = m.sender_id)
                    WHEN m.sender_type = 'patient' THEN (SELECT full_name FROM patients WHERE patient_id = m.sender_id)
                    ELSE (SELECT full_name FROM admins WHERE admin_id = m.sender_id) 
                END AS sender_name
            FROM messages m 
            WHERE (m.receiver_id = ? AND m.receiver_type = ?) OR (m.sender_id = ? AND m.sender_type = ?)
            ORDER BY m.created_at DESC`,
            [userId, userRole, userId, userRole]
        );

        res.render(`${userRole}/messages`, {
            user: req.session.user,
            messages: messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to mark message as read
app.post('/message/read/:id', requireAuth, async (req, res) => {
    try {
        await db.query('UPDATE messages SET is_read = TRUE WHERE message_id = ?', [req.params.id]);
        res.redirect('/messages');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:3000/`);
});