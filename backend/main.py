import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import numpy as np
import datetime

app = FastAPI(debug=True) # Keep debug=True for now

# Get allowed origins from environment variable, or use local defaults
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:80,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationPath(BaseModel):
    year: int
    value: float

class SimulationResult(BaseModel):
    paths: List[List[SimulationPath]]
    years: List[int]
    percentiles: dict = {}  # Add percentiles as a dict
    ruin_probability: float | None = None

class SimulationInput(BaseModel):
    initial_corpus: float = Field(..., description="Initial investment amount")
    current_age: int = Field(..., description="Current age of the person")
    start_year: int = Field(..., description="Year to start simulation")
    end_year: int = Field(..., description="Year to end simulation")
    expected_return_pct: float = Field(..., description="Expected annual return percentage")
    return_std_dev_pct: float = Field(..., description="Standard deviation of returns percentage")
    inflation_pct: float = Field(..., description="Expected annual inflation percentage")
    inflation_std_dev_pct: float = Field(..., description="Standard deviation of inflation percentage")
    num_simulations: int = Field(100, description="Number of simulation paths to generate")
    current_monthly_expense: float = Field(..., description="Current monthly expense")

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI backend!"}

@app.post("/api/simulate", response_model=SimulationResult)
async def run_simulation(input: SimulationInput):
    # Convert percentages to decimals
    expected_return = input.expected_return_pct / 100
    return_std_dev = input.return_std_dev_pct / 100
    inflation = input.inflation_pct / 100
    inflation_std_dev = input.inflation_std_dev_pct / 100
    
    # Calculate simulation horizon in years (retirement years only)
    simulation_horizon = input.end_year - input.start_year + 1
    
    # Prepare result containers
    all_paths_data = []
    year_labels = list(range(simulation_horizon))
    all_yearly_values = []  # To store values for each year across all simulations
    
    # Run simulations
    years_to_project = max(0, input.start_year - input.current_age)
    
    for _ in range(input.num_simulations):
        # Project corpus and expense forward to retirement age
        projected_corpus = input.initial_corpus
        projected_expense = input.current_monthly_expense
        
        if years_to_project > 0:
            for _ in range(years_to_project):
                random_return = np.random.normal(expected_return, return_std_dev)
                random_inflation = np.random.normal(inflation, inflation_std_dev)
                projected_corpus *= (1 + random_return)
                projected_expense *= (1 + random_inflation)
        
        # Now simulate retirement years only
        path_data = []
        current_value = projected_corpus
        expense = projected_expense * 12  # Start with annual expense
        
        # First data point at retirement (year 0 of retirement)
        path_data.append(SimulationPath(year=0, value=round(current_value, 2)))
        
        # Simulate for each subsequent retirement year
        for year in range(1, simulation_horizon):
            random_return = np.random.normal(expected_return, return_std_dev)
            random_inflation = np.random.normal(inflation, inflation_std_dev)
            current_value *= (1 + random_return)
            expense *= (1 + random_inflation)
            current_value -= expense
            if current_value < 0:
                current_value = 0
            path_data.append(SimulationPath(year=year, value=round(current_value, 2)))
        
        all_paths_data.append(path_data)
        all_yearly_values.append([point.value for point in path_data])
    
    # Build a 2D array: shape (num_simulations, simulation_horizon)
    all_yearly_values = np.array(all_yearly_values)
    
    # Calculate percentiles for each year
    percentiles = {}
    for pct, key in zip([50, 25, 75, 5, 95], ['median', 'p25', 'p75', 'p5', 'p95']):
        pct_values = np.percentile(all_yearly_values, pct, axis=0)
        percentiles[key] = [SimulationPath(year=year, value=round(val, 2)) for year, val in zip(year_labels, pct_values)]

    # Probability that the portfolio is depleted by the final year
    ruin_count = sum(1 for path in all_paths_data if path[-1].value <= 0)
    ruin_probability = (ruin_count / input.num_simulations) * 100

    return SimulationResult(
        paths=all_paths_data,
        years=year_labels,
        percentiles=percentiles,
        ruin_probability=round(ruin_probability, 2)
    )

@app.get("/health")
def health_check():
    return {"status": "ok"}

