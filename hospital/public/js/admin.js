// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'admin') {
        window.location.href = '/index.html';
        return;
    }

    // Set up token refresh
    setupTokenRefresh();

    // Load initial data
    loadDashboardData();
    loadRecentAppointments();
    loadSystemMessages();

    // Set up navigation
    setupNavigation();

    // Set up event listeners
    setupEventListeners();
});

// Set up token refresh
function setupTokenRefresh() {
    setInterval(async () => {
        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    }, 30 * 60 * 1000);
}

// Set up navigation
function setupNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            if (section) {
                loadSection(section);
            }
        });
    });
}

// Load section content
async function loadSection(section) {
    try {
        const response = await fetch(`/api/admin/${section}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displaySectionContent(section, data);
        } else if (response.status === 401) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error(`Error loading ${section}:`, error);
        showError(`Failed to load ${section}`);
    }
}

// Display section content
function displaySectionContent(section, data) {
    const mainContent = document.querySelector('.main-content');
    let content = '';

    switch (section) {
        case 'patients':
            content = generatePatientsTable(data);
            break;
        case 'doctors':
            content = generateDoctorsTable(data);
            break;
        case 'appointments':
            content = generateAppointmentsTable(data);
            break;
        case 'pharmacy':
            content = generatePharmacyTable(data);
            break;
        case 'wards':
            content = generateWardsTable(data);
            break;
        case 'messages':
            content = generateMessagesTable(data);
            break;
        case 'system':
            content = generateSystemLogsTable(data);
            break;
    }

    mainContent.innerHTML = `
        <h2 class="mb-4">${section.charAt(0).toUpperCase() + section.slice(1)}</h2>
        ${content}
    `;
}

// Set up event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Add Patient
    document.getElementById('savePatientBtn').addEventListener('click', handleAddPatient);
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('totalPatients').textContent = data.totalPatients;
            document.getElementById('totalDoctors').textContent = data.totalDoctors;
            document.getElementById('todayAppointments').textContent = data.todayAppointments;
            document.getElementById('unreadMessages').textContent = data.unreadMessages;
        } else if (response.status === 401) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Load recent appointments
async function loadRecentAppointments() {
    try {
        const response = await fetch('/api/admin/appointments/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const appointments = await response.json();
            const tbody = document.getElementById('recentAppointments');
            tbody.innerHTML = '';

            appointments.forEach(appointment => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${appointment.patient_first_name} ${appointment.patient_last_name}</td>
                    <td>${appointment.doctor_first_name} ${appointment.doctor_last_name}</td>
                    <td>${new Date(appointment.appointment_date).toLocaleDateString()}</td>
                    <td>${appointment.appointment_time}</td>
                    <td><span class="badge bg-${getStatusBadgeClass(appointment.status)}">${appointment.status}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } else if (response.status === 401) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error('Error loading recent appointments:', error);
        showError('Failed to load recent appointments');
    }
}

// Load system messages
async function loadSystemMessages() {
    try {
        const response = await fetch('/api/admin/messages', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            const tbody = document.getElementById('systemMessages');
            tbody.innerHTML = '';

            messages.forEach(message => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${message.sender_name}</td>
                    <td>${message.message}</td>
                    <td>${new Date(message.created_at).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="replyToMessage(${message.id})">Reply</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMessage(${message.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else if (response.status === 401) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error('Error loading system messages:', error);
        showError('Failed to load system messages');
    }
}

// Handle add patient
async function handleAddPatient() {
    const form = document.getElementById('addPatientForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/admin/patients', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPatientModal'));
            modal.hide();
            form.reset();
            showSuccess('Patient added successfully');
            loadSection('patients');
        } else if (response.status === 401) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        showError('Failed to add patient');
    }
}

// Reply to message
async function replyToMessage(messageId) {
    const reply = prompt('Enter your reply:');
    if (!reply) return;

    try {
        const response = await fetch(`/api/admin/messages/${messageId}/reply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reply })
        });

        if (response.ok) {
            loadSystemMessages();
            showSuccess('Message sent successfully');
        } else if (response.status === 401) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error('Error replying to message:', error);
        showError('Failed to send message');
    }
}

// Delete message
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadSystemMessages();
            showSuccess('Message deleted successfully');
        } else if (response.status === 401) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        showError('Failed to delete message');
    }
}

// Helper function to get status badge class
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'scheduled':
            return 'primary';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Handle unauthorized access
function handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/index.html';
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/index.html';
}

// Show error message
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}

// Show success message
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}

// Generate tables
function generatePatientsTable(data) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(patient => `
                        <tr>
                            <td>${patient.id}</td>
                            <td>${patient.first_name} ${patient.last_name}</td>
                            <td>${patient.email}</td>
                            <td>${patient.phone}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editPatient(${patient.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateDoctorsTable(data) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Specialization</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(doctor => `
                        <tr>
                            <td>${doctor.id}</td>
                            <td>${doctor.first_name} ${doctor.last_name}</td>
                            <td>${doctor.email}</td>
                            <td>${doctor.phone}</td>
                            <td>${doctor.specialization}</td>
                            <td><span class="badge bg-${doctor.is_active ? 'success' : 'danger'}">${doctor.is_active ? 'Active' : 'Inactive'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editDoctor(${doctor.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${doctor.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateAppointmentsTable(data) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(appointment => `
                        <tr>
                            <td>${appointment.id}</td>
                            <td>${appointment.patient_first_name} ${appointment.patient_last_name}</td>
                            <td>${appointment.doctor_first_name} ${appointment.doctor_last_name}</td>
                            <td>${new Date(appointment.appointment_date).toLocaleDateString()}</td>
                            <td>${appointment.appointment_time}</td>
                            <td><span class="badge bg-${getStatusBadgeClass(appointment.status)}">${appointment.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editAppointment(${appointment.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generatePharmacyTable(data) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Expiry Date</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(medicine => `
                        <tr>
                            <td>${medicine.id}</td>
                            <td>${medicine.name}</td>
                            <td>${medicine.description}</td>
                            <td>${medicine.quantity}</td>
                            <td>${new Date(medicine.expiry_date).toLocaleDateString()}</td>
                            <td>$${medicine.price}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editMedicine(${medicine.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${medicine.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateWardsTable(data) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Capacity</th>
                        <th>Current Occupancy</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(ward => `
                        <tr>
                            <td>${ward.id}</td>
                            <td>${ward.name}</td>
                            <td>${ward.capacity}</td>
                            <td>${ward.current_occupancy}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editWard(${ward.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteWard(${ward.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateMessagesTable(data) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sender</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(message => `
                        <tr>
                            <td>${message.id}</td>
                            <td>${message.sender_name}</td>
                            <td>${message.message}</td>
                            <td>${new Date(message.created_at).toLocaleString()}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="replyToMessage(${message.id})">Reply</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteMessage(${message.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateSystemLogsTable(data) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Message</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(log => `
                        <tr>
                            <td>${log.id}</td>
                            <td>${log.message}</td>
                            <td>${new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
} 