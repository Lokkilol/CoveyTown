import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("Shop")
export default class Shop {
  @PrimaryColumn({ type: "int" })
  vendor_id: number;

  @PrimaryColumn({ type: "int" })
  item_id: number;

  @Column({ type: "varchar", length: 40 })
  item_name: string;

  @Column({ type: "int" })
  quantity: number;

  constructor(vendor_id: number, item_id: number, item_name: string, quantity: number) {
    this.vendor_id = vendor_id;
    this.item_id = item_id;
    this.item_name = item_name;
    this.quantity = quantity;
  }
}