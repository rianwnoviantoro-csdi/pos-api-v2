import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Brackets, Connection, DeleteResult } from 'typeorm';
import {
  Recipe,
  RecipeSchema,
} from 'src/config/database/schemas/recipe.schema';
import { RecipeIngredientSchema } from 'src/config/database/schemas/recipe-ingredient.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from 'src/commons/utils/cloudinary';

@Injectable()
export class RecipeService {
  constructor(private readonly connection: Connection) {}

  async create(
    req: Request,
    createRecipeDto: CreateRecipeDto,
    file: Express.Multer.File,
  ): Promise<Recipe> {
    return await this.connection.transaction(async (trx) => {
      const { ingredient: ingredients, ...recipeData } = createRecipeDto;

      const imageUrl: any = await uploadImageToCloudinary(file, 'recipes');

      const recipe = await trx.save(RecipeSchema, {
        ...recipeData,
        image: imageUrl.url,
      });

      const ingredientArray = JSON.parse(ingredients as any);

      if (ingredientArray && ingredientArray.length > 0) {
        const newIngredients = ingredientArray.map((item) => ({
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
        { ...createRecipeDto, ingredient: ingredientArray },
      );

      return recipe;
    });
  }

  async findAll(
    req: Request,
    filter: FilterRecipeDto,
  ): Promise<Record<string, any>> {
    return await this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx
        .getRepository(RecipeSchema)
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.category', 'category')
        .select([
          'recipe.id',
          'recipe.name',
          'recipe.price',
          'recipe.image',
          'recipe.createdAt',
          'recipe.updatedAt',
          'category.id',
          'category.code',
          'category.name',
        ]);

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('recipe.name ILIKE :search', {
              search: `%${filter.search}%`,
            }).orWhere('category.name ILIKE :search', {
              search: `%${filter.search}%`,
            });
          }),
        );
      }

      if (filter.categoryId) {
        query.andWhere('category.id = :categoryId', {
          categoryId: filter.categoryId,
        });
      }

      const sortMapping: Record<string, string> = {
        name: 'recipe.name',
        price: 'recipe.price',
        category: 'category.name',
        createdAt: 'recipe.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'recipe.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [recipes, total] = await query.getManyAndCount();

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'RECIPE_MODULE',
        `User <b>${user.name}</b> has view recipe at <b>${formatedDate(new Date())}</b>.`,
        { ...filter },
      );

      return {
        data: recipes,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(req: Request, id: number): Promise<Recipe> {
    return await this.connection.transaction(async (trx) => {
      const recipe = await trx.findOne(RecipeSchema, {
        where: { id },
        relations: ['ingredients'],
      });

      if (!recipe) throw new NotFoundException(`Recipe not found.`);

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'RECIPE_MODULE',
        `User <b>${user.name}</b> has view recipe <b>${recipe.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        recipe,
      );

      return recipe;
    });
  }

  async update(
    req: Request,
    id: number,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return await this.connection.transaction(async (trx) => {
      const recipe = await this.findOne(req, id);

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
      const recipe = await this.findOne(req, id);

      if (recipe.image) {
        await deleteImageFromCloudinary(recipe.image);
      }

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
