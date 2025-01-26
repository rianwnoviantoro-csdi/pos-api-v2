import { Connection } from 'typeorm';
import { LogSchema } from 'src/config/database/schemas/log.schema';
import { User } from 'src/config/database/schemas/user.schema';

export function formatedDate(date: Date): string {
  const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '/');
  const time = date.toTimeString().split(' ')[0]; // Extracts HH:mm:ss
  return `${formattedDate} ${time}`;
}

export async function createLog(
  connection: Connection,
  user: User | string,
  module: string,
  act: string,
  additionalInfo: any = {},
): Promise<void> {
  await connection.transaction(async (trx) => {
    await trx.save(LogSchema, {
      user: typeof user === 'string' ? null : user,
      role: typeof user === 'string' ? null : user.roles[0],
      module,
      detail: `User <b>${typeof user === 'string' ? user : user.name}</b> has <b>${act}</b> at <b>${formatedDate(new Date())}</b>.`,
      additionalInfo,
    });
  });
}
