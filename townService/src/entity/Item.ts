/* eslint-disable @typescript-eslint/naming-convention */
import { Column, Entity, PrimaryColumn } from "typeorm";
import { CreateItem } from "../api/Model";

@Entity('Item')
export default class Item {
  @PrimaryColumn({ type: 'int'})
  item_id: number;

  @Column({ type: 'varchar', length: 40 })
  item_name: string;

  @Column({ type: 'int' })
  private cost: number;

  @Column({ type: 'int' })
  private sell_price: number;

  public constructor(item_id: number, item_name: string, cost: number, sell_price: number) {
    this.item_id = item_id;
    this.item_name = item_name;
    this.cost = cost;
    this.sell_price = sell_price;
  }
}
