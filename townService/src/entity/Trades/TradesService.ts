/* eslint-disable no-await-in-loop */
// TradesService.ts
import { Repository } from 'typeorm';
import Trades from './Trades';

/**
 * TradesService is responsible for handling the Trades entity.
 * It provides methods to interact with the Trades in the database.
 */
export default class TradesService {
  private _tradesRepository: Repository<Trades>;

  constructor(tradesRepository: Repository<Trades>) {
    this._tradesRepository = tradesRepository;
  }
  
  /**
   * Get trade by trade_id
   * @param trade_id The trade's ID.
   * @returns The trade if found, otherwise undefined.
   */
  async getTradeById(trade_id: number): Promise<Trades | null> {
    return this._tradesRepository.findOne({ where:{ trade_id } });
  }

  /**
   * Add trade to database
   * @param trade The trade to be added.
   * @returns The added trade.
   */
  async addTrade(trade: Trades): Promise<Trades> {
    trade.trade_id = undefined;
    return this._tradesRepository.save(trade);
  }

  /** 
   * Get all trades from database
   * @returns All trades.
   */
  async getAllTrades(): Promise<Trades[]> {
    return this._tradesRepository.find();
  }

  /**
   * Update trade in database
   * @param trade The trade to be updated.
   * @returns The updated trade.
   */
  async updateTrade(trade: Trades): Promise<Trades> {
    return this._tradesRepository.save(trade);
  }
}