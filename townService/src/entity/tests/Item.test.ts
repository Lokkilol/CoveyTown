import { Repository } from 'typeorm';
import { mock, MockProxy } from 'jest-mock-extended';

import ItemService from '../ItemService';
import Item from '../Item';

describe('ItemService', () => {
    let itemService: ItemService;
    let itemRepository: MockProxy<Repository<Item>>;
    let mockItem: Item;

    beforeEach(() => {
        itemRepository = mock<Repository<Item>>();
        itemService = new ItemService(itemRepository);
        mockItem = new Item(1, 'Apple', 10, 5);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    
    // Test for getAllItems method
    describe('getAllItems', () => {
        it('should get all items', async () => {
            const items: Item[] = [
                new Item(1, 'Apple', 10, 5),
                new Item(2, 'Apple Pie', 10, 5),
                new Item(3, 'Peanut Butter Pie', 10, 5),
            ];
            itemRepository.find.mockResolvedValue(items);

            const result = await itemService.getAllItems();
            expect(result[0]).toEqual(items[0]);
            expect(result[1]).toEqual(items[1]);
            expect(result[2]).toEqual(items[2]);
        });
    });

    // Test for getItemById method
    describe('getItemById', () => {
        it('should get an item by ID', async () => {
            itemRepository.findOne.mockResolvedValue(mockItem);

            const result = await itemService.getItemById(1);
            expect(result).toEqual(mockItem);
        });
    });
    
    // Test for insertItem method
    describe('insertItem', () => {
        it('should insert an item', async () => {
            itemRepository.save.mockResolvedValue(mockItem);

            const result = await itemService.insertItem(mockItem);
            expect(result).toEqual(mockItem);
        });
    });
});
