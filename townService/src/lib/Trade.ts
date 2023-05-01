export default class TradeOffer {
  private readonly _tradeId: number;

  private readonly _sellerId: string;

  private readonly _itemId: number;

  private readonly _requestedPrice: number;

  private readonly _createdDate: Date;

  private _buyerId?: string;

  private _completedDate?: Date;

  private _fulfilled: boolean;

  public constructor(tradeId: number, sellerId: string, itemId: number, requestedPrice: number) {
    this._tradeId = tradeId;
    this._sellerId = sellerId;
    this._itemId = itemId;
    this._requestedPrice = requestedPrice;
    this._createdDate = new Date();

    this._buyerId = undefined;
    this._completedDate = undefined;
    this._fulfilled = false;
  }

  get tradeId(): number {
    return this._tradeId;
  }

  get sellerId(): string {
    return this._sellerId;
  }

  get itemId(): number {
    return this._itemId;
  }

  get requestedPrice(): number {
    return this._requestedPrice;
  }

  get createdDate(): Date {
    return this._createdDate;
  }

  get buyerId(): string | undefined {
    return this._buyerId;
  }

  set buyerId(buyerId: string | undefined) {
    this._buyerId = buyerId;
  }

  get completedDate(): Date | undefined {
    return this._completedDate;
  }

  set completedDate(date: Date | undefined) {
    this._completedDate = date;
  }

  get fulfilled(): boolean {
    return this._fulfilled;
  }

  set fulfilled(fulfilled: boolean) {
    this._fulfilled = fulfilled;
  }

  completeTrade() {
    this._fulfilled = true;
  }
}