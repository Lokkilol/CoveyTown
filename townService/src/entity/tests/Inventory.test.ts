import { Repository } from 'typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import Inventory from '../Inventory';
import InventoryService from '../InventoryService';

describe('InventoryService', () => {
    let inventoryRepository: MockProxy<Repository<Inventory>>;
    let inventoryService: InventoryService;

    let mockInventoryItem: Inventory;
    let mockItemToAdd: Inventory;
    beforeEach(() => {
        inventoryRepository = mock<Repository<Inventory>>();
        inventoryService = new InventoryService(inventoryRepository);
        mockInventoryItem = new Inventory('64348a7e9166a60d7f039082', 1, 'Apple', 1, 1);
        mockItemToAdd = new Inventory('64348a7e9166a60d7f039082', 1, 'Apple', 10, 1);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getItem', () => {
        it('should return an Inventory item if found', async () => {
            inventoryRepository.findOne.mockResolvedValue(mockInventoryItem);

            const result = await inventoryService.getItem('user_id', 1, 1);
            expect(result).toBe(mockInventoryItem);
            expect(inventoryRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 'user_id', item_id: 1, slot: 1 } });
        });

        it('should return null if the Inventory item is not found', async () => {
            inventoryRepository.findOne.mockResolvedValue(null);

            const result = await inventoryService.getItem('1', 1, 1);
            expect(result).toBeNull();
            expect(inventoryRepository.findOne).toHaveBeenCalledWith({ where: { user_id: '1', item_id: 1, slot: 1 } });
        });
    });

    // describe('addItem', () => {
    //     it('should add a new Inventory item', async () => {
    //         inventoryRepository.save.mockResolvedValue(mockInventoryItem);

    //         const result = await inventoryService.addItem(mockInventoryItem);
    //         expect(result).toBe(mockInventoryItem);
    //         expect(inventoryRepository.save).toHaveBeenCalledWith(mockInventoryItem);
    //     });
    // });

    describe('updateItem', () => {
        it('should update an existing Inventory item', async () => {
            inventoryRepository.save.mockResolvedValue(mockInventoryItem);
            const result = await inventoryService.updateItem(mockInventoryItem);
            expect(result).toBe(mockInventoryItem);
            expect(inventoryRepository.save).toHaveBeenCalledWith(mockInventoryItem);
        });
    });

    describe('removeItem', () => {
        it('should remove an Inventory item', async () => {
            inventoryRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
            
            inventoryService.addItem(mockItemToAdd);

            await inventoryService.removeItem(mockItemToAdd.user_id, mockItemToAdd.item_id, mockItemToAdd.slot);
            expect(inventoryRepository.delete).toHaveBeenCalledWith({ user_id: '64348a7e9166a60d7f039082', item_id: 1, slot: 10 });
        });
    });

    describe('getUserInventoryByUserId', () => {
        it('should retrieve the Inventory for a specific user', async () => {
            const mockInventoryItems = [mockInventoryItem];
            inventoryRepository.find.mockResolvedValue(mockInventoryItems);

            const result = await inventoryService.getUserInventoryByUserId(mockInventoryItem.user_id);
            expect(result).toEqual(mockInventoryItems);
            expect(inventoryRepository.find).toHaveBeenCalledWith({ where: { user_id: '64348a7e9166a60d7f039082' } });
        });
    });
});
