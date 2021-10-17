import {
  Client, createRestAppClient,
  givenHttpServerConfig
} from '@loopback/testlab';
import {DeckApplication} from '../..';
import {CardRepository, DeckRepository} from '../../repositories';
import {testdb} from '../fixtures/datasources/testdb.datasource';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new DeckApplication({
    rest: restConfig,
  });

  await app.boot();
  app.dataSource(testdb);
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: DeckApplication;
  client: Client;
}

export async function givenEmptyDatabase() {
  const deckRepo: DeckRepository = new DeckRepository(
    testdb,
    async () => cardRepo,
  );

  const cardRepo: CardRepository = new CardRepository(
    testdb,
    async () => deckRepo,
  );

  await deckRepo.deleteAll();
  await cardRepo.deleteAll();
}
