# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

user workflow

*Session: c80566ea792027ced15d720ff7434f00 | Generated: 7/7/2025, 10:30:10 AM*

### Analysis Summary

# User Workflow Report

This report outlines the primary user workflows within the application, detailing the interaction between frontend components and backend API routes. The application follows a Next.js architecture, utilizing React components for the user interface and API routes for backend logic and data persistence.

## High-Level Architecture

The application is structured around a client-server model. The frontend, built with **Next.js** and **React**, provides the user interface and interacts with the backend through **API routes**. These API routes, also part of the Next.js application, handle business logic, data validation, and interaction with the database. Shared UI elements are encapsulated in [components](src/components/), while global state management is handled via [contexts](src/contexts/). Utility functions for authentication and database operations are located in the [lib](src/lib/) directory.

*   **Purpose**: To provide a comprehensive system for managing business operations, including sales, purchases, inventory, customer, and supplier management, with additional features like reporting and a chatbot.
*   **Internal Parts**:
    *   **Frontend Pages**: Located in [src/app/](src/app/), these define the various views and user interfaces.
    *   **API Routes**: Located in [src/app/api/](src/app/api/), these handle backend logic and data operations.
    *   **Components**: Reusable UI elements in [src/components/](src/components/).
    *   **Contexts**: Global state management in [src/contexts/](src/contexts/).
    *   **Libraries**: Utility functions in [src/lib/](src/lib/).
*   **External Relationships**: The frontend communicates with the backend API routes via HTTP requests. The API routes interact with a database (details of which are abstracted by [database.ts](src/lib/database.ts)).

## Authentication Workflow

The authentication workflow manages user access to the application, encompassing registration, login, and session management.

### User Registration

*   **Purpose**: Allows new users to create an account and gain access to the system.
*   **Internal Parts**:
    *   **Frontend**: The [Register Page](src/app/register/page.tsx) provides the user interface for inputting registration details.
    *   **Backend**: The [Register API Route](src/app/api/auth/register/route.ts) receives user data, validates it, and creates a new user record in the database.
*   **External Relationships**: The [Register Page](src/app/register/page.tsx) sends a POST request to the [Register API Route](src/app/api/auth/register/route.ts).

### User Login

*   **Purpose**: Enables registered users to sign in and access protected areas of the application.
*   **Internal Parts**:
    *   **Frontend**: The [Login Page](src/app/login/page.tsx) handles user credential input.
    *   **Backend**: The [Login API Route](src/app/api/auth/login/route.ts) authenticates user credentials and issues an authentication token or session.
    *   **Context**: The [AuthContext](src/contexts/AuthContext.tsx) manages the authentication state across the application.
    *   **Protection**: The [ProtectedRoute](src/components/auth/ProtectedRoute.tsx) component ensures that only authenticated users can access certain pages.
*   **External Relationships**: The [Login Page](src/app/login/page.tsx) sends a POST request to the [Login API Route](src/app/api/auth/login/route.ts). Upon successful login, the [AuthContext](src/contexts/AuthContext.tsx) is updated, and the user is redirected to the dashboard or a protected route. The [Me API Route](src/app/api/auth/me/route.ts) can be used to retrieve information about the currently authenticated user.

## Data Management Workflows

The application provides dedicated workflows for managing various business entities, including customers, products, sales, purchases, and suppliers. These workflows generally follow a similar pattern: a frontend page for displaying and interacting with data, and corresponding API routes for CRUD (Create, Read, Update, Delete) operations.

### Customer Management

*   **Purpose**: To view, add, edit, and delete customer records.
*   **Internal Parts**:
    *   **Frontend**: The [Customers Page](src/app/customers/page.tsx) displays a list of customers and provides an interface for managing them.
    *   **Backend**: The [Customers API Route](src/app/api/customers/route.ts) handles requests for all customers (GET, POST), while the [Specific Customer API Route](src/app/api/customers/[id]/route.ts) handles requests for individual customers (GET, PUT, DELETE).
*   **External Relationships**: The [Customers Page](src/app/customers/page.tsx) makes HTTP requests to the [Customers API Route](src/app/api/customers/route.ts) and [Specific Customer API Route](src/app/api/customers/[id]/route.ts) to perform customer-related operations.

### Product Management

*   **Purpose**: To manage product inventory, including adding new products, updating existing ones, and removing discontinued items.
*   **Internal Parts**:
    *   **Frontend**: The [Inventory Page](src/app/inventory/page.tsx) serves as the interface for product management.
    *   **Backend**: The [Products API Route](src/app/api/products/route.ts) manages collections of products, and the [Specific Product API Route](src/app/api/products/[id]/route.ts) handles individual product operations.
*   **External Relationships**: The [Inventory Page](src/app/inventory/page.tsx) interacts with the [Products API Route](src/app/api/products/route.ts) and [Specific Product API Route](src/app/api/products/[id]/route.ts).

