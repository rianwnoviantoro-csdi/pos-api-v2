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
  user: User | null,
  module: string,
  detail: string,
  additionalInfo: Record<string, any> = {},
): Promise<void> {
  await connection.transaction(async (trx) => {
    await trx.save(LogSchema, {
      user,
      role: user ? user.roles[0] : null,
      module,
      detail,
      additionalInfo,
    });
  });
}
