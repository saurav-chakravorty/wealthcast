# Financial Scenario Analyzer

This application is a financial scenario analyzer that uses Monte Carlo simulations to project potential outcomes based on user-defined inputs. It features a Python FastAPI backend and a React frontend.

## Project Overview

Users can input:
- Current corpus (initial investment amount)
- Investment strategy (debt to equity ratio)
- Expected returns (for different asset classes)
- Standard deviation of returns (volatility of asset classes)

The application will then:
- Generate multiple financial scenarios using Monte Carlo simulation.
- Display the results as a chart, showing the range of potential portfolio values over time.

## Prerequisites

- Node.js and npm (for the frontend)
- Python 3.8+ and UV (for the backend)

## Setup and Running the Application

### Backend (FastAPI)

1.  **Navigate to the project root directory.**
2.  **Create and activate a Python virtual environment using UV:**
    ```bash
    uv venv .venv
    source .venv/bin/activate
    ```
    *(If you have already created a virtual environment and installed dependencies as per earlier steps, you can skip to step 4)*
3.  **Install Python dependencies:**
    ```bash
    uv pip install fastapi uvicorn
    ```
4.  **Run the backend server:**
    Navigate to the project root directory (if not already there) and run:
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```
    The backend will be accessible at `http://localhost:8000`.

### Frontend (React + Vite)

1.  **Navigate to the project root directory.**
2.  **Install frontend dependencies (if not already done):**
    ```bash
    npm install
    ```
3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will be accessible at `http://localhost:5173` (or another port if 5173 is busy - check your terminal output).

### Docker Compose

The project includes a `docker-compose.yml` file to simplify running both the
backend and frontend using Docker. Build and start the containers with:

```bash
docker compose up --build
```

This will expose the backend at `http://localhost:8000` and the frontend at
`http://localhost:5173`.

## Project Structure

```
/
├── backend/                # FastAPI backend code
│   └── main.py             # Main FastAPI application
├── public/                 # Static assets for the frontend
├── src/                    # React frontend source code
│   ├── assets/             # Frontend assets (images, svgs)
│   ├── App.jsx             # Main React App component
│   ├── main.jsx            # Entry point for the React app
│   └── ...                 # Other React components and CSS
├── .github/
│   └── copilot-instructions.md # Instructions for GitHub Copilot
├── .venv/                  # Python virtual environment (if created with `uv venv .venv`)
├── node_modules/           # Node.js dependencies
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file for Vite
├── package.json            # Frontend project metadata and dependencies
├── package-lock.json       # Exact versions of frontend dependencies
├── README.md               # This file
└── vite.config.js          # Vite configuration
```

## Further Development

- Implement API endpoints in `backend/main.py` for:
    - Receiving user inputs (corpus, strategy, expected returns, std dev).
    - Triggering Monte Carlo simulations.
    - Returning simulation results.
- Develop the Monte Carlo simulation logic.
- Implement Pydantic models for request/response data validation in the backend.
- Build React components in the `src/` directory to:
    - Create forms for user inputs.
    - Display simulation results using charts (e.g., using a library like Chart.js or Recharts).
    - Interact with the backend APIs.
- Add error handling and user feedback mechanisms.
- Implement styling for a user-friendly interface.
