import { Repository } from "typeorm";
import { MockProxy, mock } from "jest-mock-extended";
import User from "../User";
import UserService from "../UserService";
import InvalidParametersError from "../../lib/InvalidParametersError";
import Town from "../../town/Town";



describe("User and UserService", () => {
    let mockUserRepository: MockProxy<Repository<User>>;
    let userService: UserService;
    
    let validUser: User;
    let invalidUser: User;
    let mockTown: Town;
   
    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = mock<Repository<User>>();
        userService = new UserService(mockUserRepository);
        validUser = new User("Test","User", "testuser@test.com", "64348a7e9166a60d7f039082","testuser");
        invalidUser = new User("Invalid","User", "invaliduser@test.com", "1","invaliduser");
        mockTown = mock<Town>();
    });

    // Tests for the User class
    describe("User methods", () => {
        describe("getCurrency", () => {
            it("should return the user's currency", () => {
                expect(validUser.getCurrency()).toEqual(0);
            });
            it("if given a townController, should emit a 'currencyChange' event", () => {
                const currency = validUser.getCurrency(mockTown)
                expect(currency).toEqual(0);
                expect(mockTown.updateCurrency).toHaveBeenCalledWith({ userID: validUser.user_id, coins: currency });
            });
        });
        describe("setCurrency", () => {
            it("should set the user's currency", () => {
                validUser.setCurrency(100);
                expect(validUser.getCurrency()).toEqual(100);
            });
        }); 
    });

    // Tests for the UserService class
    describe("UserService methods", () => {
        describe("updateUser", () => {
            it("valid user should update the user", async () => {
                mockUserRepository.save.mockResolvedValue(validUser);
                const updatedUser = await userService.updateUser(validUser);
                expect(updatedUser).toEqual(validUser);
                expect(mockUserRepository.save).toHaveBeenCalledWith(validUser);
            });
        });
        describe("findByUsername", () => {
            it("valid username should return a user with the given username", async () => {
                mockUserRepository.findOne.mockResolvedValue(validUser);
                const foundUser = await userService.findByUsername("testuser");
                expect(foundUser.user_id).toEqual(validUser.user_id);
                expect(foundUser.username).toEqual(validUser.username);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: "testuser" } });
            });

            it("invalid username(> 15 characters) should throw InvalidParametersError", async () => {
                mockUserRepository.findOne.mockResolvedValue(null);
                await expect(userService.findByUsername("testuser")).rejects.toThrow(InvalidParametersError);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: "testuser" } });
            });
        });
        describe("findByUserId", () => {
            it("valid user-id should return a user with the given user_id", async () => {
                mockUserRepository.findOne.mockResolvedValue(validUser);
                const foundUser = await userService.findByUserId("64348a7e9166a60d7f039082");
                expect(foundUser.user_id).toEqual(validUser.user_id);
                expect(foundUser.username).toEqual(validUser.username);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { user_id: "64348a7e9166a60d7f039082" } });
            });
            it("invalid user id input", async () => {
                mockUserRepository.findOne.mockResolvedValue(null);
                await expect(userService.findByUserId(invalidUser.user_id)).rejects.toThrow(InvalidParametersError);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { user_id: invalidUser.user_id } });
            });
        });
        describe("incrementCurrency", () => {
            it("incrementCurrency for a user not online", async () => {
                validUser.setCurrency(100);
                mockUserRepository.save.mockResolvedValue(validUser);
                const newCurrency = await userService.incrementCurrency(validUser, 50);
                expect(newCurrency).toBe(150);
                expect(mockUserRepository.save).toHaveBeenCalledWith(validUser);
                expect(mockTown.updateCurrency).not.toHaveBeenCalled();
            });

            it("incrementCurrency for a user in a town", async () => {
                validUser.setCurrency(100);
                mockUserRepository.save.mockResolvedValue(validUser);
                const newCurrency = await userService.incrementCurrency(validUser, 50, mockTown);
                expect(newCurrency).toBe(150);
                expect(mockUserRepository.save).toHaveBeenCalledWith(validUser);
                expect(mockTown.updateCurrency).toHaveBeenCalledWith({ userID: validUser.user_id, coins: validUser.getCurrency() });
            });
        });
        describe("setCurrency", () => {
            it("currency set for valid user not in a town", async () => {
                validUser.setCurrency(100);
                mockUserRepository.save.mockResolvedValue(validUser);
                const newCurrency = await userService.setCurrency(validUser, 200);
                expect(newCurrency).toBe(200);
                expect(mockUserRepository.save).toHaveBeenCalledWith(validUser);
                expect(mockTown.updateCurrency).not.toHaveBeenCalled();
            });

            it("currency set for valid user in a town", async () => {
                validUser.setCurrency(100);
                mockUserRepository.save.mockResolvedValue(validUser);
                const newCurrency = await userService.setCurrency(validUser, 200, mockTown);
                expect(newCurrency).toBe(200);
                expect(mockUserRepository.save).toHaveBeenCalledWith(validUser);
                expect(mockTown.updateCurrency).toHaveBeenCalledWith({ userID: validUser.user_id, coins: validUser.getCurrency() });
            });
        });
    });
});
