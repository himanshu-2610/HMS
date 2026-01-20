document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!localStorage.getItem('token')) {
      window.location.href = '../auth/login.html';
      return;
    }
  
    // Load dashboard stats
    await loadDashboardStats();
    
    // Load recent appointments
    await loadRecentAppointments();
    
    // Load bed status
    await loadBedStatus();
  });
  
  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch appointments
      const response = await fetch('http://localhost:3000/api/patient/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const appointments = await response.json();
        
        // Upcoming appointments
        const now = new Date();
        const upcoming = appointments.filter(appt => {
          const apptDate = new Date(appt.appointment_date);
          return apptDate > now && appt.status === 'scheduled';
        });
        document.getElementById('upcomingCount').textContent = upcoming.length;
        
        // Completed appointments (with records)
        const completed = appointments.filter(appt => appt.status === 'completed');
        document.getElementById('recordsCount').textContent = completed.length;
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  }
  
  async function loadRecentAppointments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/patient/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const appointments = await response.json();
        const tbody = document.querySelector('#recentAppointments tbody');
        tbody.innerHTML = '';
        
        // Sort by date (newest first)
        appointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
        
        // Show last 5 appointments
        appointments.slice(0, 5).forEach(appt => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${new Date(appt.appointment_date).toLocaleString()}</td>
            <td>Dr. ${appt.doctor_first_name} ${appt.doctor_last_name}</td>
            <td>${appt.status}</td>
            <td class="action-btns">
              <button class="btn" onclick="viewAppointment(${appt.id})">Details</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (err) {
      console.error('Error loading recent appointments:', err);
    }
  }
  
  async function loadBedStatus() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/patient/bed-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const bedStatusEl = document.getElementById('bedStatus');
      
      if (response.ok) {
        const bed = await response.json();
        if (bed) {
          bedStatusEl.textContent = `Ward ${bed.ward_number}, Bed ${bed.bed_number}`;
          bedStatusEl.className = 'admitted';
        } else {
          bedStatusEl.textContent = 'Not admitted';
          bedStatusEl.className = 'not-admitted';
        }
      }
    } catch (err) {
      console.error('Error loading bed status:', err);
    }
  }
  
  function viewAppointment(appointmentId) {
    window.location.href = `appointments.html?appointmentId=${appointmentId}`;
  }