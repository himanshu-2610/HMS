// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'patient') {
        window.location.href = '/index.html';
        return;
    }

    loadDashboardData();
    loadUpcomingAppointments();
    loadRecentMedicalRecords();
});

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/patient/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('upcomingAppointments').textContent = data.upcomingAppointments;
            document.getElementById('totalRecords').textContent = data.totalRecords;
            document.getElementById('unreadMessages').textContent = data.unreadMessages;
        } else {
            throw new Error('Failed to load dashboard data');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Load upcoming appointments
async function loadUpcomingAppointments() {
    try {
        const response = await fetch('/api/patient/appointments/upcoming', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const appointments = await response.json();
            const tbody = document.getElementById('upcomingAppointmentsList');
            tbody.innerHTML = '';

            appointments.forEach(appointment => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${appointment.doctor_name}</td>
                    <td>${new Date(appointment.appointment_date).toLocaleDateString()}</td>
                    <td>${appointment.appointment_time}</td>
                    <td><span class="badge bg-${getStatusBadgeClass(appointment.status)}">${appointment.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading upcoming appointments:', error);
    }
}

// Load recent medical records
async function loadRecentMedicalRecords() {
    try {
        const response = await fetch('/api/patient/medical-records/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const records = await response.json();
            const tbody = document.getElementById('recentRecords');
            tbody.innerHTML = '';

            records.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(record.created_at).toLocaleDateString()}</td>
                    <td>${record.doctor_name}</td>
                    <td>${record.diagnosis}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewMedicalRecord(${record.id})">View</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading recent medical records:', error);
    }
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        const response = await fetch(`/api/patient/appointments/${appointmentId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            loadUpcomingAppointments();
            showSuccess('Appointment cancelled successfully');
        } else {
            throw new Error('Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showError('Failed to cancel appointment');
    }
}

// View medical record
async function viewMedicalRecord(recordId) {
    try {
        const response = await fetch(`/api/patient/medical-records/${recordId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const record = await response.json();
            // Open a modal or navigate to a detailed view page
            showMedicalRecordDetails(record);
        } else {
            throw new Error('Failed to load medical record');
        }
    } catch (error) {
        console.error('Error loading medical record:', error);
        showError('Failed to load medical record');
    }
}

// Show medical record details
function showMedicalRecordDetails(record) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'medicalRecordModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Medical Record Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Date:</strong> ${new Date(record.created_at).toLocaleDateString()}</p>
                            <p><strong>Doctor:</strong> ${record.doctor_name}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
                            <p><strong>Treatment:</strong> ${record.treatment}</p>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Prescription:</h6>
                            <p>${record.prescription}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
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

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '/index.html';
});

// Show error message
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').prepend(alertDiv);
}

// Show success message
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').prepend(alertDiv);
} 