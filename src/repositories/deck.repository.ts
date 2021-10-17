import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Card, Deck, DeckRelations} from '../models';
import {CardRepository} from './card.repository';

export class DeckRepository extends DefaultCrudRepository<
  Deck,
  typeof Deck.prototype.deckId,
  DeckRelations
> {

  public readonly cards: HasManyRepositoryFactory<Card, typeof Deck.prototype.deckId>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CardRepository') protected cardRepositoryGetter: Getter<CardRepository>,
  ) {
    super(Deck, dataSource);
    this.cards = this.createHasManyRepositoryFactoryFor('cards', cardRepositoryGetter,);
    this.registerInclusionResolver('cards', this.cards.inclusionResolver);
  }

  public async createWithCards(deck: Omit<Deck, 'deckId'>) {
    const namedCards: Record<string, string> = {
      A: 'ACE',
      J: 'JACK',
      Q: 'QUEEN',
      K: 'KING',
    };
    const suits = ['SPADES', 'DIAMONDS', 'CLUBS', 'HEARTS'];
    const cardsInOrder = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    const skipForShortDeck: (number | string)[] = [2, 3, 4, 5];

    let cards = [];

    for (const suit of suits) {
      if (suit === 'CLUBS') {
        cardsInOrder.reverse();
      }

      for (const card of cardsInOrder) {
        if (deck.type === 'SHORT' && skipForShortDeck.indexOf(card) !== -1)
          continue;

        const value = namedCards[card] || card;

        cards.push({
          value: String(value),
          suit: suit,
          code: card + suit[0]
        });
      }
    }

    if (deck.shuffled) {
      cards = cards.sort((a, b) => 0.5 - Math.random());
    }

    deck.remaining = cards.length;

    const createdDeck = await this.create(deck);

    for (const card of cards) {
      await this.cards(createdDeck.deckId).create(card);
    }

    return createdDeck;
  }

  public async getById(deckId: string) {
    const deck: Deck = await this.findById(deckId);
    deck.cards = await this.cards(deckId).find({
      fields: ['value', 'suit', 'code'],
      order: ['id']
    });

    return deck;
  }

  public async draw(deckId: string, count: number) {
    const cards: Record<string, Card[]> = {
      cards: await this.cards(deckId).find({
        fields: ['id', 'value', 'suit', 'code'],
        order: ['id'],
        limit: count,
      })
    };

    cards.cards = await Promise.all(cards.cards.map(async card => {
      await this.cards(deckId).delete({id: card.id});
      delete card.id
      return card
    }))

    const deck = await this.findById(deckId);
    deck.remaining -= cards.cards.length;
    await this.save(deck);

    return cards;
  }
}
