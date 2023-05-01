// ItemService.ts
import { Repository } from 'typeorm';
import Item from './Item';

/**
 * Item service is responsible for handling the Item entity.
 * It provides methods to interact with Items in the database.
 */
export default class ItemService {
    private _itemRepository: Repository<Item>;

  constructor(itemRepository: Repository<Item>) {
    this._itemRepository = itemRepository;
  }

  /**
   * Get all items.
   */
  async getAllItems(): Promise<Item[]> {
    return this._itemRepository.find();
  }

  /**
   * Get an item by id.
   * @param id The item ID.
   */
  async getItemById(id: number): Promise<Item | null> {
    return this._itemRepository.findOne({ where:{ item_id: id } });
  }

  /**
   * Insert an item.
   * @param item The item to insert.
   */
  async insertItem(item: Item): Promise<Item> {
    return this._itemRepository.save(item);
  }
}
