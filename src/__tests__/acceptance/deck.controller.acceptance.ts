import {Client, expect} from '@loopback/testlab';
import {DeckApplication} from '../..';
import {givenEmptyDatabase, setupApplication} from './test-helper';

describe('DeckController', () => {
  let app: DeckApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    await givenEmptyDatabase();
  });

  describe('invokes POST /deck', () => {
    it('without any params', async () => {
      const res = await client.post('/deck').send({}).expect(200);
      expect(Object.keys(res.body)).to.have.length(4);
      expect(res.body).to.containEql({type: 'FULL'});
      expect(res.body).to.containEql({shuffled: false});
      expect(res.body).to.containEql({remaining: 52});
    });

    it('should be shuffled', async () => {
      const res = await client.post('/deck').send({
        shuffled: true
      }).expect(200);
      expect(res.body).to.containEql({shuffled: true});
    });

    it('should has 36 cards', async () => {
      const res = await client.post('/deck').send({
        type: 'SHORT'
      }).expect(200);
      expect(res.body).to.containEql({type: 'SHORT'});
      expect(res.body).to.containEql({remaining: 36});
    });
  });

  describe('invokes GET /deck/{deckId}', () => {
    it('should return deck', async () => {
      const resNewDeck = await client.post('/deck').send({}).expect(200);
      const res = await client.get('/deck/' + resNewDeck.body.deckId).expect(200);
      expect(Object.keys(res.body)).to.have.length(5);
      expect(res.body).to.containEql({deckId: resNewDeck.body.deckId});
      expect(res.body).to.containEql({type: 'FULL'});
      expect(res.body).to.containEql({shuffled: false});
      expect(res.body).to.containEql({remaining: 52});
      expect(res.body).to.have.property('cards');
      expect(Object.keys(res.body.cards[0])).to.have.length(3);
    });

    it('not found error', async () => {
      await client.get('/deck/123').expect(404);
    });

    it('not provided error', async () => {
      await client.get('/deck').expect(404);
    });
  });

  describe('invokes GET /deck/{deckId}/draw?count={count}', () => {
    it('1 card', async () => {
      const resNewDeck = await client.post('/deck').send({}).expect(200);
      const res = await client.get('/deck/' + resNewDeck.body.deckId + '/draw?count=1').expect(200);
      expect(Object.keys(res.body)).to.have.length(1);
      expect(res.body).to.have.property('cards');
      expect(res.body.cards).to.have.length(1);
      expect(Object.keys(res.body.cards[0])).to.have.length(3);
      expect(res.body.cards[0]).to.have.properties('value', 'suit', 'code');
    });

    it('10 cards', async () => {
      const resNewDeck = await client.post('/deck').send({}).expect(200);
      const res = await client.get('/deck/' + resNewDeck.body.deckId + '/draw?count=10').expect(200);
      expect(Object.keys(res.body)).to.have.length(1);
      expect(res.body).to.have.property('cards');
      expect(res.body.cards).to.have.length(10);
    });

    it('15 cards with 10 card remain', async () => {
      const resNewDeck = await client.post('/deck').send({}).expect(200);
      await client.get('/deck/' + resNewDeck.body.deckId + '/draw?count=42').expect(200);
      const res = await client.get('/deck/' + resNewDeck.body.deckId + '/draw?count=15').expect(200);
      expect(Object.keys(res.body)).to.have.length(1);
      expect(res.body).to.have.property('cards');
      expect(res.body.cards).to.have.length(10);
    });

    it('not found error', async () => {
      await client.get('/deck/123/draw?count=1').expect(404);
    });

    it('not provided error', async () => {
      await client.get('/deck//draw?count=1').expect(404);
    });

    it('count is required error', async () => {
      const resNewDeck = await client.post('/deck').send({}).expect(200);
      const res = await client.get('/deck/' + resNewDeck.body.deckId + '/draw').expect(400);
      expect(res.body).to.have.property('error');
    });

    it('deck is over error', async () => {
      const resNewDeck = await client.post('/deck').send({}).expect(200);
      await client.get('/deck/' + resNewDeck.body.deckId + '/draw?count=52').expect(200);
      const res = await client.get('/deck/' + resNewDeck.body.deckId + '/draw?count=1').expect(400);
      expect(res.body.error).to.containEql({message: 'Deck is over'});
    });
  })
});
