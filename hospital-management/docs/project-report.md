# Hospital Management System (HMS) - Detailed Project Report

## 1. Executive Summary

This project is a full-stack, server-rendered hospital management platform built with Node.js, Express, EJS, and MySQL. It supports three user roles (admin, doctor, patient) and covers core hospital workflows: authentication, patient and doctor management, appointments, medical records, bed allocation, medicine inventory, and internal messaging.

The application is functionally rich for a single-server codebase and demonstrates a complete end-to-end workflow. However, there are significant production-readiness issues, especially around authentication security, route-level access control, and maintainability due to a monolithic server file.

## 2. Scope and Size

- Backend routes in server.js: 50
- Backend file size (server.js): 996 lines
- EJS templates: 30
- Frontend script size (public/js/main.js): 585 lines
- Styling: single global stylesheet (public/css/style.css)

Interpretation:
- Feature coverage is broad.
- Operational complexity is moderate to high for a single-file backend architecture.
- Maintainability risk increases as new modules are added without refactoring.

## 3. Technology Stack

- Runtime: Node.js
- Web framework: Express 5
- Templating: EJS
- Database: MySQL via mysql2/promise
- Session/Auth: express-session + cookie-parser
- Parsing: body-parser
- Frontend: Vanilla JavaScript + CSS + Font Awesome

## 4. Functional Coverage by Role

### 4.1 Public / Landing

- Branded homepage with services and feature overview.
- Entry points for login and patient registration.

### 4.2 Patient Portal

- Self-registration and login.
- Profile management.
- Password change flow.
- Book/cancel appointments.
- View doctors and medical records.
- Messaging with doctor/admin.
- Bed/admission status visibility on dashboard.

### 4.3 Doctor Portal

- Dashboard metrics and same-day appointments.
- Appointment status updates.
- Patient list based on appointment relationships.
- Patient detail view and medical record creation.
- Messaging with patients/admin.

### 4.4 Admin Portal

- Dashboard counts (patients, active doctors, scheduled appointments, occupied beds).
- Patient and doctor management (view, status toggle, delete).
- Doctor registration.
- Appointment listing.
- Bed assignment and discharge workflow.
- Medicine inventory CRUD (add/list/delete).
- System messaging.

## 5. Architecture and Design Assessment

### 5.1 Backend Structure

Current state:
- All routing and business logic is centralized in server.js.

Strengths:
- Easy to run and understand for small teams.
- Fast iteration for early-stage prototype.


### 5.2 Data Access

- Uses mysql2 with prepared placeholders (?) which reduces SQL injection risk in most statements.
- Query logic is embedded in route handlers rather than abstracted.

### 5.3 Frontend

- Role-specific layouts and navigation are clear.
- UI is cohesive and modern enough for MVP use.
- Global JS handles validation, sidebar interactions, scrolling, and toast notifications.

Risk:
- Shared global behavior may become brittle as view complexity grows.

## 6. Strengths

- Full role-based healthcare workflow in one project.
- Good feature breadth for an MVP.
- Clean SQL placeholder usage in most queries.
- Practical dashboard and data management views.
- Messaging system integrated across all role pairs.


## 7. Final Assessment

Overall project maturity: Functional MVP with strong domain coverage, but not production-ready yet.

- Product capability: High for an MVP.
- Security posture: Low (needs immediate hardening).
- Maintainability: Moderate to low due to monolithic backend.
- Scalability readiness: Moderate after refactor and security remediation.
