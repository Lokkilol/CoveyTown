import { type } from "os";

export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: Interactable[];
}

export type Interactable = ViewingArea | ConversationArea | PosterSessionArea;

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';
export interface Player {
  id: string;
  userName: string;
  location: PlayerLocation;
};

export interface GetResponse {
  statusCode: number;
  userID?: string;
  items?: any;
}

export interface CurrencyResponse {
  userID: string;
  coins: number;
}

export type ItemDetails = {
  user_id: string;
  item_id: number;
  item_name: string;
  slot: number;
  quantity: number;
}




export type TradeDetails = {
  trade: Trades;
  seller_username: string;
  item_name: string;
}

export type TradeProps = {
  trades: TradeDetails[];
}

export type InventoryProps = {
  items: ItemDetails[];
}
export type ItemWithCost = {
  item_id: number;
  item_name: string;
  cost: number;
  sell_price: number
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

export type AddItemToInventoryRequest = {
    slot: number;
    item_name: string;
    item_id: number;
    user_id: string;
};

export type ItemShopDetails = {
  vendor_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
}

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
  interactableId?: string;
};

export interface ConversationArea {
  id: string;
  topic?: string;
  occupantsByID: string[];
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea {
  id: string;
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export interface PosterSessionArea {
  id: string;
  stars: number;
  imageContents?: string;
  title?: string;
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  currencyUpdate: (currency: CurrencyResponse) => void;
  inventoryChanged: (inventoryResponse : {items: Inventory[], userID: string}) => void;
  tradeChanged: (trades: Trades[]) => void;
  tradeCreated: (tradeCreated: Trades) => void;
  tradeAccepted: (tradeCreated: Trades) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
}