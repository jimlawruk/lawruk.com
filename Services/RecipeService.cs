using System.Globalization;
using Lawruk.Models;

namespace Lawruk.Services
{
    public class RecipeService
    {
        public string RecipesFolderFilePath { get; set; } = string.Empty;

        public RecipeResultsViewModel GetRecipeResultsViewModel()
        {
            return new RecipeResultsViewModel
            {
                PageType = "App",
                PageTitle = "Recipes",
                Recipes = GetRecipes()
                    .OrderBy(recipe => recipe.Title, StringComparer.OrdinalIgnoreCase)
                    .ToList()
            };
        }

        public Recipe? GetRecipeBySlug(string slug)
        {
            if (!Directory.Exists(RecipesFolderFilePath))
            {
                return null;
            }

            var recipeFilePath = Directory
                .GetFiles(RecipesFolderFilePath, "*.txt")
                .FirstOrDefault(file => string.Equals(Path.GetFileNameWithoutExtension(file), slug, StringComparison.OrdinalIgnoreCase));

            return recipeFilePath == null ? null : GetRecipeFromFile(recipeFilePath);
        }

        private List<Recipe> GetRecipes()
        {
            if (!Directory.Exists(RecipesFolderFilePath))
            {
                return new List<Recipe>();
            }

            return Directory
                .GetFiles(RecipesFolderFilePath, "*.txt")
                .Select(GetRecipeFromFile)
                .ToList();
        }

        private Recipe GetRecipeFromFile(string recipeFilePath)
        {
            var lines = File.ReadAllLines(recipeFilePath);
            var recipe = new Recipe
            {
                Slug = Path.GetFileNameWithoutExtension(recipeFilePath)
            };
            var section = string.Empty;

            foreach (var rawLine in lines)
            {
                var line = rawLine.Trim();
                if (string.IsNullOrWhiteSpace(line))
                {
                    continue;
                }

                if (line.StartsWith("Title:", StringComparison.OrdinalIgnoreCase))
                {
                    recipe.Title = line[6..].Trim();
                    section = string.Empty;
                    continue;
                }

                if (line.StartsWith("Serves:", StringComparison.OrdinalIgnoreCase))
                {
                    if (int.TryParse(line[7..].Trim(), out var serves))
                    {
                        recipe.Serves = serves;
                    }

                    section = string.Empty;
                    continue;
                }

                if (line.Equals("Ingredients:", StringComparison.OrdinalIgnoreCase))
                {
                    section = "ingredients";
                    continue;
                }

                if (line.Equals("Steps:", StringComparison.OrdinalIgnoreCase))
                {
                    section = "steps";
                    continue;
                }

                if (section == "ingredients" && line.StartsWith('-'))
                {
                    recipe.Ingredients.Add(ParseIngredient(line[1..].Trim()));
                    continue;
                }

                if (section == "steps" && line.StartsWith('-'))
                {
                    recipe.Instructions.Add(ParseInstruction(line[1..].Trim()));
                }
            }

            if (string.IsNullOrWhiteSpace(recipe.Title))
            {
                recipe.Title = Path.GetFileNameWithoutExtension(recipeFilePath);
            }

            return recipe;
        }

        private static Ingredient ParseIngredient(string value)
        {
            var parts = value.Split('|', StringSplitOptions.TrimEntries);
            if (parts.Length != 3)
            {
                throw new InvalidDataException($"Ingredient line '{value}' must contain exactly 3 pipe-delimited values.");
            }

            if (!decimal.TryParse(parts[1], NumberStyles.Number, CultureInfo.InvariantCulture, out var number))
            {
                throw new InvalidDataException($"Ingredient number '{parts[1]}' is not a valid number.");
            }

            return new Ingredient
            {
                Name = parts[0],
                Number = number,
                UnitOfMeasurement = parts[2]
            };
        }

        private static Instruction ParseInstruction(string value)
        {
            var parts = value.Split('|', 2, StringSplitOptions.TrimEntries);
            if (parts.Length != 2)
            {
                throw new InvalidDataException($"Instruction line '{value}' must contain a title and description separated by '|'.");
            }

            return new Instruction
            {
                Title = parts[0],
                Description = parts[1]
            };
        }
    }
}