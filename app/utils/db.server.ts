import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line
  var db_instance: PrismaClient | undefined;
}

const createClient = () => {
  let db;
  // this is needed because in development we don't want to restart
  // the server with every change, but we want to make sure we don't
  // create a new connection to the DB with every change either.
  if (process.env.NODE_ENV === 'production') {
    db = new PrismaClient();
  } else {
    if (!global.db_instance) {
      global.db_instance = new PrismaClient();
    }
    db = global.db_instance;
  }
  return db;
};

const db: PrismaClient = createClient();

export { db };
