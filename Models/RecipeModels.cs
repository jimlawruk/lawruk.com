namespace Lawruk.Models
{

    public class RecipeResultsViewModel : PageViewModel
    {
        public List<Recipe> Recipes { get; set; } = new();
    }
    public class Ingredient
    {
        public string Name { get; set; } = string.Empty;
        public decimal Number { get; set; }
        public string UnitOfMeasurement { get; set; } = string.Empty;
    }

    public class Instruction
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class Recipe
    {
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int? Serves { get; set; }
        public List<Ingredient> Ingredients { get; set; } = new();
        public List<Instruction> Instructions { get; set; } = new();
    }
}
