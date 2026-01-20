# Hospital Management System

A comprehensive hospital management system built with Node.js, Express, MySQL, and modern web technologies.

## Features

### Admin Features
- Patient Management (CRUD operations)
- Doctor Management
- Appointment Management
- Pharmacy & Inventory Management
- Ward/Bed Management
- System & Messaging

### Doctor Features
- Patient Records Access
- Appointment Management
- Medical Notes
- Profile Management
- Messaging

### Patient Features
- Account Management
- Appointment Booking
- Medical Records View
- Messaging

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hospital-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a MySQL database:
```sql
CREATE DATABASE hospital_management;
```

4. Import the database schema:
```bash
mysql -u your_username -p hospital_management < database.sql
```

5. Configure environment variables:
Create a `.env` file in the root directory with the following content:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=hospital_management
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

6. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Project Structure

```
hospital-management-system/
├── config/             # Configuration files
├── middleware/         # Custom middleware
├── public/            # Frontend files
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript files
│   └── index.html    # Main HTML file
├── routes/            # API routes
├── .env              # Environment variables
├── database.sql      # Database schema
├── package.json      # Project dependencies
├── README.md         # Project documentation
└── server.js         # Main server file
```

## API Documentation

### Authentication
- POST /api/auth/login
- POST /api/auth/register

### Patient Management
- GET /api/patients
- POST /api/patients
- PUT /api/patients/:id
- DELETE /api/patients/:id

### Doctor Management
- GET /api/doctors
- POST /api/doctors
- PUT /api/doctors/:id
- DELETE /api/doctors/:id

### Appointments
- GET /api/appointments
- POST /api/appointments
- PUT /api/appointments/:id
- DELETE /api/appointments/:id

### Pharmacy
- GET /api/medicines
- POST /api/medicines
- PUT /api/medicines/:id
- DELETE /api/medicines/:id

### Wards/Beds
- GET /api/wards
- POST /api/wards
- PUT /api/wards/:id
- DELETE /api/wards/:id

## Security

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation
- SQL injection prevention

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 