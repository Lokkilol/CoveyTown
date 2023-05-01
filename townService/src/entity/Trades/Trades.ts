import {
    Entity,
    Column,
    PrimaryColumn,
} from "typeorm";

@Entity("Trades")
export default class Trades {
    @PrimaryColumn({ type: "int" })
    trade_id: number | undefined;

    @Column({ type: "int" })
    item_id: number;

    @Column({ type: "varchar", length: 40 })
    buyer_id?: string;

    @Column({ type: "varchar", length: 40 })
    seller_id: string;

    @Column({ type: "int" })
    requested_price: number;

    @Column({ type: "tinyint", width: 1 })
    fulfilled: number;

    @Column({ type: "datetime" })
    created_date?: Date;

    @Column({ type: "datetime" })
    completed_date?: Date;

    user_name?: string;

    item_name?: string;
    
    constructor(trade_id: number, item_id: number, seller_id: string, requested_price: number, fulfilled?: number, created_date?: Date, buyer_id?: string) {
        this.trade_id = trade_id;
        this.item_id = item_id;
        this.buyer_id = buyer_id;
        this.seller_id = seller_id;
        this.requested_price = requested_price;
        this.fulfilled = fulfilled || 0;
        this.created_date = created_date || new Date();
    }
}
