## 1. Project Overview

The Hospital Management System (HMS) is a web-based full-stack application designed to digitize and streamline core hospital operations. It supports three role-based user groups: admin, doctor, and patient. The system centralizes patient care workflows such as appointment scheduling, medical record management, bed allocation, medicine inventory, and secure internal messaging.

The application is built as a server-rendered platform using Node.js, Express, EJS, and MySQL.

## 2. Problem Statement

Traditional hospital workflows often involve fragmented records, manual scheduling, and delayed communication between staff and patients. This project addresses these gaps by providing:

- Centralized data access for hospital operations.
- Role-based dashboards and process control.
- Digital records and communication channels.
- Faster decision-making through real-time operational visibility.

## 3. Objectives

- Build a unified management system for hospital stakeholders.
- Enable secure role-based access and workflows.
- Improve patient experience through self-service features.
- Digitize doctor-patient interactions and records.
- Provide admins with operational control over staff, beds, and medicines.

## 4. Core Modules

### 4.1 Authentication and Authorization

- Login for admin, doctor, and patient roles.
- Patient self-registration.
- Session-based access control for protected routes.

### 4.2 Admin Module

- Dashboard with KPIs (patients, active doctors, appointments, occupied beds).
- Doctor management (register, activate/deactivate, delete, profile view).
- Patient management and detailed patient view.
- Appointment monitoring.
- Bed assignment and discharge handling.
- Medicine inventory management.
- System-wide messaging.

### 4.3 Doctor Module

- Dashboard with personal appointment and patient metrics.
- Appointment status management.
- Patient listing based on consultation relationships.
- Medical record creation and review.
- Messaging with patients and admin.

### 4.4 Patient Module

- Profile management.
- Password change.
- Appointment booking and cancellation.
- Doctor directory access.
- Medical record viewing.
- Messaging with doctors and admin.
- Admission/bed visibility.

## 5. Technology Stack

- Frontend: EJS templates, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- Database: MySQL with mysql2/promise
- Session Management: express-session
- Environment Configuration: dotenv

## 6. Key Strengths

- End-to-end hospital workflow support in one platform.
- Clear role-based module separation in the UI.
- Practical dashboards and operational screens.
- Real-world healthcare entities represented: appointments, records, beds, medicines, messages.

## 7. Current Limitations

- Passwords are handled in plain text and need hashing.
- Critical credentials/session values are hardcoded in server logic.
- Backend is monolithic (single large server file), reducing maintainability.
- No automated tests or CI safeguards yet.
- Some route-level security checks need tightening for message endpoints.

## 8. Expected Outcomes

After hardening and modular refactor, the project can serve as:

- A robust academic full-stack healthcare solution.
- A staging-ready prototype for small-to-medium hospital workflows.
- A foundation for enterprise enhancements such as analytics, notifications, billing, and EMR integrations.

## 9. Future Scope

- Password hashing and stronger authentication controls.
- CSRF/rate-limit protections.
- API and service-layer modularization.
- Automated testing and CI pipeline.
- Audit logs, reporting dashboards, and alerting.
- Mobile-first enhancement and PWA support.

## 10. Conclusion

The HMS project successfully demonstrates a comprehensive role-based hospital operations platform with substantial functional coverage. It is a strong MVP and learning-grade production prototype. With targeted security, testing, and architecture improvements, it can evolve into a reliable and scalable real-world system.
