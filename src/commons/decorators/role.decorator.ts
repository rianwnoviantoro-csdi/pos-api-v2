import { SetMetadata } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
