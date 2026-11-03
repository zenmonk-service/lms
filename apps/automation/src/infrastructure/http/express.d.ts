import type { EntityManager } from 'typeorm';

declare global {
  namespace Express {
    interface Request {
      ENTITY_MANAGER?: EntityManager;
    }
  }
}
