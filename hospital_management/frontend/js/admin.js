document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') {
      window.location.href = '../auth/login.html';
      return;
    }
  
    // Load data based on current page
    const path = window.location.pathname.split('/').pop();
    
    switch(path) {
      case 'dashboard.html':
        await loadDashboardStats();
        await loadRecentActivity();
        break;
      case 'patients.html':
        await loadPatients();
        setupPatientModal();
        break;
      case 'doctors.html':
        await loadDoctors();
        setupDoctorModal();
        break;
      case 'appointments.html':
        await loadAppointments();
        setupAppointmentModal();
        break;
      case 'pharmacy.html':
        await loadMedicines();
        setupMedicineModal();
        break;
      case 'wards.html':
        await loadWards();
        setupWardModals();
        break;
    }
  
    // Common event listeners
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', logout);
    });
  });
  
  // Dashboard Functions
  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      
      const [patientsRes, doctorsRes, appointmentsRes, bedsRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/admin/doctors', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/admin/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/admin/beds/available', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (patientsRes.ok) {
        const patients = await patientsRes.json();
        document.getElementById('totalPatients').textContent = patients.length;
      }
      
      if (doctorsRes.ok) {
        const doctors = await doctorsRes.json();
        const activeDoctors = doctors.filter(d => d.is_active);
        document.getElementById('activeDoctors').textContent = activeDoctors.length;
      }
      
      if (appointmentsRes.ok) {
        const appointments = await appointmentsRes.json();
        const today = new Date().toISOString().split('T')[0];
        const todaysAppointments = appointments.filter(a => {
          return a.appointment_date.split('T')[0] === today && a.status === 'scheduled';
        });
        document.getElementById('todaysAppointments').textContent = todaysAppointments.length;
      }
      
      if (bedsRes.ok) {
        const beds = await bedsRes.json();
        document.getElementById('availableBeds').textContent = beds.length;
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      showError('Failed to load dashboard data');
    }
  }
  
  async function loadRecentActivity() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const activity = await response.json();
        const tbody = document.querySelector('#recentActivity tbody');
        tbody.innerHTML = '';
        
        activity.slice(0, 10).forEach(log => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td>${log.action}</td>
            <td>${log.username || 'System'}</td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (err) {
      console.error('Error loading recent activity:', err);
    }
  }
  
  // Patient Management Functions
  async function loadPatients() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const patients = await response.json();
        const tbody = document.querySelector('#patientsTable tbody');
        tbody.innerHTML = '';
        
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.first_name} ${patient.last_name}</td>
            <td>${patient.phone}</td>
            <td>${patient.blood_type || 'N/A'}</td>
            <td class="action-btns">
              <button class="btn" onclick="editPatient(${patient.id})">Edit</button>
              <button class="btn btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
        
        // Setup search functionality
        document.getElementById('patientSearch').addEventListener('input', debounce(searchPatients, 300));
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      showError('Failed to load patients');
    }
  }
  
  function setupPatientModal() {
    const modal = document.getElementById('patientModal');
    const addBtn = document.getElementById('addPatientBtn');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('patientForm');
    
    addBtn.addEventListener('click', () => {
      document.getElementById('modalTitle').textContent = 'Add New Patient';
      form.reset();
      modal.style.display = 'flex';
    });
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const patientData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        bloodType: document.getElementById('bloodType').value,
        allergies: document.getElementById('allergies').value
      };
      
      try {
        const token = localStorage.getItem('token');
        const patientId = document.getElementById('patientId').value;
        let response;
        
        if (patientId) {
          // Update existing patient
          response = await fetch(`http://localhost:3000/api/admin/patients/${patientId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
          });
        } else {
          // Create new patient
          response = await fetch('http://localhost:3000/api/admin/patients', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
          });
        }
        
        if (response.ok) {
          modal.style.display = 'none';
          await loadPatients();
        } else {
          const error = await response.json();
          showError(error.message || 'Failed to save patient');
        }
      } catch (err) {
        console.error('Error saving patient:', err);
        showError('Failed to save patient');
      }
    });
  }
  
  async function editPatient(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/patients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const patient = await response.json();
        const modal = document.getElementById('patientModal');
        
        document.getElementById('modalTitle').textContent = 'Edit Patient';
        document.getElementById('patientId').value = patient.id;
        document.getElementById('firstName').value = patient.first_name;
        document.getElementById('lastName').value = patient.last_name;
        document.getElementById('dob').value = patient.dob.split('T')[0];
        document.getElementById('gender').value = patient.gender;
        document.getElementById('phone').value = patient.phone;
        document.getElementById('bloodType').value = patient.blood_type || '';
        document.getElementById('allergies').value = patient.allergies || '';
        
        modal.style.display = 'flex';
      }
    } catch (err) {
      console.error('Error editing patient:', err);
      showError('Failed to load patient data');
    }
  }
  
  async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadPatients();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to delete patient');
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      showError('Failed to delete patient');
    }
  }
  
  async function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.trim();
    if (!searchTerm) {
      await loadPatients();
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/patients/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const patients = await response.json();
        const tbody = document.querySelector('#patientsTable tbody');
        tbody.innerHTML = '';
        
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.first_name} ${patient.last_name}</td>
            <td>${patient.phone}</td>
            <td>${patient.blood_type || 'N/A'}</td>
            <td class="action-btns">
              <button class="btn" onclick="editPatient(${patient.id})">Edit</button>
              <button class="btn btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  }
  
  // Doctor Management Functions (similar pattern to patients)
  async function loadDoctors() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const doctors = await response.json();
        const tbody = document.querySelector('#doctorsTable tbody');
        tbody.innerHTML = '';
        
        doctors.forEach(doctor => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${doctor.id}</td>
            <td>Dr. ${doctor.first_name} ${doctor.last_name}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.is_active ? 'Active' : 'Inactive'}</td>
            <td class="action-btns">
              <button class="btn" onclick="editDoctor(${doctor.id})">Edit</button>
              <button class="btn ${doctor.is_active ? 'btn-warning' : 'btn-secondary'}" 
                      onclick="toggleDoctorStatus(${doctor.id}, ${!doctor.is_active})">
                ${doctor.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button class="btn btn-danger" onclick="deleteDoctor(${doctor.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
        
        document.getElementById('doctorSearch').addEventListener('input', debounce(searchDoctors, 300));
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
      showError('Failed to load doctors');
    }
  }
  
  function setupDoctorModal() {
    const modal = document.getElementById('doctorModal');
    const addBtn = document.getElementById('addDoctorBtn');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('doctorForm');
    
    addBtn.addEventListener('click', () => {
      document.getElementById('modalTitle').textContent = 'Add New Doctor';
      form.reset();
      modal.style.display = 'flex';
    });
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const doctorData = {
        firstName: document.getElementById('dFirstName').value,
        lastName: document.getElementById('dLastName').value,
        specialization: document.getElementById('specialization').value,
        licenseNumber: document.getElementById('licenseNumber').value,
        phone: document.getElementById('dPhone').value,
        email: document.getElementById('dEmail').value,
        isActive: document.getElementById('isActive').value === 'true'
      };
      
      try {
        const token = localStorage.getItem('token');
        const doctorId = document.getElementById('doctorId').value;
        let response;
        
        if (doctorId) {
          response = await fetch(`http://localhost:3000/api/admin/doctors/${doctorId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctorData)
          });
        } else {
          // For new doctors, we need to create a user account first
          const username = `dr.${doctorData.firstName.toLowerCase()}.${doctorData.lastName.toLowerCase()}`;
          const password = generateTempPassword();
          
          // Create user account
          const userResponse = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              username,
              password,
              role: 'doctor'
            })
          });
          
          if (!userResponse.ok) {
            throw new Error('Failed to create user account');
          }
          
          const userData = await userResponse.json();
          doctorData.userId = userData.userId;
          
          // Create doctor profile
          response = await fetch('http://localhost:3000/api/admin/doctors', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctorData)
          });
        }
        
        if (response.ok) {
          modal.style.display = 'none';
          await loadDoctors();
        } else {
          const error = await response.json();
          showError(error.message || 'Failed to save doctor');
        }
      } catch (err) {
        console.error('Error saving doctor:', err);
        showError('Failed to save doctor');
      }
    });
  }
  
  // Similar editDoctor, deleteDoctor, toggleDoctorStatus, searchDoctors functions
  // would follow the same pattern as the patient functions
  
  // Appointment Management Functions
  async function loadAppointments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const appointments = await response.json();
        const tbody = document.querySelector('#appointmentsTable tbody');
        tbody.innerHTML = '';
        
        appointments.forEach(appt => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${appt.id}</td>
            <td>${new Date(appt.appointment_date).toLocaleString()}</td>
            <td>${appt.patient_first_name} ${appt.patient_last_name}</td>
            <td>Dr. ${appt.doctor_first_name} ${appt.doctor_last_name}</td>
            <td>${appt.status}</td>
            <td class="action-btns">
              <button class="btn" onclick="editAppointment(${appt.id})">Edit</button>
              <button class="btn btn-danger" onclick="cancelAppointment(${appt.id})">Cancel</button>
            </td>
          `;
          tbody.appendChild(row);
        });
        
        // Setup filters
        document.getElementById('dateFilter').addEventListener('change', filterAppointments);
        document.getElementById('statusFilter').addEventListener('change', filterAppointments);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      showError('Failed to load appointments');
    }
  }
  
  function setupAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    const addBtn = document.getElementById('addAppointmentBtn');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('appointmentForm');
    
    addBtn.addEventListener('click', async () => {
      document.getElementById('modalTitle').textContent = 'Schedule Appointment';
      form.reset();
      
      // Load patients and doctors for dropdowns
      try {
        const token = localStorage.getItem('token');
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:3000/api/admin/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (patientsRes.ok && doctorsRes.ok) {
          const patients = await patientsRes.json();
          const doctors = await doctorsRes.json();
          
          const patientSelect = document.getElementById('appPatient');
          patientSelect.innerHTML = '<option value="">Select Patient</option>';
          patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.first_name} ${patient.last_name}`;
            patientSelect.appendChild(option);
          });
          
          const doctorSelect = document.getElementById('appDoctor');
          doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
          doctors.forEach(doctor => {
            if (doctor.is_active) {
              const option = document.createElement('option');
              option.value = doctor.id;
              option.textContent = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialization})`;
              doctorSelect.appendChild(option);
            }
          });
          
          modal.style.display = 'flex';
        }
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        showError('Failed to load required data');
      }
    });
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const appointmentData = {
        patientId: document.getElementById('appPatient').value,
        doctorId: document.getElementById('appDoctor').value,
        appointmentDate: document.getElementById('appDate').value,
        reason: document.getElementById('appReason').value,
        status: document.getElementById('appStatus').value
      };
      
      try {
        const token = localStorage.getItem('token');
        const appointmentId = document.getElementById('appointmentId').value;
        let response;
        
        if (appointmentId) {
          response = await fetch(`http://localhost:3000/api/admin/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
          });
        } else {
          response = await fetch('http://localhost:3000/api/admin/appointments', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
          });
        }
        
        if (response.ok) {
          modal.style.display = 'none';
          await loadAppointments();
        } else {
          const error = await response.json();
          showError(error.message || 'Failed to save appointment');
        }
      } catch (err) {
        console.error('Error saving appointment:', err);
        showError('Failed to save appointment');
      }
    });
  }
  
  // Pharmacy Management Functions
  async function loadMedicines() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const medicines = await response.json();
        const tbody = document.querySelector('#medicineTable tbody');
        tbody.innerHTML = '';
        
        medicines.forEach(medicine => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${medicine.id}</td>
            <td>${medicine.name}</td>
            <td>${medicine.quantity}</td>
            <td>$${medicine.price.toFixed(2)}</td>
            <td>${new Date(medicine.expiry_date).toLocaleDateString()}</td>
            <td class="action-btns">
              <button class="btn" onclick="editMedicine(${medicine.id})">Edit</button>
              <button class="btn btn-secondary" onclick="showStockModal(${medicine.id})">Stock</button>
              <button class="btn btn-danger" onclick="deleteMedicine(${medicine.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
        
        // Setup search and filters
        document.getElementById('medicineSearch').addEventListener('input', debounce(searchMedicines, 300));
        document.getElementById('expiryFilter').addEventListener('change', filterMedicines);
      }
    } catch (err) {
      console.error('Error loading medicines:', err);
      showError('Failed to load medicines');
    }
  }
  
  function setupMedicineModal() {
    const modal = document.getElementById('medicineModal');
    const addBtn = document.getElementById('addMedicineBtn');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('medicineForm');
    
    addBtn.addEventListener('click', () => {
      document.getElementById('modalTitle').textContent = 'Add New Medicine';
      form.reset();
      modal.style.display = 'flex';
    });
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const medicineData = {
        name: document.getElementById('medName').value,
        description: document.getElementById('medDescription').value,
        quantity: parseInt(document.getElementById('medQuantity').value),
        price: parseFloat(document.getElementById('medPrice').value),
        expiryDate: document.getElementById('medExpiry').value,
        supplier: document.getElementById('medSupplier').value
      };
      
      try {
        const token = localStorage.getItem('token');
        const medicineId = document.getElementById('medicineId').value;
        let response;
        
        if (medicineId) {
          response = await fetch(`http://localhost:3000/api/admin/medicines/${medicineId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
          });
        } else {
          response = await fetch('http://localhost:3000/api/admin/medicines', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
          });
        }
        
        if (response.ok) {
          modal.style.display = 'none';
          await loadMedicines();
        } else {
          const error = await response.json();
          showError(error.message || 'Failed to save medicine');
        }
      } catch (err) {
        console.error('Error saving medicine:', err);
        showError('Failed to save medicine');
      }
    });
  }
  
  function showStockModal(medicineId) {
    const modal = document.getElementById('stockModal');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('stockForm');
    
    document.getElementById('stockMedicineId').value = medicineId;
    modal.style.display = 'flex';
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const change = parseInt(document.getElementById('stockChange').value);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/admin/medicines/${medicineId}/stock`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: change })
        });
        
        if (response.ok) {
          modal.style.display = 'none';
          await loadMedicines();
        } else {
          const error = await response.json();
          showError(error.message || 'Failed to update stock');
        }
      } catch (err) {
        console.error('Error updating stock:', err);
        showError('Failed to update stock');
      }
    });
  }
  
  // Ward Management Functions
  async function loadWards() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/beds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const beds = await response.json();
        const tbody = document.querySelector('#bedsTable tbody');
        tbody.innerHTML = '';
        
        // Get unique wards for filter
        const wards = [...new Set(beds.map(bed => bed.ward_number))];
        const wardFilter = document.getElementById('wardFilter');
        wardFilter.innerHTML = '<option value="">All Wards</option>';
        wards.forEach(ward => {
          const option = document.createElement('option');
          option.value = ward;
          option.textContent = `Ward ${ward}`;
          wardFilter.appendChild(option);
        });
        
        beds.forEach(bed => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${bed.id}</td>
            <td>${bed.ward_number}</td>
            <td>${bed.bed_number}</td>
            <td>${bed.status}</td>
            <td>${bed.patient_first_name ? `${bed.patient_first_name} ${bed.patient_last_name}` : 'N/A'}</td>
            <td class="action-btns">
              ${bed.status === 'available' ? 
                `<button class="btn" onclick="showAssignModal(${bed.id})">Assign</button>` : 
                `<button class="btn btn-secondary" onclick="dischargePatient(${bed.id})">Discharge</button>`
              }
              <button class="btn btn-danger" onclick="deleteBed(${bed.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
        
        // Setup filters
        document.getElementById('wardFilter').addEventListener('change', filterBeds);
        document.getElementById('statusFilter').addEventListener('change', filterBeds);
      }
    } catch (err) {
      console.error('Error loading wards:', err);
      showError('Failed to load ward data');
    }
  }
  
  function setupWardModals() {
    // Add Bed Modal
    const addBedModal = document.getElementById('bedModal');
    const addBedBtn = document.getElementById('addBedBtn');
    const closeBedBtn = addBedModal.querySelector('.close-modal');
    const bedForm = document.getElementById('bedForm');
    
    addBedBtn.addEventListener('click', () => {
      bedForm.reset();
      addBedModal.style.display = 'flex';
    });
    
    closeBedBtn.addEventListener('click', () => {
      addBedModal.style.display = 'none';
    });
    
    bedForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const bedData = {
        wardNumber: document.getElementById('wardNumber').value,
        bedNumber: document.getElementById('bedNumber').value
      };
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/beds', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bedData)
        });
        
        if (response.ok) {
          addBedModal.style.display = 'none';
          await loadWards();
        } else {
          const error = await response.json();
          showError(error.message || 'Failed to add bed');
        }
      } catch (err) {
        console.error('Error adding bed:', err);
        showError('Failed to add bed');
      }
    });
    
    // Assign Patient Modal
    const assignModal = document.getElementById('assignModal');
    const closeAssignBtn = assignModal.querySelector('.close-modal');
    const assignForm = document.getElementById('assignForm');
    
    closeAssignBtn.addEventListener('click', () => {
      assignModal.style.display = 'none';
    });
    
    assignForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const bedId = document.getElementById('assignBedId').value;
      const patientId = document.getElementById('assignPatient').value;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/beds/assign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bedId, patientId })
        });
        
        if (response.ok) {
          assignModal.style.display = 'none';
          await loadWards();
        } else {
          const error = await response.json();
          showError(error.message || 'Failed to assign patient');
        }
      } catch (err) {
        console.error('Error assigning patient:', err);
        showError('Failed to assign patient');
      }
    });
  }
  
  async function showAssignModal(bedId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const patients = await response.json();
        const modal = document.getElementById('assignModal');
        const patientSelect = document.getElementById('assignPatient');
        
        patientSelect.innerHTML = '<option value="">Select Patient</option>';
        patients.forEach(patient => {
          const option = document.createElement('option');
          option.value = patient.id;
          option.textContent = `${patient.first_name} ${patient.last_name}`;
          patientSelect.appendChild(option);
        });
        
        document.getElementById('assignBedId').value = bedId;
        modal.style.display = 'flex';
      }
    } catch (err) {
      console.error('Error loading patients for assignment:', err);
      showError('Failed to load patient data');
    }
  }
  
  async function dischargePatient(bedId) {
    if (!confirm('Are you sure you want to discharge this patient?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/beds/${bedId}/discharge`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadWards();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to discharge patient');
      }
    } catch (err) {
      console.error('Error discharging patient:', err);
      showError('Failed to discharge patient');
    }
  }
  
  async function deleteBed(bedId) {
    if (!confirm('Are you sure you want to delete this bed?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/beds/${bedId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadWards();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to delete bed');
      }
    } catch (err) {
      console.error('Error deleting bed:', err);
      showError('Failed to delete bed');
    }
  }
  
  function filterBeds() {
    const wardFilter = document.getElementById('wardFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const rows = document.querySelectorAll('#bedsTable tbody tr');
    
    rows.forEach(row => {
      const ward = row.cells[1].textContent;
      const status = row.cells[3].textContent.toLowerCase();
      
      const wardMatch = !wardFilter || ward === wardFilter;
      const statusMatch = !statusFilter || status === statusFilter.toLowerCase();
      
      row.style.display = wardMatch && statusMatch ? '' : 'none';
    });
  }
  
  // Utility Functions
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
  
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  function generateTempPassword() {
    return Math.random().toString(36).slice(-8);
  }
  
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = '../auth/login.html';
  }
  
  // Make functions available globally for HTML onclick attributes
  window.editPatient = editPatient;
  window.deletePatient = deletePatient;
  window.editDoctor = editDoctor;
  window.toggleDoctorStatus = toggleDoctorStatus;
  window.deleteDoctor = deleteDoctor;
  window.editAppointment = editAppointment;
  window.cancelAppointment = cancelAppointment;
  window.editMedicine = editMedicine;
  window.deleteMedicine = deleteMedicine;
  window.showStockModal = showStockModal;
  window.showAssignModal = showAssignModal;
  window.dischargePatient = dischargePatient;
  window.deleteBed = deleteBed;



  async function editDoctor(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/doctors/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const doctor = await response.json();
        const modal = document.getElementById('doctorModal');
        
        document.getElementById('modalTitle').textContent = 'Edit Doctor';
        document.getElementById('doctorId').value = doctor.id;
        document.getElementById('dFirstName').value = doctor.first_name;
        document.getElementById('dLastName').value = doctor.last_name;
        document.getElementById('specialization').value = doctor.specialization;
        document.getElementById('licenseNumber').value = doctor.license_number;
        document.getElementById('dPhone').value = doctor.phone;
        document.getElementById('dEmail').value = doctor.email;
        document.getElementById('isActive').value = doctor.is_active ? 'true' : 'false';
        
        modal.style.display = 'flex';
      }
    } catch (err) {
      console.error('Error editing doctor:', err);
      showError('Failed to load doctor data');
    }
  }
  
  async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor? This will also delete their user account.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadDoctors();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to delete doctor');
      }
    } catch (err) {
      console.error('Error deleting doctor:', err);
      showError('Failed to delete doctor');
    }
  }
  
  async function toggleDoctorStatus(id, activate) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/doctors/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: activate })
      });
      
      if (response.ok) {
        await loadDoctors();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to update doctor status');
      }
    } catch (err) {
      console.error('Error toggling doctor status:', err);
      showError('Failed to update doctor status');
    }
  }
  
  async function searchDoctors() {
    const searchTerm = document.getElementById('doctorSearch').value.trim();
    if (!searchTerm) {
      await loadDoctors();
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/doctors/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const doctors = await response.json();
        const tbody = document.querySelector('#doctorsTable tbody');
        tbody.innerHTML = '';
        
        doctors.forEach(doctor => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${doctor.id}</td>
            <td>Dr. ${doctor.first_name} ${doctor.last_name}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.is_active ? 'Active' : 'Inactive'}</td>
            <td class="action-btns">
              <button class="btn" onclick="editDoctor(${doctor.id})">Edit</button>
              <button class="btn ${doctor.is_active ? 'btn-warning' : 'btn-secondary'}" 
                      onclick="toggleDoctorStatus(${doctor.id}, ${!doctor.is_active})">
                ${doctor.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button class="btn btn-danger" onclick="deleteDoctor(${doctor.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (err) {
      console.error('Error searching doctors:', err);
    }
  }
  
  // ======================== PATIENT FUNCTIONS ========================
  
  async function loadPatients() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const patients = await response.json();
        const tbody = document.querySelector('#patientsTable tbody');
        tbody.innerHTML = '';
        
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.first_name} ${patient.last_name}</td>
            <td>${patient.phone}</td>
            <td>${patient.blood_type || 'N/A'}</td>
            <td class="action-btns">
              <button class="btn" onclick="editPatient(${patient.id})">Edit</button>
              <button class="btn btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
        
        document.getElementById('patientSearch').addEventListener('input', debounce(searchPatients, 300));
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      showError('Failed to load patients');
    }
  }
  
  async function editPatient(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/patients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const patient = await response.json();
        const modal = document.getElementById('patientModal');
        
        document.getElementById('modalTitle').textContent = 'Edit Patient';
        document.getElementById('patientId').value = patient.id;
        document.getElementById('firstName').value = patient.first_name;
        document.getElementById('lastName').value = patient.last_name;
        document.getElementById('dob').value = patient.dob.split('T')[0];
        document.getElementById('gender').value = patient.gender;
        document.getElementById('phone').value = patient.phone;
        document.getElementById('bloodType').value = patient.blood_type || '';
        document.getElementById('allergies').value = patient.allergies || '';
        
        modal.style.display = 'flex';
      }
    } catch (err) {
      console.error('Error editing patient:', err);
      showError('Failed to load patient data');
    }
  }
  
  async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadPatients();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to delete patient');
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      showError('Failed to delete patient');
    }
  }
  
  async function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.trim();
    if (!searchTerm) {
      await loadPatients();
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/patients/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const patients = await response.json();
        const tbody = document.querySelector('#patientsTable tbody');
        tbody.innerHTML = '';
        
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.first_name} ${patient.last_name}</td>
            <td>${patient.phone}</td>
            <td>${patient.blood_type || 'N/A'}</td>
            <td class="action-btns">
              <button class="btn" onclick="editPatient(${patient.id})">Edit</button>
              <button class="btn btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  }
  
  // ======================== UTILITY FUNCTIONS ========================
  
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
  
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = '../auth/login.html';
  }
  
  // Make functions available globally for HTML onclick attributes
  window.editPatient = editPatient;
  window.deletePatient = deletePatient;
  window.editDoctor = editDoctor;
  window.toggleDoctorStatus = toggleDoctorStatus;
  window.deleteDoctor = deleteDoctor;
  window.searchDoctors = searchDoctors;