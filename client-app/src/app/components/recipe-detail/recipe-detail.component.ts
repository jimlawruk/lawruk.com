import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Recipe } from '../../models/recipeModels';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private titleService: Title
  ) {}

  async ngOnInit(): Promise<void> {
    const title = this.route.snapshot.paramMap.get('title') ?? '';
    try {
      this.recipe = await this.recipeService.getRecipeDetail(title);
      this.titleService.setTitle(`${this.recipe.title} | Lawruk.com`);
    } catch {
      this.error = 'Recipe not found.';
      this.titleService.setTitle('Recipes | Lawruk.com');
    } finally {
      this.loading = false;
    }
  }
}