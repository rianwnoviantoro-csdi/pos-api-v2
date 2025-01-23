import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './modules/category/category.module';
import { StockModule } from './modules/stock/stock.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { MenuModule } from './modules/menu/menu.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MemberModule } from './modules/member/member.module';
import { LogModule } from './modules/log/log.module';
import configuration from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    CategoryModule,
    StockModule,
    RecipeModule,
    MenuModule,
    InvoiceModule,
    UserModule,
    RoleModule,
    PermissionModule,
    MemberModule,
    LogModule,
  ],
})
export class AppModule {}
