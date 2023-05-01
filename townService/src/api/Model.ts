/**
 * The public-facing model that represents a town. More information about the town
 * is available for users who join it.
 */
export interface Town {
  /**
   * The name that users see on the landing page to determine which town to join
   */
  friendlyName: string;
  /**
   * An internal ID that is used to uniquely identify each town
   */
  townID: string;
  /**
   * The current number of players in this town
   */
  currentOccupancy: number;
  /**
   * The maximum number of players allowed in this town
   */
  maximumOccupancy: number;
}

/**
 * Payload that is sent back to a client upon creating a town
 */
export interface TownCreateResponse {
  /**
   * The ID of the newly created town. This ID is needed to join the town.
   */
  townID: string;
  /**
   * An "Update password" for the newly created town. This password is needed to update or delete the town.
   */
  townUpdatePassword: string;
}

/**
 * Payload that is sent to call an sql method to insert a user into a database
 */
export interface CreateUserDB {
  user_id: string;
  email: string;
}

export interface CreateItem {
  item_id: number;
  name: string;
  cost: number;
  sellPrice: number;
}

/**
 * The return type for the getCurrency API call
 */
export interface CurrencyResponse {
  /**
   * userId of the player
   */
  userID: string;
  /**
   * The amount of currency the player has
   */
  coins: number;
}

export interface GetResponse {
  statusCode: number;
  userID?: string;
  items?: any;
}

export interface CreateTrade {
  trade_id: number;
  seller_id: string;
  item_id: number;
  requested_price: number;
}

export interface TradeResponse {
  statusCode: number;
  tradeId?: number;
}

 /**
 * Request body that specifies how to create a new town
 */
export interface TownCreateParams {
  /**
   * A "Friendly Name" to use to identify the newly created town, which need not be unique to existing towns names
   */
  friendlyName: string;
  /**
   * Players will identify towns by either knowing the (randomly generated) town ID, or the town ID will be publicly
   * listed along wiht the friendly name of the town. This behavior can be controlled when creating the town by changing
   * this flag.
   */
  isPubliclyListed: boolean;

  /**
   * Reserved for future use, currently only used for testing: this parameter can be
   * specified to control which Tiled map file is used for initializing the set of interactable areas
   *
   * Not currently used on frontend
   */
  mapFile?: string;
}