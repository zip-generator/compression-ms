import { IData, InvoiceType } from '@app/interfaces';
import { randomUUID, UUID } from 'crypto';
import * as fs from 'fs';
import { rimraf } from 'rimraf';

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

const rmFile = (filePath: string): Promise<void> => {
  const dir = filePath.slice(0, filePath.lastIndexOf('/'));
  return new Promise((resolve, reject) => {
    rimraf(dir, {})
      .then((resp) => {
        if (!resp) {
          reject(new Error('Failed to remove file'));
          return;
        }

        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export { getRandomUuid, readFileFromPath, rmFile };
