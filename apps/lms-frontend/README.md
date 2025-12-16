# MVP-1: Leave Management System

This document outlines the core features included in the first release (MVP-1) of the HR Management System. This release focuses on foundational User, Role, and Leave Management capabilities, enforced by a robust Role-Based Access Control (RBAC) system.

---

### ✨ Core System Capabilities

| Feature Area | Key Functionality | Description |
| :--- | :--- | :--- |
| **👤 User Management** | Create, Edit, Delete Users & Assign Roles | View all users in an organized dashboard with improved filtering and searching UX. |
| **🔐 Role Management** | Create and Manage Custom Roles (Admin, Manager, Employee) | Assign permissions tied to user actions; UI fully adapts based on assigned role. |
| **📝 Leave Request Management** | Create, Review, Approve, or Reject Requests | Employees can create requests; Managers/Admins can action them. Features automatic state updates and full history view. |
| **📂 Leave Type Management** | Create, Activate, Deactivate Leave Categories | Manage various leave types (Sick Leave, Casual Leave, Paid Leave). |
| **✔️ Leave Approval Workflow** | Role-Based Flow (Employee → Manager → Admin) | Provides notifications, status badges on UI, and consistent updates across all views. |
| **🛡️ Role-Based Access Control (RBAC)** | Permission-Driven Access | Every module and action is permission-driven. Unauthorized users cannot access restricted screens; UI renders dynamically. |

---

