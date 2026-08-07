# HELIOS Backend

HELIOS is an AI-Native Autonomous Network Operating System built using a microservice architecture. 

This repository contains Phase 1 of the backend implementation.

## Project Structure

```
backend/
├── app/
│   ├── api/          # API routers and endpoints
│   ├── core/         # Core config, exceptions, logging
│   ├── database/     # Database connection and session
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas for request/response
│   ├── services/     # Business logic
│   ├── websocket/    # WebSocket handlers
│   ├── utils/        # Utility functions
│   ├── config.py     # Application configuration
│   └── main.py       # FastAPI application entry point
├── tests/            # Unit and integration tests
├── requirements.txt  # Python dependencies
├── .env.example      # Example environment variables
└── Dockerfile        # Docker build instructions
```

## How to Install

1. Ensure you have Python 3.12+ installed.
2. Clone the repository and navigate to the `backend` directory.
3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## How to Run Locally

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your local PostgreSQL credentials.
3. Run the application using Uvicorn:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
4. The API documentation will be available at `http://127.0.0.1:8000/docs`.

## Docker Usage

To build and run the application using Docker:

1. Build the image:
   ```bash
   docker build -t helios-backend .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8000:8000 --env-file .env --name helios-backend-instance helios-backend
   ```
