import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { RecipeSchema } from 'src/config/database/schemas/recipe.schema';
import { StockSchema } from 'src/config/database/schemas/stock.schema';
import { FilterMenuDto } from './dto/filter-menu.dto';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';

@Injectable()
export class MenuService {
  constructor(private readonly connection: Connection) {}

  async findAll(
    req: Request,
    filter: FilterMenuDto,
  ): Promise<Record<string, any>> {
    return await this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx
        .getRepository(RecipeSchema)
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.ingredients', 'ingredients')
        .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
        .leftJoinAndSelect('recipe.category', 'category');

      if (filter.search) {
        query.andWhere('recipe.name ILIKE :recipeName', {
          recipeName: `%${filter.search}%`,
        });
      }

      if (filter.categoryId) {
        query.andWhere('category.id = :categoryId', {
          categoryId: filter.categoryId,
        });
      }

      const sortMapping: Record<string, string> = {
        name: 'recipe.name',
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

      const stocks = await trx.find(StockSchema);

      const stockMap = stocks.reduce(
        (acc, stock) => {
          acc[stock.id] = stock.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      const availableMenus: Array<{
        id: number;
        name: string;
        stock: number;
        price: number;
        category: { id: string; code: string; name: string };
      }> = [];

      for (const recipe of recipes) {
        let maxServings = Infinity;

        for (const ingredient of recipe.ingredients) {
          const stockAvailable = stockMap[ingredient.ingredient.id] || 0;

          const amountNeeded = ingredient.amount;

          if (stockAvailable < amountNeeded) {
            maxServings = 0;
            break;
          }

          const possibleServings = Math.floor(stockAvailable / amountNeeded);

          maxServings = Math.min(maxServings, possibleServings);
        }

        availableMenus.push({
          id: recipe.id,
          name: recipe.name,
          stock: maxServings ?? 0,
          price: recipe.price,
          category: {
            id: recipe.category.id,
            code: recipe.category.code,
            name: recipe.category.name,
          },
        });
      }

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'MENU_MODULE',
        `User <b>${user.name}</b> has view menu at <b>${formatedDate(new Date())}</b>.`,
        { ...filter },
      );

      return {
        data: availableMenus,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }
}
