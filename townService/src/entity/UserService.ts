// UserService.ts
import { Repository } from 'typeorm';
import User from './User';
import Town from '../town/Town';
import InvalidParametersError from '../lib/InvalidParametersError';


/**
 * UserService is responsible for handling the User entity.
 * It provides methods to interact with the User in the database.
 */
export default class UserService {
  private _userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this._userRepository = userRepository;
  }

  /** Async function that uses typeORM relational mapping to update or save a User
   * with a given User object.
   * @param user - The user to update or save
   * @returns User The updated user.
   */
  async updateUser(user: User): Promise<User> {
    await this._userRepository.save(user);
    return user;
  }


  /** Async function that uses typeORM relational mapping to grab a User
   * based on their userName.
   * @param userName - The userName of the user to grab.
   * @throws InvalidParametersError Error if the user is not found.
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this._userRepository.findOne({ where: { username } });
    if (user) {
      return user;
    }
    throw new InvalidParametersError(`User with username ${username} not found.`);
  }
  
  /** Async function that uses typeORM relational mapping to grab a User
   * based on their userId.
   * @param userId - The userId of the user to grab.
   * @throws InvalidParametersError Error if the user is not found.
   * @returns User The user with the given userId.
   */
    async findByUserId(userId: string): Promise<User> {
        const user = await this._userRepository.findOne({ where: { user_id: userId } });
        if (user) {
            return user;
        }
        throw new InvalidParametersError(`User with user_id ${userId} not found.`);
    }

  /** Async function that uses typeORM relational mapping to increment User's currency
   *  based on their userId.
   * @param userId - The userId of the user to increment the currency of.
   * @param incrementBy - The amount to increment the user's currency by.
   * @throws InvalidParametersError Error if the user is not found.
   * @returns number The new currency amount of the user.
   */
  async incrementCurrency(user: User, incrementBy: number, curTown?: Town): Promise<number> {    
    user.setCurrency(user.getCurrency() + incrementBy);
    await this._userRepository.save(user);
    return user.getCurrency(curTown);
  }

  /** Async function that uses typeORM relational mapping to set User's currency to 
   * a specific amount based on their userId.
   * @param userId - The userId of the user to set the currency of.
   * @param newCurrency - The new currency amount to set the user's currency to.
   * @throws InvalidParametersError Error if the user is not found.
   * @returns number The new currency amount of the user.
   */
  async setCurrency(user: User, newCurrency: number, curTown?: Town): Promise<number> {
    user.setCurrency(newCurrency);
    await this._userRepository.save(user);
    return user.getCurrency(curTown);
  }

  /** Async function that uses typeORM mapping to find a user's username by their userId.
   * @param userId - The userId of the user to find the username of.
   */
  async getUsername(userId: string): Promise<string> {
    const user = await this._userRepository.findOne({ where: { user_id: userId } });
    if (user) {
      return user.username;
    }
    return '';
  }

  // /** Async function that uses typeORM relational mapping to get User's 
  //  * currency based on their userId.
  //  * @param curTown - The town that the user is in to fire an updated currency event.
  //  * @param userId - The userId of the user to get the currency of.
  //  * @returns The currency and userId of the user.
  //  * @throws InvalidParametersError Error if the user is not found.
  //  */
  // async getCurrency(curTown: Town , userId: string): Promise<CurrencyResponse> {
  //   const userRepository = appDataSource.getRepository(User);
  //   const user = await userRepository.findOne({ where: { user_id: userId } });
  //   if (user) {
  //     const newCurrency = user.getCurrency();
  //     const currencyResponse = {userID: userId, coins: newCurrency}
  //     user.currencyChangedEvent(curTown);
  //     return currencyResponse;
  //   }
  //   throw new InvalidParametersError(`User not found with user_id: ${userId}`);
  // }
}

