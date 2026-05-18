# Hospital Management System (HMS)

A comprehensive web-based Hospital Management System designed to streamline hospital operations, manage patient records, doctor schedules, and facilitate communication between patients, doctors, and administrators.

## 🚀 Features

### 👤 Patient Portal
- **Self Registration & Login**: Patients can create their accounts and securely log in.
- **Profile Management**: Update personal information, contact details, and blood group.
- **Appointment Booking**: Search for active doctors and book appointments for specific dates and times.
- **Medical Records**: View historical medical records, diagnoses, and prescriptions provided by doctors.
- **Secure Messaging**: Communicate directly with assigned doctors or hospital administrators.
- **Bed Status**: View current admission status and bed assignments.

### 👨‍⚕️ Doctor Portal
- **Dashboard**: Overview of upcoming appointments and total patient count.
- **Appointment Management**: View and update the status of scheduled appointments (Scheduled/Completed/Cancelled).
- **Patient Records**: Access detailed information of patients who have booked appointments.
- **Digital Prescriptions**: Create and manage medical records, including diagnosis, treatment, and prescriptions.
- **Messaging**: Exchange messages with patients and administrators.

### 🔑 Admin Portal
- **Comprehensive Dashboard**: Real-time statistics on total patients, active doctors, scheduled appointments, and bed occupancy.
- **Doctor Management**: Register new doctors, manage their active status, or remove records.
- **Patient Management**: Complete overview of all registered patients and their medical history.
- **Bed/Ward Management**: Track bed availability, assign beds to patients during admission, and manage discharges.
- **Pharmacy/Medicine Inventory**: Manage hospital medicine stock, including quantity, price, expiry dates, and supplier info.
- **System-wide Messaging**: Communicate with any doctor or patient in the system.

## 🛠️ Technical Stack

- **Frontend**: 
  - [EJS](https://ejs.co/) (Embedded JavaScript templates) for dynamic server-side rendering.
  - CSS3 for responsive and custom styling.
  - JavaScript (Vanilla JS) for client-side interactions.
- **Backend**: 
  - [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) framework.
  - [Express Session](https://www.npmjs.com/package/express-session) for secure user authentication and session management.
- **Database**: 
  - [MySQL](https://www.mysql.com/) for relational data storage.
  - `mysql2` library with Promise support for database operations.
- **Environment**: 
  - `dotenv` for environment variable management.

## 📂 Project Structure

```text
HMS/
└── hospital-management/
    ├── public/            # Static assets (CSS, JS, Images)
    ├── views/             # EJS templates
    │   ├── admin/         # Admin-specific pages
    │   ├── auth/          # Login and Registration pages
    │   ├── doctor/        # Doctor-specific pages
    │   ├── partials/      # Reusable UI components (header, footer, etc.)
    │   └── patient/       # Patient-specific pages
    ├── server.js          # Main Express server and API routes
    ├── package.json       # Project dependencies and scripts
    └── .env               # Configuration for DB and Port
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js installed on your machine.
- MySQL Server running.

### Database Setup
1. Create a MySQL database named `hospital_management`.
2. Import the database schema (Make sure to have tables: `admins`, `doctors`, `patients`, `appointments`, `medical_records`, `beds`, `medicines`, `messages`).

### Installation
1. Clone the repository or extract the files.
2. Navigate to the project directory:
   ```bash
   cd HMS/hospital-management
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and add your database credentials:
   ```env
   DB_HOST=localhost
  DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=hospital_management
  SESSION_SECRET=your_session_secret
   PORT=3000
   ```
5. Start the server:
   ```bash
   node server.js
   ```
6. Open your browser and visit `http://localhost:3000`.

## 🛡️ Security Note
*Note: This project currently uses plain-text password storage for demonstration purposes. For a production environment, it is highly recommended to implement password hashing using libraries like `bcrypt`.*
