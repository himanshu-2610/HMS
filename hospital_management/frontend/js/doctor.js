document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!localStorage.getItem('token')) {
      window.location.href = '../auth/login.html';
      return;
    }
  
    // Load dashboard stats
    await loadDashboardStats();
    
    // Load upcoming appointments
    await loadUpcomingAppointments();
  });
  
  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all stats in parallel
      const [patientsRes, appointmentsRes] = await Promise.all([
        fetch('http://localhost:3000/api/doctor/patients', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/doctor/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      // Update UI
      if (patientsRes.ok) {
        const patients = await patientsRes.json();
        document.getElementById('totalPatients').textContent = patients.length;
      }
      
      if (appointmentsRes.ok) {
        const appointments = await appointmentsRes.json();
        const today = new Date().toISOString().split('T')[0];
        const todaysAppointments = appointments.filter(a => {
          return a.appointment_date.split('T')[0] === today && a.status === 'scheduled';
        });
        document.getElementById('todaysAppointments').textContent = todaysAppointments.length;
        
        const pendingNotes = appointments.filter(a => !a.notes && a.status === 'completed');
        document.getElementById('pendingNotes').textContent = pendingNotes.length;
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  }
  
  async function loadUpcomingAppointments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/doctor/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const appointments = await response.json();
        const tbody = document.querySelector('#upcomingAppointments tbody');
        tbody.innerHTML = '';
        
        // Filter upcoming appointments (next 7 days)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcoming = appointments.filter(appt => {
          const apptDate = new Date(appt.appointment_date);
          return apptDate > now && apptDate < nextWeek && appt.status === 'scheduled';
        });
        
        upcoming.forEach(appt => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${new Date(appt.appointment_date).toLocaleString()}</td>
            <td>${appt.patient_first_name} ${appt.patient_last_name}</td>
            <td>${appt.reason || 'Not specified'}</td>
            <td class="action-btns">
              <button class="btn" onclick="viewPatient(${appt.patient_id})">View Patient</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (err) {
      console.error('Error loading upcoming appointments:', err);
    }
  }
  
  function viewPatient(patientId) {
    window.location.href = `patients.html?patientId=${patientId}`;
  }