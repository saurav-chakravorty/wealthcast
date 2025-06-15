import subprocess
import unittest
from pathlib import Path


class TestCodeQuality(unittest.TestCase):
    """Run Ruff linter on the backend codebase to ensure it stays clean."""

    def test_ruff_clean(self):
        """Ruff should exit with code 0 (no violations) for backend/ directory."""
        backend_dir = Path(__file__).parent
        # Run ruff in quiet mode so we only get output when there are issues.
        result = subprocess.run(
            [
                "ruff",
                "check",
                "--quiet",
                str(backend_dir),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            # Print linter output for easier debugging when the test fails
            print(result.stdout)
            print(result.stderr)
        self.assertEqual(
            result.returncode,
            0,
            msg="Ruff reported linting errors. Fix them before committing.",
        )


if __name__ == "__main__":
    unittest.main() 