### Sales Management

*   **Purpose**: To record and track sales transactions.
*   **Internal Parts**:
    *   **Frontend**: The [Sales Page](src/app/sales/page.tsx) provides the interface for sales entry and viewing.
    *   **Backend**: The [Sales API Route](src/app/api/sales/route.ts) handles sales collection, and the [Specific Sale API Route](src/app/api/sales/[id]/route.ts) manages individual sales records.
*   **External Relationships**: The [Sales Page](src/app/sales/page.tsx) communicates with the [Sales API Route](src/app/api/sales/route.ts) and [Specific Sale API Route](src/app/api/sales/[id]/route.ts).

### Purchases Management

*   **Purpose**: To record and track purchase transactions from suppliers.
*   **Internal Parts**:
    *   **Frontend**: The [Purchases Page](src/app/purchases/page.tsx) is used for managing purchase records.
    *   **Backend**: The [Purchases API Route](src/app/api/purchases/route.ts) handles purchase collections, and the [Specific Purchase API Route](src/app/api/purchases/[id]/route.ts) manages individual purchase records.
*   **External Relationships**: The [Purchases Page](src/app/purchases/page.tsx) interacts with the [Purchases API Route](src/app/api/purchases/route.ts) and [Specific Purchase API Route](src/app/api/purchases/[id]/route.ts).

### Supplier Management

*   **Purpose**: To manage supplier information.
*   **Internal Parts**:
    *   **Frontend**: The [Suppliers Page](src/app/suppliers/page.tsx) provides the interface for managing supplier details.
    *   **Backend**: The [Suppliers API Route](src/app/api/suppliers/route.ts) handles supplier collections, and the [Specific Supplier API Route](src/app/api/suppliers/[id]/route.ts) manages individual supplier records.
*   **External Relationships**: The [Suppliers Page](src/app/suppliers/page.tsx) communicates with the [Suppliers API Route](src/app/api/suppliers/route.ts) and [Specific Supplier API Route](src/app/api/suppliers/[id]/route.ts).

## Chatbot Interaction Workflow

*   **Purpose**: To allow users to interact with an AI chatbot for assistance or information.
*   **Internal Parts**:
    *   **Frontend**: The [Chatbot Page](src/app/chatbot/page.tsx) provides the chat interface.
    *   **Backend**: The [Chatbot API Route](src/app/api/chatbot/route.ts) processes user queries and interacts with the chatbot service.
*   **External Relationships**: The [Chatbot Page](src/app/chatbot/page.tsx) sends user messages to the [Chatbot API Route](src/app/api/chatbot/route.ts) and displays the chatbot's responses.

## Reporting Workflow

*   **Purpose**: To generate and view various reports based on the application's data.
*   **Internal Parts**:
    *   **Frontend**: The [Reports Page](src/app/reports/page.tsx) provides options for report generation and display.
*   **External Relationships**: The [Reports Page](src/app/reports/page.tsx) likely fetches data from various API routes (e.g., sales, purchases, customers) to compile reports.

## Shared Components and Utilities

Several components and utility functions support these workflows:

*   **UI Components**: The [src/components/ui/](src/components/ui/) directory contains a collection of reusable UI components (e.g., [button.tsx](src/components/ui/button.tsx), [input.tsx](src/components/ui/input.tsx), [table.tsx](src/components/ui/table.tsx)) that are used across different pages to maintain a consistent look and feel.
*   **Layout Components**: The [src/components/layout/](src/components/layout/) directory provides structural components like [AppLayout.tsx](src/components/layout/AppLayout.tsx), [Header.tsx](src/components/layout/Header.tsx), and [Sidebar.tsx](src/components/layout/Sidebar.tsx) to define the overall application layout.
*   **Utility Functions**: The [src/lib/](src/lib/) directory contains helper functions such as [auth.ts](src/lib/auth.ts) for authentication-related tasks and [database.ts](src/lib/database.ts) for database interactions, which are utilized by both frontend and backend components.
*   **Global Styles**: [globals.css](src/app/globals.css) defines global styles for the application.
*   **Root Layout**: [layout.tsx](src/app/layout.tsx) defines the root layout for the Next.js application.
*   **Home Page**: [page.tsx](src/app/page.tsx) is the main entry point for the application.
*   **Alerts Page**: [alerts/page.tsx](src/app/alerts/page.tsx) is likely used for displaying system alerts or notifications.
*   **Settings Page**: [settings/page.tsx](src/app/settings/page.tsx) and [settings/route.ts](src/app/api/settings/route.ts) are for managing application settings.
*   **Search API**: [search/route.ts](src/app/api/search/route.ts) provides a general search functionality.
*   **Database Initialization**: [init-db/route.ts](src/app/api/init-db/route.ts) is likely used for initializing the database.
*   **Tutorial Page**: [tutorial/page.tsx](src/app/tutorial/page.tsx) provides guidance or instructions to the user.

