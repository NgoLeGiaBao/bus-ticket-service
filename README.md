# Bus Ticket Booking System

## Overview
A **Service-Oriented Architecture (SOA)** solution for managing bus ticket bookings, composed of modular backend services and a React frontend.

### Repository Structure
```plaintext
back-end-bus-ticket-service/
├── booking-and-payment-service/  # C# service for tickets/payments
├── route-trip-management-service/  # Node.js service for routes/schedules
├── staff-dispatch-service/  # FastAPI service for driver assignments
├── user-management-service/  # C# service for user profiles/auth
├── kong/  # API Gateway configuration
├── keys/  # Security certificates
├── docker-compose.yml  # Container orchestration

front-end-bus-ticket-service/
├── src/  # React application
├── tailwind.config.cjs  # CSS framework
└── vite.config.js  # Frontend build tool
```

### Technology Stack
| Component               | Technology          |
|-------------------------|---------------------|
| Frontend                | React + Tailwind CSS|
| API Gateway             | Kong                |
| User Management         | C#                  |
| Booking & Payment       | C#                  |  
| Route/Trip Management   | Node.js             |
| Staff Dispatch          | FastAPI (Python)    |
| Database                | PostgreSQL          |
| Authentication          | Role-based (No 2FA) |

## Core Services

### 1. User Management (C#)
- User registration/profile management  
- Role-based access control (Admin/Driver/Passenger)

### 2. Staff Dispatch (FastAPI)
- Driver assignment to routes/trips  
- Staff availability monitoring

### 3. Route & Trip Management (Node.js)
- Bus route configuration (origin/destination)  
- Trip scheduling and status tracking

### 4. Booking & Payment (C#)
- Seat reservation system  
- Payment gateway integration  
- Booking confirmation generation

### 5. API Gateway (Kong)
- Unified API entry point  
- Request routing & load balancing  
- Rate limiting and security

## Deployment

### Prerequisites
- Docker + Docker Compose
- PostgreSQL database
- Kong API Gateway

### Quick Start (Backend)

1. Clone the repository:
    ```bash
    git clone https://github.com/NgoLeGiaBao/bus-ticket-service
    ```

2. Navigate to the backend directory:
    ```bash
    cd bus-ticket-service/back-end-bus-ticket-service
    ```

3. Start the backend services using Docker Compose:
    ```bash
    docker-compose up -d
    ```

### Quick Start (Frontend)

1. Navigate to the frontend directory:
    ```bash
    cd bus-ticket-service/front-end-bus-ticket-service
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the development server:
    ```bash
    npm run dev
    ```

4. Open your browser and go to `http://localhost:3000` to see the frontend in action.

**Note:** Ensure the backend services are up and running before starting the frontend. The frontend communicates with the backend through the API Gateway (Kong).