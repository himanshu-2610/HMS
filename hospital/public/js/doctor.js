// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'doctor') {
        window.location.href = '/index.html';
        return;
    }

    loadDashboardData();
    loadTodaySchedule();
    loadRecentMessages();
});

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/doctor/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('todayAppointments').textContent = data.todayAppointments;
            document.getElementById('totalPatients').textContent = data.totalPatients;
            document.getElementById('pendingMessages').textContent = data.pendingMessages;
        } else {
            throw new Error('Failed to load dashboard data');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Load today's schedule
async function loadTodaySchedule() {
    try {
        const response = await fetch('/api/doctor/schedule/today', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const appointments = await response.json();
            const tbody = document.getElementById('todaySchedule');
            tbody.innerHTML = '';

            appointments.forEach(appointment => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${appointment.patient_name}</td>
                    <td>${appointment.appointment_time}</td>
                    <td><span class="badge bg-${getStatusBadgeClass(appointment.status)}">${appointment.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="updateAppointmentStatus(${appointment.id}, 'completed')">Complete</button>
                        <button class="btn btn-sm btn-danger" onclick="updateAppointmentStatus(${appointment.id}, 'cancelled')">Cancel</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading today\'s schedule:', error);
    }
}

// Load recent messages
async function loadRecentMessages() {
    try {
        const response = await fetch('/api/doctor/messages/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            const tbody = document.getElementById('recentMessages');
            tbody.innerHTML = '';

            messages.forEach(message => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${message.sender_name}</td>
                    <td>${message.message}</td>
                    <td>${new Date(message.created_at).toLocaleString()}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading recent messages:', error);
    }
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, status) {
    try {
        const response = await fetch(`/api/doctor/appointments/${appointmentId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadTodaySchedule();
            showSuccess('Appointment status updated successfully');
        } else {
            throw new Error('Failed to update appointment status');
        }
    } catch (error) {
        console.error('Error updating appointment status:', error);
        showError('Failed to update appointment status');
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