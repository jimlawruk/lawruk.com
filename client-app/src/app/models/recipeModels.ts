export class RecipeResultsModel {
  pageType = '';
  pageTitle = '';
  recipes: Recipe[] = [];
}
export class Ingredient {
  name = '';
  number = 0;
  unitOfMeasurement = '';
}

export class Instruction {
  title = '';
  description = '';
}

export class Recipe {
  slug = '';
  title = '';
  serves: number | null = null;
  ingredients: Ingredient[] = [];
  instructions: Instruction[] = [];
}
