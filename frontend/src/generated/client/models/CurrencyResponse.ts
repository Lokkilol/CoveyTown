/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The return type for the getCurrency API call
 */
export type CurrencyResponse = {
    /**
     * userId of the player
     */
    userID: string;
    /**
     * The amount of currency the player has
     */
    coins: number;
};
