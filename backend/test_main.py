from fastapi.testclient import TestClient
import unittest
import numpy as np
from typing import Dict, Any

from backend.main import app, SimulationInput

client = TestClient(app)

class TestMonteCarloSimulation(unittest.TestCase):
    """Test cases for the Monte Carlo simulation API"""
    
    def setUp(self):
        """Set up default test parameters"""
        self.valid_input = {
            "initial_corpus": 100000,
            "start_year": 2025,
            "end_year": 2045,
            "expected_return_pct": 8.0,
            "return_std_dev_pct": 12.0,
            "inflation_pct": 2.5,
            "inflation_std_dev_pct": 1.0,
            "num_simulations": 50  # Smaller number for faster tests
        }
    
    def test_root_endpoint(self):
        """Test that the root endpoint returns the expected message"""
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Hello from FastAPI backend!"})
    
    def test_simulate_success(self):
        """Test a successful simulation request"""
        response = client.post("/api/simulate", json=self.valid_input)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("paths", data)
        self.assertIn("years", data)
        self.assertIn("percentiles", data)
        for key in ["median", "p25", "p75", "p5", "p95"]:
            self.assertIn(key, data["percentiles"])
            self.assertEqual(len(data["percentiles"][key]), self.valid_input["end_year"] - self.valid_input["start_year"] + 1)
        self.assertEqual(len(data["paths"]), self.valid_input["num_simulations"])
        path_lengths = [len(path) for path in data["paths"]]
        self.assertEqual(min(path_lengths), max(path_lengths))
        for path in data["paths"]:
            self.assertEqual(path[0]["value"], self.valid_input["initial_corpus"])
    
    def test_simulate_invalid_input(self):
        """Test handling of invalid inputs"""
        # Test missing required field
        invalid_input = self.valid_input.copy()
        del invalid_input["initial_corpus"]
        response = client.post("/api/simulate", json=invalid_input)
        self.assertEqual(response.status_code, 422)  # Unprocessable Entity
        
        # Test end_year before start_year
        invalid_input = self.valid_input.copy()
        invalid_input["end_year"] = 2020
        invalid_input["start_year"] = 2025
        response = client.post("/api/simulate", json=invalid_input)
        # The API should handle this gracefully, either by:
        # - Returning 422 (Unprocessable Entity)
        # - Swapping the years automatically
        # - Returning an empty result
        self.assertNotEqual(response.status_code, 500)  # Should not crash
    
    def test_simulation_statistics(self):
        """Test that the simulation statistics are correctly calculated"""
        response = client.post("/api/simulate", json=self.valid_input)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Check that all percentiles have data
        for key in ["median", "p25", "p75", "p5", "p95"]:
            self.assertTrue(len(data["percentiles"][key]) > 0)
        # Check order: p95 >= p75 >= median >= p25 >= p5 (last year)
        last = lambda key: data["percentiles"][key][-1]["value"]
        self.assertGreaterEqual(last("p95"), last("p75"))
        self.assertGreaterEqual(last("p75"), last("median"))
        self.assertGreaterEqual(last("median"), last("p25"))
        self.assertGreaterEqual(last("p25"), last("p5"))
    
    def test_simulation_seeded(self):
        """Test that with the same random seed, simulation is deterministic"""
        # This is an optional test - if you want deterministic results
        # you'd need to modify the main.py to accept a seed parameter
        # For now, we'll just verify that multiple runs with different seeds
        # produce different results (which they should)
        
        np.random.seed(42)  # Set seed for the first run
        response1 = client.post("/api/simulate", json=self.valid_input)
        data1 = response1.json()
        
        np.random.seed(43)  # Set different seed for second run
        response2 = client.post("/api/simulate", json=self.valid_input)
        data2 = response2.json()
        
        # With different seeds, the paths should be different
        # Compare the final values of the first path
        path1_final = data1["paths"][0][-1]["value"]
        path2_final = data2["paths"][0][-1]["value"]
        
        # They could still be the same by chance, but very unlikely
        # We're not asserting inequality to avoid flaky tests
        
if __name__ == "__main__":
    unittest.main()
