import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { RecipeSchema } from 'src/config/database/schemas/recipe.schema';
import { StockSchema } from 'src/config/database/schemas/stock.schema';

@Injectable()
export class MenuService {
  constructor(private readonly connection: Connection) {}

  async findAll() {
    return await this.connection.transaction(async (trx) => {
      const recipes = await trx.find(RecipeSchema, {
        relations: ['ingredients.ingredient', 'category'],
      });

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

      return availableMenus;
    });
  }
}
