# MVP-1: Leave Management System (Backend)

This document outlines the core backend architecture and API features included in the first release (MVP-1) of the HR Management System. This release focuses on robust data modeling, API development, and secure Role-Based Access Control (RBAC) enforcement.

---

### 💻 Backend Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | **Node.js** | High-performance JavaScript runtime for building scalable server-side applications. |
| **ORM** | **Sequelize** | Promise-based Node.js ORM for PostgreSQL and other SQL databases. |
| **Database** | **PostgreSQL** | Primary relational database used for persistence, chosen for reliability and advanced features. |
| **Architecture** | **Multi-Tenancy** | Utilizes **Schema-Based Multi-Tenancy** to logically isolate client data within the same database instance. |

---

### ✨ Core Backend Features & APIs

The backend is responsible for implementing the business logic and providing APIs for all frontend requirements:

| Feature Area | Key Functionality | API Coverage |
| :--- | :--- | :--- |
| **1. 👤 User Management** | CRUD operations and Role Assignment. | Dedicated **RESTful APIs** for creating, reading, updating, deleting (CRUD) users, and endpoints for assigning roles. |
| **2. 🔐 Role Management** | CRUD for Roles and Permissions. | APIs to create and manage roles (e.g., Admin, Manager) and tie them to granular permissions. |
| **3. 📝 Leave Request Management** | Request Submission and State Transitions. | Endpoints for employees to **submit** new requests and for managers/admins to perform **recommend, approval, or rejection** actions. Handles state transition logic. |
| **4. 📂 Leave Type Management** | CRUD for Leave Types. | APIs to create, retrieve, update, and toggle the activation status of various leave categories (e.g., Sick, Casual, Paid). |
| **5. ✔️ Leave Approval Workflow** | Approval Logic and Status Updates. | Logic implemented in services to ensure the **Employee → Manager → Admin** approval flow is strictly followed via sequential status updates. |
---