import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Recipe, RecipeResultsModel} from '../../models/recipeModels';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {
  allRecipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  loading = true;
  error = '';
  filterTitle = '';
  sortAsc = true;

  constructor(private recipeService: RecipeService, private titleService: Title) {
    this.titleService.setTitle('Recipes | Lawruk.com');
  }

  async ngOnInit(): Promise<void> {
    try {
      const viewModel: RecipeResultsModel = await this.recipeService.getRecipes();
      this.allRecipes = (viewModel.recipes ?? []).sort((a, b) => a.title.localeCompare(b.title));
      this.filteredRecipes = [...this.allRecipes];
    } catch {
      this.error = 'Failed to load recipes.';
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    const filter = this.filterTitle.toLowerCase();
    this.filteredRecipes = this.allRecipes.filter(recipe => recipe.title.toLowerCase().includes(filter));
    this.applySort();
  }

  sortByTitle(): void {
    this.sortAsc = !this.sortAsc;
    this.applySort();
  }

  private applySort(): void {
    this.filteredRecipes = [...this.filteredRecipes].sort((a, b) => {
      const result = a.title.localeCompare(b.title);
      return this.sortAsc ? result : -result;
    });
  }
}