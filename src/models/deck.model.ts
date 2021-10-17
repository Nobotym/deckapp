import {Entity, hasMany, model, property} from '@loopback/repository';
import {Card} from './card.model';

@model()
export class Deck extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    defaultFn: 'uuidv4',
  })
  deckId: string;

  @property({
    type: 'string',
    required: false,
    default: 'FULL',
    jsonSchema: {
      enum: ['FULL', 'SHORT']
    },
  })
  type: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  shuffled: boolean;

  @property({
    type: 'number',
    required: false,
    default: 52
  })
  remaining: number;

  @hasMany(() => Card)
  cards: Card[];

  constructor(data?: Partial<Deck>) {
    super(data);
  }
}

export interface DeckRelations {
  // describe navigational properties here
}

export type DeckWithRelations = Deck & DeckRelations;
