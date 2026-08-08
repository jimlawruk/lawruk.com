import importlib.util
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "generate_messiah_yearly_results", ROOT / "scripts" / "generate_messiah_yearly_results.py"
)
module = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(module)


class ParseCellTests(unittest.TestCase):
    def test_parses_time_first_dash_format(self) -> None:
        self.assertEqual(module.parse_cell("6:53.0- Matthew Kimmel"), ("Matthew Kimmel", "6:53.0"))

    def test_parses_name_first_dash_format(self) -> None:
        self.assertEqual(module.parse_cell("Reid Aslan- 6:53.5"), ("Reid Aslan", "6:53.5"))

    def test_parses_space_around_dash_format(self) -> None:
        self.assertEqual(module.parse_cell("4:30.9 - Jeremiah Herrick"), ("Jeremiah Herrick", "4:30.9"))


if __name__ == "__main__":
    unittest.main()
