/* eslint-disable @typescript-eslint/naming-convention */
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Repository,
    OneToMany,
} from 'typeorm';
import Town from '../town/Town';
import type Inventory from './Inventory';

@Entity('User')
export default class User {
  // user_id is the primary key for the User table and must be publicy accessible
  @PrimaryColumn({ type: 'varchar', length: 50 })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  private first_name: string;

  @Column({ type: 'varchar', length: 50 })
  private last_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  private email: string;

  @Column({ name: 'currency' })
  private currency: number;

  @CreateDateColumn({ type: 'datetime', precision: null, name: 'created_date', default: () => 'CURRENT_TIMESTAMP' })
  private created_date: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: null, name: 'last_login', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  last_login: Date;

  @Column({ name: 'login_streak' })
  login_streak: number;

  @Column({ name: 'username' })
  username: string;

  @OneToMany('Inventory', (inventory: Inventory) => inventory.user)
  inventory!: Inventory;
  
  constructor(firstName: string, lastName: string, email: string, id: string, username: string) {
    this.user_id = id;
    this.first_name = firstName;
    this.last_name = lastName;
    this.email = email;
    this.created_date = new Date();

    this.currency = 0;
    this.last_login = new Date();
    this.login_streak = 0;
    this.username = username;
  }

  getCurrency(town?: Town) :number {
    if (town) {
      town.updateCurrency({ userID: this.user_id, coins: this.currency });
    }
    return this.currency;
  }

  setCurrency(newCurrency: number) :void {
    this.currency = newCurrency;
  }
}