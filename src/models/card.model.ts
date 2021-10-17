import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Deck} from './deck.model';

@model()
export class Card extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  value: string;

  @property({
    type: 'string',
    required: true,
  })
  suit: string;

  @property({
    type: 'string',
    required: true,
  })
  code: string;

  @belongsTo(() => Deck)
  deckId: string;

  constructor(data?: Partial<Card>) {
    super(data);
  }
}

export interface CardRelations {
  // describe navigational properties here
}

export type CardWithRelations = Card & CardRelations;
