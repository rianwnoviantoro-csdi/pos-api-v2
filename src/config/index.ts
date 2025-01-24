import * as path from 'path';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  path: {
    entity: path.join(__dirname, '..', '**', '*.schema{.ts,.js}'),
  },
  access: {
    secret: process.env.JWT_TOKEN_SECRET,
    expires: process.env.JWT_TOKEN_EXPIRE,
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expires: process.env.JWT_REFRESH_EXPIRE,
  },
  api: {
    key: process.env.API_KEY,
  },
});
