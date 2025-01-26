import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Connection, DeleteResult } from 'typeorm';
import {
  Category,
  CategorySchema,
} from 'src/config/database/schemas/category.schema';
import slugify from 'slugify';
import { Request } from 'express';
import { createLog } from 'src/commons/utils/log.util';

@Injectable()
export class CategoryService {
  constructor(private readonly connection: Connection) {}

  async create(
    req: Request,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.connection.transaction(async (trx) => {
      let parentCategory = null;

      if (createCategoryDto.parent) {
        parentCategory = await this.findOne(req, createCategoryDto.parent);
      }

      const newCategory = await trx.save(CategorySchema, {
        ...createCategoryDto,
        slug: slugify(createCategoryDto.name, { lower: true, strict: true }),
        parent: parentCategory,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'CATEGORY_MODULE',
        `add "${newCategory.name.toUpperCase()}" as new category`,
        { ...createCategoryDto },
      );

      return newCategory;
    });
  }

  async findAll(req: Request): Promise<Category[]> {
    return await this.connection.transaction(async (trx) => {
      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'CATEGORY_MODULE',
        `view category`,
      );

      return await trx
        .getRepository(CategorySchema)
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.children', 'child')
        .leftJoinAndSelect('child.children', 'grandChild')
        .select([
          'category.id',
          'category.name',
          'category.slug',
          'category.code',
          'child.id',
          'child.name',
          'child.slug',
          'child.code',
          'grandChild.id',
          'grandChild.name',
          'grandChild.slug',
          'grandChild.code',
        ])
        .where('category.type = :type', { type: 'parent' })
        .getMany();
    });
  }

  async findOne(req: Request, id: number): Promise<Category> {
    return await this.connection.transaction(async (trx) => {
      const category = await trx
        .getRepository(CategorySchema)
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.children', 'child')
        .leftJoinAndSelect('child.children', 'grandChild')
        .select([
          'category.id',
          'category.name',
          'category.slug',
          'category.code',
          'child.id',
          'child.name',
          'child.slug',
          'child.code',
          'grandChild.id',
          'grandChild.name',
          'grandChild.slug',
          'grandChild.code',
        ])
        .where('category.id = :id', { id })
        .getOne();

      if (!category) throw new NotFoundException(`Category not found.`);

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'CATEGORY_MODULE',
        `view category "${category.name.toUpperCase()}"`,
        category,
      );

      return category;
    });
  }

  async update(
    id: number,
    req: Request,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.connection.transaction(async (trx) => {
      const category = await this.findOne(req, id);

      const updatedCategory = await trx.save(CategorySchema, {
        ...category,
        ...updateCategoryDto,
        slug: slugify(updateCategoryDto.name ?? category.name, {
          lower: true,
          strict: true,
        }),
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'CATEGORY_MODULE',
        `update category "${category.name.toUpperCase()}"`,
        { ...updateCategoryDto },
      );

      return updatedCategory;
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const category = await this.findOne(req, id);

      const deletedCategory = await trx.delete(CategorySchema, {
        id: category.id,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'CATEGORY_MODULE',
        `delete category "${category.name.toUpperCase()}"`,
      );

      return deletedCategory;
    });
  }
}
