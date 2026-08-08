import math
import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "reference"))

from six_vector_reference import update_six_vector, DEMO_V, DEMO_U, DEFAULT_SCALES, DEFAULT_THETA0


class SixVectorReferenceTests(unittest.TestCase):
    def test_demo_mismatch_norm(self):
        r = update_six_vector(DEMO_V, DEMO_U)
        self.assertAlmostEqual(r.G, 1.0908712114635717, places=12)

    def test_projection_reduces_signed_residual(self):
        r = update_six_vector(DEMO_V, DEMO_U)
        self.assertLess(abs(r.R), abs(r.R0))
        self.assertLess(abs(r.R), 1e-9)

    def test_component_norm_can_remain_nonzero_when_R_is_near_zero(self):
        r = update_six_vector(DEMO_V, DEMO_U)
        self.assertLess(abs(r.R), 1e-9)
        self.assertGreater(r.E, 0.1)

    def test_near_zero_delta_retains_theta0(self):
        r = update_six_vector([1,2,3,0.1,0.2,0.3], [1,2,3,0.1,0.2,0.3])
        self.assertEqual(r.theta, tuple(DEFAULT_THETA0))
        self.assertFalse(r.projection_applied)
        self.assertEqual(r.G, 0.0)

    def test_scales_must_be_positive(self):
        with self.assertRaises(ValueError):
            update_six_vector(DEMO_V, DEMO_U, [1,1,1,0.1,0.1,0])

    def test_projection_can_be_disabled(self):
        r = update_six_vector(DEMO_V, DEMO_U, use_projection=False)
        self.assertEqual(r.theta, tuple(DEFAULT_THETA0))
        self.assertAlmostEqual(r.R, r.R0, places=12)


if __name__ == "__main__":
    unittest.main()
