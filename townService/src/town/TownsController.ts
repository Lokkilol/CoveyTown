/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable consistent-return */
import assert from 'assert';
import {
  Body,
  Controller,
  Delete,
  Example,
  Get,
  Header,
  Patch,
  Path,
  Post,
  Response,
  Route,
  Tags,
} from 'tsoa';
import { Connection, RowDataPacket, createConnection } from 'mysql2';

import {
  CreateItem,
  GetResponse,
  Town,
  TownCreateParams,
  TownCreateResponse,
  CurrencyResponse,
} from '../api/Model';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyTownsStore from '../lib/TownsStore';
import {
  ConversationArea,
  CoveyTownSocket,
  TownSettingsUpdate,
  ViewingArea,
  PosterSessionArea,
  TradeResponse,
  CreateTrade,
  AddItemToInventoryRequest,
} from '../types/CoveyTownSocket';
import PosterSessionAreaReal from './PosterSessionArea';
import { isPosterSessionArea } from '../TestUtils';
import appDataSource from '../entity/DataSource';
import UserService from '../entity/UserService';
import User from '../entity/User';
import InventoryService from '../entity/InventoryService';
import Inventory from '../entity/Inventory';
import ItemService from '../entity/ItemService';
import Item from '../entity/Item';
import TradesService from '../entity/Trades/TradesService';
import ShopService from '../entity/Shop/ShopService';
import Shop from '../entity/Shop/Shop';
import Trades from '../entity/Trades/Trades';

/**
 * This is the town route
 */
