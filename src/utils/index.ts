import { IData, InvoiceType } from '@app/interfaces';
import { randomUUID, UUID } from 'crypto';
import * as fs from 'fs';

const getRandomUuid = (): UUID => {
  return randomUUID();
};

const readFileFromPath = async (
  filePath: string,
): Promise<IData<InvoiceType>> => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.log(`Failed to read file: ${filePath}`, err);
    throw err;
  }
};

const rmFile = async (filePath: string): Promise<void> => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.log(`Failed to remove file: ${filePath}`, err);
    throw err;
  }
};
export { getRandomUuid, readFileFromPath, rmFile };
