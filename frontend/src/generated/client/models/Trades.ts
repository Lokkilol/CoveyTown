/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Trades = {
    trade_id?: number;
    item_id: number;
    buyer_id?: string;
    seller_id: string;
    requested_price: number;
    fulfilled: number;
    created_date?: string;
    completed_date?: string;
    user_name?: string;
    item_name?: string;
};
