/* eslint-disable no-await-in-loop */
// ShopService.ts
import { Repository } from 'typeorm';
import Shop from './Shop';

/**
 * ShopService is responsible for handling the Shop entity.
 * It provides methods to interact with the Shops in the database.
 */
export default class ShopService {
  private _shopRepository: Repository<Shop>;

  constructor(shopRepository: Repository<Shop>) {
    this._shopRepository = shopRepository;
  }

  // All the necessary shop methods below here
}
