import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Recipe, RecipeResultsModel } from '../models/recipeModels';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  constructor(private http: HttpClient) {}

  async getRecipes(): Promise<RecipeResultsModel> {
    return lastValueFrom(this.http.get<RecipeResultsModel>('/api/recipes'));
  }

  async getRecipeDetail(title: string): Promise<Recipe> {
    return lastValueFrom(this.http.get<Recipe>(`/api/recipes/${title}`));
  }
}