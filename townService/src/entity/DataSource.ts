
import { DataSource } from "typeorm"
import User from './User'
import Inventory from "./Inventory"
import Item from "./Item"
import Shop from "./Shop/Shop"
import Trades from "./Trades/Trades"

const appDataSource = new DataSource({
    type: "mysql",
    host: 'database-covey.cvrntxiomkd2.us-east-1.rds.amazonaws.com',
    port: 3306,
    username: 'masterUsername',
    password: 'YfpDUmz7d3T4WA74C3v3qP',
    database: 'CoveyTown',
    entities: [User, Inventory, Item, Shop, Trades], // Include entities here
    synchronize: false,
})

appDataSource.initialize()

export default appDataSource;