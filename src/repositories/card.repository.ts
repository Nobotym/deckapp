import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Card, CardRelations, Deck} from '../models';
import {DeckRepository} from './deck.repository';

export class CardRepository extends DefaultCrudRepository<
  Card,
  typeof Card.prototype.id,
  CardRelations
> {

  public readonly deck: BelongsToAccessor<Deck, typeof Card.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('DeckRepository') protected deckRepositoryGetter: Getter<DeckRepository>,
  ) {
    super(Card, dataSource);
    this.deck = this.createBelongsToAccessorFor('deck', deckRepositoryGetter,);
    this.registerInclusionResolver('deck', this.deck.inclusionResolver);
  }
}
