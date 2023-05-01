/* eslint-disable @typescript-eslint/naming-convention */
// Inventory.ts
import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
  } from 'typeorm';
import type User from './User';  

@Entity('Inventory')
export default class Inventory {
    @PrimaryColumn({ type: 'varchar', length: 40 })
    user_id: string;

    @Column({ type: 'int'})
    item_id: number;

    // We would ideally want this to popualte from the Item class based on the itemId.
    // TODO: Justify if this should be a ? field bc it will be populated later?
    @Column({ type: 'varchar', length: 40 })
    item_name: string;

    @PrimaryColumn({ type: 'int' })
    slot: number;

    @Column({ type: 'int' })
    quantity: number;
  
    @ManyToOne('User', (user: User) => user.inventory)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    constructor(user_id: string, item_id: number, itemName: string, slot: number, quantity: number) {
        this.user_id = user_id;
        this.item_id = item_id;
        this.item_name = itemName;
        this.slot = slot;
        this.quantity = quantity;
    }
}