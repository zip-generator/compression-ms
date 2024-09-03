import { randomUUID, UUID } from 'crypto';

const getRandomUuid = (): UUID => {
  return randomUUID();
};

export { getRandomUuid };
