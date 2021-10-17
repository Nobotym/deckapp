import {
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef, HttpErrors, param, post, requestBody,
  response
} from '@loopback/rest';
import {Card, Deck} from '../models';
import {DeckRepository} from '../repositories';

export class DeckController {
  constructor(
    @repository(DeckRepository)
    public deckRepository: DeckRepository,
  ) { }

  @post('/deck')
  @response(200, {
    description: 'Create a new Deck',
    content: {'application/json': {schema: getModelSchemaRef(Deck)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Deck, {
            title: 'NewDeck',
            exclude: ['deckId', 'remaining'],
          }),
        },
      },
    })
    deck: Omit<Deck, 'deckId'>,
  ): Promise<Deck> {
    return this.deckRepository.createWithCards(deck);
  }

  @get('/deck/{deckId}')
  @response(200, {
    description: 'Open a Deck',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ...getModelSchemaRef(Deck).definitions.Deck.properties,
            cards: {
              type: 'array',
              items: getModelSchemaRef(Card, {exclude: ['id', 'deckId']})
            }
          }
        }
      },
    },
  })
  async findByDeckId(
    @param.path.string('deckId') deckId: string
  ): Promise<Deck> {
    return this.deckRepository.getById(deckId);
  }

  @get('/deck/{deckId}/draw')
  @response(200, {
    description: 'Draw a Card',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            cards: {
              type: 'array',
              items: getModelSchemaRef(Card, {exclude: ['id', 'deckId']})
            }
          },
        },
      },
    },
  })
  @response(400, {
    description: 'Draw a Card',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                statusCode: {
                  type: 'number',
                  default: 400
                },
                name: {
                  type: 'string',
                  default: 'BadRequestError'
                },
                message: {
                  type: 'string',
                  default: 'Deck is over'
                },
              }
            }
          }
        },
      },
    },
  })
  async drawCard(
    @param.path.string('deckId') deckId: string,
    @param.query.number('count', {required: true}) count: number,
  ): Promise<Record<string, Card[]>> {
    const cards = await this.deckRepository.draw(deckId, count);
    await this.deckRepository.findById(deckId);

    if (!cards.cards.length) {
      throw new HttpErrors.BadRequest('Deck is over');
    }

    return cards;
  }
}