@Route('towns')
@Tags('towns')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class TownsController extends Controller {
  private _townsStore: CoveyTownsStore = CoveyTownsStore.getInstance();

  private _userService: UserService;

  private _inventoryService: InventoryService;

  private _itemService: ItemService;

  private _shopService: ShopService;

  private _tradeService: TradesService; 


  constructor(userService?: UserService , inventoryService?: InventoryService, itemService?: ItemService, shopService?: ShopService, tradeService?: TradesService) {
    super();
    this._userService = userService || new UserService(appDataSource.getRepository(User));
    this._inventoryService = inventoryService || new InventoryService(appDataSource.getRepository(Inventory));
    this._itemService = itemService || new ItemService(appDataSource.getRepository(Item));
    this._shopService = shopService || new ShopService(appDataSource.getRepository(Shop));
    this._tradeService = tradeService || new TradesService(appDataSource.getRepository(Trades));
  }

  /**
   * List all towns that are set to be publicly available
   *
   * @returns list of towns
   */
  @Get()
  public async listTowns(): Promise<Town[]> {
    return this._townsStore.getTowns();
  }

  /**
   * Create a new town
   *
   * @param request The public-facing information for the new town
   * @example request {"friendlyName": "My testing town public name", "isPubliclyListed": true}
   * @returns The ID of the newly created town, and a secret password that will be needed to update or delete this town.
   */
  @Example<TownCreateResponse>({ townID: 'stringID', townUpdatePassword: 'secretPassword' })
  @Post()
  public async createTown(@Body() request: TownCreateParams): Promise<TownCreateResponse> {
    const { townID, townUpdatePassword } = await this._townsStore.createTown(
      request.friendlyName,
      request.isPubliclyListed,
      request.mapFile,
    );
    return {
      townID,
      townUpdatePassword,
    };
  }

  @Get('/shop')
  public async getShopItems(): Promise<GetResponse> {
    const con = await createConnection({
      host: 'database-covey.cvrntxiomkd2.us-east-1.rds.amazonaws.com',
      port: 3306,
      user: 'masterUsername',
      password: 'YfpDUmz7d3T4WA74C3v3qP',
      database: 'CoveyTown',
    });

    return new Promise<{ statusCode: number; items?: any }>(resolve => {
      con.connect(err => {
        if (err) throw err;
        const sql = `SELECT * FROM Shop`;
        con.query(sql, (error, result) => {
          if (error) {
            resolve({
              statusCode: 404,
            });
          } else {
            con.end();
            resolve({
              statusCode: 200,
              items: result,
            });
          }
        });
      });
    });

  }

  /**
   * Updates an existing town's settings by ID
   *
   * @param townID  town to update
   * @param townUpdatePassword  town update password, must match the password returned by createTown
   * @param requestBody The updated settings
   */
  @Patch('{townID}')
  @Response<InvalidParametersError>(400, 'Invalid password or update values specified')
  public async updateTown(
    @Path() townID: string,
    @Header('X-CoveyTown-Password') townUpdatePassword: string,
    @Body() requestBody: TownSettingsUpdate,
  ): Promise<void> {
    const success = this._townsStore.updateTown(
      townID,
      townUpdatePassword,
      requestBody.friendlyName,
      requestBody.isPubliclyListed,
    );
    if (!success) {
      throw new InvalidParametersError('Invalid password or update values specified');
    }
  }

  /**
   * Deletes a town
   * @param townID ID of the town to delete
   * @param townUpdatePassword town update password, must match the password returned by createTown
   */
  @Delete('{townID}')
  @Response<InvalidParametersError>(400, 'Invalid password or update values specified')
  public async deleteTown(
    @Path() townID: string,
    @Header('X-CoveyTown-Password') townUpdatePassword: string,
  ): Promise<void> {
    const success = this._townsStore.deleteTown(townID, townUpdatePassword);
    if (!success) {
      throw new InvalidParametersError('Invalid password or update values specified');
    }
  }

  /**
   * Creates a conversation area in a given town
   * @param townID ID of the town in which to create the new conversation area
   * @param sessionToken session token of the player making the request, must match the session token returned when the player joined the town
   * @param requestBody The new conversation area to create
   */
  @Post('{townID}/conversationArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createConversationArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: ConversationArea,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town?.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid values specified');
    }
    const success = town.addConversationArea(requestBody);
    if (!success) {
      throw new InvalidParametersError('Invalid values specified');
    }
  }

  /**
   * Creates a viewing area in a given town
   *
   * @param townID ID of the town in which to create the new viewing area
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody The new viewing area to create
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          viewing area could not be created
   */
  @Post('{townID}/viewingArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createViewingArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: ViewingArea,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    if (!town?.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid values specified');
    }
    const success = town.addViewingArea(requestBody);
    if (!success) {
      throw new InvalidParametersError('Invalid values specified');
    }
  }

  /**
   * Creates a poster session area in a given town
   *
   * @param townID ID of the town in which to create the new poster session area
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody The new poster session area to create
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session area could not be created
   */
  @Post('{townID}/posterSessionArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createPosterSessionArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: PosterSessionArea,
  ): Promise<void> {
    // download file here TODO
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    // add viewing area to the town, throw error if it fails
    if (!curTown.addPosterSessionArea(requestBody)) {
      throw new InvalidParametersError('Invalid poster session area');
    }
  }

  /**
   * Gets the image contents of a given poster session area in a given town
   *
   * @param townID ID of the town in which to get the poster session area image contents
   * @param posterSessionId interactable ID of the poster session
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session specified does not exist
   */
  @Patch('{townID}/{posterSessionId}/imageContents')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async getPosterAreaImageContents(
    @Path() townID: string,
    @Path() posterSessionId: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<string | undefined> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const posterSessionArea = curTown.getInteractable(posterSessionId);
    if (!posterSessionArea || !isPosterSessionArea(posterSessionArea)) {
      throw new InvalidParametersError('Invalid poster session ID');
    }
    return posterSessionArea.imageContents;
  }

  /**
   * Increment the stars of a given poster session area in a given town, as long as there is
   * a poster image. Returns the new number of stars.
   *
   * @param townID ID of the town in which to get the poster session area image contents
   * @param posterSessionId interactable ID of the poster session
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session specified does not exist, or if the poster session specified
   *          does not have an image
   */
  @Patch('{townID}/{posterSessionId}/incStars')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async incrementPosterAreaStars(
    @Path() townID: string,
    @Path() posterSessionId: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<number> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const posterSessionArea = curTown.getInteractable(posterSessionId);
    if (!posterSessionArea || !isPosterSessionArea(posterSessionArea)) {
      throw new InvalidParametersError('Invalid poster session ID');
    }
    if (!posterSessionArea.imageContents) {
      throw new InvalidParametersError('Cant star a poster with no image');
    }
    const newStars = posterSessionArea.stars + 1;
    const updatedPosterSessionArea = {
      id: posterSessionArea.id,
      imageContents: posterSessionArea.imageContents,
      title: posterSessionArea.title,
      stars: newStars, // increment stars
    };
    (<PosterSessionAreaReal>posterSessionArea).updateModel(updatedPosterSessionArea);
    return newStars;
  }

  /**
   * Connects a client's socket to the requested town, or disconnects the socket if no such town exists
   *
   * @param socket A new socket connection, with the userName and townID parameters of the socket's
   * auth object configured with the desired townID to join and username to use
   *
   */
  public async joinTown(socket: CoveyTownSocket) {
    // Parse the client's requested username from the connection
    const { userName, townID } = socket.handshake.auth as { userName: string; townID: string };

    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      socket.disconnect(true);
      return;
    }

    // Connect the client to the socket.io broadcast room for this town
    socket.join(town.townID);

    const newPlayer = await town.addPlayer(userName, socket);
        
    assert(newPlayer.videoToken);
    socket.emit('initialize', {
      userID: newPlayer.id,
      sessionToken: newPlayer.sessionToken,
      providerVideoToken: newPlayer.videoToken,
      currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
      friendlyName: town.friendlyName,
      isPubliclyListed: town.isPubliclyListed,
      interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
    });
  }


  /**
   * Gets login streak information for a user in a town.
   * 
   * @param townID ID of the town in which to get the poster session area image contents
   * @param userId ID of the user to get the login streak of
   * 
   * @returns the login streak of the user in the town and the currency awarded for the streak 
   */
  @Get("{userId}/loginStreak/{townID}")
  @Response("200", "Login streak retrieved successfully")
  public async getLoginStreak(
    @Path() userId: string,
    @Path() townID?: string,
  ): Promise<{
    streak: number;
    currencyAwarded: number;
    loggedInToday: boolean;
  }> {
    const user = await this._userService.findByUserId(userId);
    if (!user) {
      throw new InvalidParametersError("User not found");
    }
    if (!townID) {
      return {
        streak: user.login_streak,
        currencyAwarded: 0,
        loggedInToday: true,
      };
    }
    const town = this._townsStore.getTownByID(townID);

    // Using the user's last login time and the day, determine if the user has already logged in today
    const lastLogin = user.last_login;
    const today = new Date();
    const lastLoginDate = new Date(lastLogin);
    const lastLoginDay = lastLoginDate.getDate();
    const lastLoginMonth = lastLoginDate.getMonth();
    const lastLoginYear = lastLoginDate.getFullYear();;
    const hasLoggedInToday = lastLoginDay === today.getDate() && lastLoginMonth === today.getMonth() && lastLoginYear === today.getFullYear();
    if (!hasLoggedInToday) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const hasLoggedInYesterday = lastLoginDay === yesterday.getDate() && lastLoginMonth === yesterday.getMonth() && lastLoginYear === yesterday.getFullYear();

      // If the user has not logged in today, give them currency based on their
      // current login streak. However, if the user has not logged in the previous
      // day, reset their login streak to 1.
      if (!hasLoggedInYesterday) {
        user.login_streak = 1;
      } else {
        user.login_streak += 1;
      }
      const currency = user.login_streak * 10;
      await this._userService.incrementCurrency(user, currency, town);
      user.last_login = today;
      await this._userService.updateUser(user);
      return {
        streak: user.login_streak,
        currencyAwarded: currency,
        loggedInToday: false,
      };
    }
    return {
      streak: user.login_streak,
      currencyAwarded: 0,
      loggedInToday: true,
    };
  }

  
  /** 
   * Distributes currency to a user in a town.
   * 
   * @param townID ID of the town in which to get the poster session area image contents
   * @param userId ID of the user to get the currency of
   * @param sessionToken session token of the player making the request, must
   *       match the session token returned when the player joined the town
   * @param requestBody amount of currency to distribute
   * @returns the currency of the user in the town
   * @throws InvalidParametersError if the session token is not valid, or if the user ID is not valid or if the user is not found
   */
  @Post("{userId}/distribute")
  @Response("200", "Currency distributed successfully")
  public async distributeCurrency(
    @Path() userId: string,
    @Body()
    requestBody: {
      amount: number;
      townID?: string,
    },
  ): Promise<number> {
    const user = await this._userService.findByUserId(userId);
    if (requestBody.townID) {
      const curTown = this._townsStore.getTownByID(requestBody.townID);
      if (!curTown) {
        throw new InvalidParametersError('Invalid town ID');
      }
      return this._userService.incrementCurrency(user, requestBody.amount, curTown);
    }
    return this._userService.incrementCurrency(user, requestBody.amount);
  }

  /**
   * Gets the currency of a player.
   * 
   * @param townID ID of the town of the user if player in game
   * @param userId ID of the user to get the currency of
   * @returns 
   */
  @Get("{userId}/coins/{townID}")
  @Response("200", "User's currency retrieved successfully")
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async getCurrency(
    @Path() userId: string,
    @Path() townID?: string,
  ): Promise<CurrencyResponse> {
    const user = await this._userService.findByUserId(userId);
    if (!user) {
      return { 
        userID: userId,
        coins: 0,
      }
    }
    if (townID) {
      const curTown = this._townsStore.getTownByID(townID);
      if (!curTown) {
        throw new InvalidParametersError('Invalid town ID');
      }
      return {
        userID: user.user_id,
        coins: user.getCurrency(curTown),
      };
    } 
    return {
      userID: user.user_id,
      coins: user.getCurrency(),
    };
  }

  
  @Get('/inventory/')
  public async getInventories(): Promise<GetResponse> {
    const inventories = await this._inventoryService.getAllInventories();
    if (inventories) {
      return {
        statusCode: 200,
        items: inventories,
      };
    }
    return {
      statusCode: 404,
    };
  }

  @Get('/users/{userId}')
  public async getUserName(
    @Path() userId: string,
    ) : Promise<string> {
      const username = await this._userService.getUsername(userId);
      return username;
    }


  @Get('/inventory/{userId}/{townID}')
  public async getInventoryByUserId(
    @Path() userId: string,
    @Path() townID?: string,
    ): Promise<GetResponse> {
      const inventory = await this._inventoryService.getUserInventoryByUserId(userId);
      if (inventory) {    
        if (townID) {
          const curTown = this._townsStore.getTownByID(townID);
          if (!curTown) {
            throw new InvalidParametersError('Invalid town ID');
          }
          curTown.updateInventory({ userID: userId, items: inventory });
        }
        return {
            statusCode: 200,
            items: inventory,
        };
      }
      return {
        statusCode: 404,
      }
  }

  @Get('/item/')
  public async getAllItems(): Promise<GetResponse> {
    const items = await this._itemService.getAllItems();
    if (items) {
      return {
        statusCode: 200,
        items,
      };
    }
    return {
      statusCode: 404,
    };
  }

  @Get('/item/{itemId}')
  public async getItemById(
    itemId: number,
  ): Promise<{ statusCode: number; message: string; data?: any }> {
    const item = await this._itemService.getItemById(itemId);
    if (item) {
      return {
        statusCode: 200,
        message: `Successfully retrieved item with itemId: ${itemId}.`,
        data: item,
      };
    }
    return {
      statusCode: 404,
      message: `Could not retrieve item with itemId: ${itemId}. Please try a different itemId.`,
    };
  }

  @Example<CreateItem>({ item_id: 1, name: 'apple', cost: 10, sellPrice: 5 })
  @Post('/item')
  public async insertItemIntoDB(
    @Body() request: CreateItem,
  ): Promise<{ statusCode: number; message: string }> {
    const newItem = new Item(request.item_id, request.name, request.cost, request.sellPrice);
    const itemCreated = await this._itemService.insertItem(newItem);
    if (itemCreated) {
      return {
        statusCode: 200,
        message: `Successfully created item with itemId: ${request.item_id}, item name: ${request.name}, cost: ${request.cost}, and sell price: ${request.sellPrice}.`,
      };
    }
    return {
      statusCode: 404,
      message: `Could not create item with itemId: ${request.item_id}. Please try a different itemId.`,
    };
  }

  // @Example<CreateTrade>({ trade_id: 1, seller_id: 'abc', item_id: 1, requested_price: 10 })
  @Post('/trade/')
  @Response("200", "Trade created successfully")
  @Response<InvalidParametersError>(400, 'Invalid values specified or multiple items at slot')
  public async createTrade(
    @Body() request: {trade: CreateTrade, slot: number},
  ): Promise<{ statusCode: number; message: string }> {
    const {trade, slot} = request;
    const item = await this._inventoryService.getItemAtSlot(trade.seller_id, slot);
    if (!item) {
      return {
        statusCode: 404,
        message: `Could not find item at slot ${slot} for user ${trade.seller_id}.`,
      };
    }
    if (item.item_id !== trade.item_id) {
      return {
        statusCode: 404,
        message: `Item at slot ${slot} for user ${trade.seller_id} does not match item_id ${trade.item_id}.`,
      };
    }
    await this._inventoryService.removeItem(trade.seller_id, trade.item_id, slot);

    const newTrade = new Trades(trade.trade_id, trade.item_id, trade.seller_id, trade.requested_price);
    await this._tradeService.addTrade(newTrade); // add trade to the trade service

    this._townsStore.getTowns().forEach(async town => {
      const curTown = this._townsStore.getTownByID(town.townID);
      if (!curTown) {
        throw new InvalidParametersError('Invalid town ID');
      }
      const allTrades = await this._tradeService.getAllTrades()
      curTown.updateTrades(allTrades.filter(trade => trade.fulfilled === 0) );
      const inventory = await this._inventoryService.getUserInventoryByUserId(trade.seller_id)
      curTown.updateInventory({items: inventory, userID: trade.seller_id});
    })

    return {
      statusCode: 200,
      message: `Successfully created trade with tradeId: ${trade.trade_id}, item id: ${trade.item_id}, seller id: ${trade.seller_id}, and requested price: ${trade.requested_price}.`,
    };
  }

  @Get('/trade/')
  public async getAllTrades(): Promise<{statusCode: number , trades: Trades[]}> {
    const trades = await this._tradeService.getAllTrades();
    if (trades) {
      return {
        statusCode: 200,
        trades,
      };
    }
    return {
      statusCode: 404,
      trades: [],
    };
  }

  @Get('/trade/active/')
  public async getActiveTrades(): Promise<{statusCode: number , trades: Trades[]}> {
    const trades = await this._tradeService.getAllTrades();
    if (trades) {
      return {
        statusCode: 200,
        trades: trades.filter(trade => trade.fulfilled === 0),
      };
    }
    return {
      statusCode: 404,
      trades: [],
    };
  }

  @Patch('/trade/accept/{tradeID}/{buyer_id}')
  public async acceptTrade(
    @Path() tradeID: number,
    @Path() buyer_id: string,
  ): Promise<TradeResponse> {
    
    const trade = await this._tradeService.getTradeById(tradeID);
    if (trade) {
      trade.buyer_id = buyer_id;
      const buyer = await this._userService.findByUserId(trade.buyer_id);
      const seller = await this._userService.findByUserId(trade.seller_id);
      const item = await this._itemService.getItemById(trade.item_id);
      if (buyer && seller && item) {
        if (buyer.getCurrency() >= trade.requested_price) {
          await this._userService.incrementCurrency(buyer, -trade.requested_price);
          await this._userService.incrementCurrency(seller, trade.requested_price);
          
          this._inventoryService.addItemToNextAvailableSlot(trade.buyer_id, item.item_id, item.item_name);
          trade.fulfilled = 1;
          trade.buyer_id = buyer_id;
          trade.completed_date = new Date();
          await this._tradeService.updateTrade(trade);
          this._townsStore.getTowns().forEach(async town => {
            const curTown = this._townsStore.getTownByID(town.townID);
            if (!curTown) {
              throw new InvalidParametersError('Invalid town ID');
            }
            const allTrades = await this._tradeService.getAllTrades()
            await curTown.updateTrades(allTrades.filter(trade => trade.fulfilled === 0) );
            curTown.updateCurrency({userID: buyer_id, coins: buyer.getCurrency()});
            curTown.updateCurrency({userID: seller.user_id, coins: seller.getCurrency()});
          });
          return {
            statusCode: 200,
            tradeId: tradeID,
          };
        }
      }
    }
    return {
      statusCode: 404,
    };
  }

  @Post('addToInventory')
  public async addToInventory(
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: AddItemToInventoryRequest,
  ): Promise<void> {
    const item = new Inventory(requestBody.user_id, requestBody.item_id, requestBody.item_name, requestBody.slot, 1);
    const itemAdded = await this._inventoryService.addItem(item);
  }
}
