# WealthCast – Financial Scenario Analyzer

WealthCast is a modern financial scenario analyzer that uses Monte Carlo simulations to project potential investment outcomes based on user-defined parameters. It features a Python FastAPI backend and a React (Vite) frontend, with a clean, interactive UI and advanced percentile visualization.

---

## Features

- **Monte Carlo Simulation:** Project your portfolio's future value under uncertainty.
- **Percentile Visualization:** See 5th, 25th, 50th (median), 75th, and 95th percentiles.
- **Expense Modeling:** Account for inflation-adjusted expenses in your retirement plan.
- **Indian Rupee Support:** All values in ₹, with lakh/crore formatting.
- **Interactive UI:** Toggle traces, adjust parameters, and see results instantly.
- **Docker & Railway Ready:** Easy to deploy locally or in the cloud.

---

## Project Structure

```
/
├── backend/                # FastAPI backend code
│   ├── main.py             # Main FastAPI application
│   └── ...                 # Backend tests, etc.
├── src/                    # React frontend source code
│   ├── App.jsx             # Main React App component
│   ├── main.jsx            # Entry point for the React app
│   └── ...                 # Other React components and CSS
├── public/                 # Static assets for the frontend
├── frontend/               # (optional) for Docker context
├── Dockerfile.backend      # Backend Dockerfile
├── Dockerfile.frontend     # Frontend Dockerfile
├── docker-compose.yml      # Compose file for local multi-service dev
├── package.json            # Frontend dependencies
├── requirement.txt         # Python dependencies
├── index.html              # Vite entry point
└── README.md               # This file
```

---

## Quick Start (Local)

### 1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wealthcast.git
cd wealthcast
```

### 2. **Run with Docker Compose**
```bash
docker-compose up --build
```
- Frontend: [http://localhost:5173/](http://localhost:5173/)
- Backend: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

### 3. **Manual (without Docker)**
#### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r ../requirement.txt
uvicorn main:app --reload --port 8000
```
#### Frontend
```bash
npm install
npm run dev
```
- Visit [http://localhost:5173](http://localhost:5173)

---


## Development Notes

- **Frontend:** React + Vite, Recharts for visualization, INR formatting.
- **Backend:** FastAPI, NumPy for simulation, CORS enabled.
- **Testing:** Backend unit tests in `backend/test_main.py`.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE) (or your preferred license)

---

## Credits

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Recharts](https://recharts.org/)

---

**Questions?**  
Open an issue or contact the maintainer.
