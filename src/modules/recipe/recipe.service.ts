import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Connection, DeleteResult } from 'typeorm';
import {
  Recipe,
  RecipeSchema,
} from 'src/config/database/schemas/recipe.schema';
import { RecipeIngredientSchema } from 'src/config/database/schemas/recipe-ingredient.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';

@Injectable()
export class RecipeService {
  constructor(private readonly connection: Connection) {}

  async create(
    req: Request,
    createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    return await this.connection.transaction(async (trx) => {
      const { ingredient: ingredients, ...recipeData } = createRecipeDto;

      const recipe = await trx.save(RecipeSchema, {
        ...recipeData,
      });

      if (ingredients && ingredients.length > 0) {
        const newIngredients = ingredients.map((item) => ({
          recipe: recipe,
          ingredient: { id: item.id },
          amount: item.amount,
          unit: item.unit,
        }));

        await trx.save(RecipeIngredientSchema, newIngredients);
      }

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'RECIPE_MODULE',
        `User <b>${user.name}</b> add <b>${recipe.name}</b> as new recipe at <b>${formatedDate(new Date())}</b>.`,
        { ...createRecipeDto },
      );

      return recipe;
    });
  }

  async findAll(): Promise<Recipe[]> {
    return await this.connection.transaction(async (trx) => {
      return await trx.find(RecipeSchema);
    });
  }

  async findOne(id: number): Promise<Recipe> {
    return await this.connection.transaction(async (trx) => {
      const recipe = await trx.findOne(RecipeSchema, {
        where: { id },
        relations: ['ingredients'],
      });

      if (!recipe) throw new NotFoundException(`Recipe not found.`);

      return recipe;
    });
  }

  async update(
    req: Request,
    id: number,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return await this.connection.transaction(async (trx) => {
      const recipe = await this.findOne(id);

      const { ingredient: ingredients, ...updateData } = updateRecipeDto;

      await trx.save(RecipeSchema, {
        ...recipe,
        ...updateData,
      });

      if (ingredients && ingredients.length > 0) {
        await trx.delete(RecipeIngredientSchema, recipe);

        const newIngredients = ingredients.map((item) => ({
          recipe: recipe,
          ingredient: { id: item.id },
          amount: item.amount,
          unit: item.unit,
        }));

        await trx.save(RecipeIngredientSchema, newIngredients);
      }

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'RECIPE_MODULE',
        `User <b>${user.name}<b/> update recipe <b>${recipe.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        { ...updateRecipeDto },
      );

      return await trx.findOne(RecipeSchema, {
        where: { id },
        relations: ['ingredients'],
      });
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const recipe = await this.findOne(id);

      const deletedRecipe = await trx.delete(RecipeSchema, { id: recipe.id });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'RECIPE_MODULE',
        `User <b>${user.name}</b> delete recipe <b>${recipe.name}</b> at <b>${formatedDate(new Date())}</b>.`,
      );

      return deletedRecipe;
    });
  }
}
