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
import { createLog, formatedDate } from 'src/commons/utils/log.util';

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
        parentCategory = await this.findOne(createCategoryDto.parent);
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
        `User <b>${user.name}</b> add <b>${newCategory.name}</b> as new category at <b>${formatedDate(new Date())}</b>.`,
        { ...createCategoryDto },
      );

      return newCategory;
    });
  }

  async findAll(): Promise<Category[]> {
    return await this.connection.transaction(async (trx) => {
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

  async findOne(id: number): Promise<Category> {
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

      return category;
    });
  }

  async update(
    id: number,
    req: Request,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.connection.transaction(async (trx) => {
      const category = await this.findOne(id);

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
        `User <b>${user.name}</b> update category <b>${category.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        { ...updateCategoryDto },
      );

      return updatedCategory;
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const category = await this.findOne(id);

      const deletedCategory = await trx.delete(CategorySchema, {
        id: category.id,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'CATEGORY_MODULE',
        `User <b>${user.name}</b> delete category <b>${category.name}</b> at <b>${formatedDate(new Date())}</b>.`,
      );

      return deletedCategory;
    });
  }
}
