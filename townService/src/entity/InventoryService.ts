/* eslint-disable no-await-in-loop */
// InventoryService.ts
import { Repository } from 'typeorm';
import Inventory from './Inventory';
import InvalidParametersError from '../lib/InvalidParametersError';

/**
 * InventoryService is responsible for handling the Inventory entity.
 * It provides methods to interact with the Inventory in the database.
 */
export default class InventoryService {
  private _inventoryRepository: Repository<Inventory>;

  constructor(inventoryRepository: Repository<Inventory>) {
    this._inventoryRepository = inventoryRepository;
  }

  /**
   * Retrieves an Inventory item based on user_id, item_id, and slot.
   * @param user_id The user's ID.
   * @param item_id The item's ID.
   * @param slot The item's slot.
   * @returns The Inventory item if found, otherwise undefined.
   */
  async getItem(user_id: string, item_id: number, slot: number): Promise<Inventory | null> {
    return this._inventoryRepository.findOne({ where:{ user_id, item_id, slot } });
  }

  /**
   * Adds a new item to the Inventory.
   * @param inventoryItem The Inventory item to be added.
   * @returns The added Inventory item.
   */
  async addItem(inventoryItem: Inventory): Promise<Inventory> {
    return this._inventoryRepository.save(inventoryItem);
  }

  /**
   * Get the next available slot for a user's inventory and adds given item to that slot.
   */
  async addItemToNextAvailableSlot(user_id: string, item_id: number, itemName: string): Promise<Inventory> {
    const inventoryItems = await this.getUserInventoryByUserId(user_id);
    // finds the next available slot as inventoryItems have a slot number between 1 and x. So find the first slot number that is not in the array.
    // if the array is empty, then the next available slot is 1.
    // array is not ordered with respect to slot number, so we need to sort it first.
    inventoryItems.sort((a, b) => a.slot - b.slot);
    const nextAvailableSlot = inventoryItems.reduce((acc, curr) => {
      if (acc === curr.slot) {
        return acc + 1;
      }
      return acc;
    }, 0);
    
    const inventoryItem = new Inventory(user_id, item_id, itemName, nextAvailableSlot, 1);
    return this._inventoryRepository.save(inventoryItem);
  }
  
   /**
   * Updates an existing Inventory item.
   * @param inventoryItem The Inventory item to be updated.
   * @returns The updated Inventory item.
   */
  async updateItem(inventoryItem: Inventory): Promise<Inventory> {
    await this._inventoryRepository.save(inventoryItem);
    return inventoryItem;
  }

  /**
   * Removes an Inventory item based on user_id, item_id, and slot.
   * @param user_id The user's ID.
   * @param item_id The item's ID.
   * @param slot The item's slot.
   */
  async removeItem(user_id: string, item_id: number, slot: number): Promise<void> {
    await this._inventoryRepository.delete({ user_id, item_id, slot });
  }

  /**
   * Retrieves the Inventory for a specific user based on user_id.
   * @param user_id The user's ID.
   * @returns An array of Inventory items for the user.
   */
  async getUserInventoryByUserId(user_id: string): Promise<Inventory[]> {
    return this._inventoryRepository.find({ where:{ user_id } });
  }

    /**
   * Retrieves all inventory items for all users.
   * @returns An array of all Inventory items.
   */
  async getAllInventories(): Promise<Inventory[]> {
    return this._inventoryRepository.find();
  }

  /**
   * Trades items between two users.
   * @param user1Id The ID of the first user.
   * @param user2Id The ID of the second user.
   * @param user1Items The inventory items the first user is trading.
   * @param user2Items The inventory items the second user is trading.
   */
  async tradeItems(
    user1Id: string,
    user2Id: string,
    user1Items: { item_id: string; quantity: number }[],
    user2Items: { item_id: string; quantity: number }[],
  ): Promise<void> {
    throw Error('Not implemented');
  }

  /**
   * Gets item at a specific slot for a user.
   * @param user_id The user's ID.
   * @param slot The slot number.
   * @returns The Inventory item if found, otherwise undefined.
   * @throws Error if more than one item is found.
   */
  async getItemAtSlot(user_id: string, slot: number): Promise<Inventory | null> {
    const inventoryItems = await this._inventoryRepository.find({ where:{ user_id, slot } });
    if (inventoryItems.length > 1) {
      throw new InvalidParametersError('More than one item found at slot');
    }
    if (inventoryItems.length === 0) {
      return null;
    }
    return inventoryItems[0];
  }
}
