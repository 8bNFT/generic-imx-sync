const server = require("fastify")()
const database = require('better-sqlite3')('database.db', {});

const countCollections = database.prepare('SELECT count(*) as total FROM collections WHERE caught_up = 1 GROUP BY collection')
const countCollectionsForUser = database.prepare('SELECT count(*) as total FROM assets WHERE user = ? GROUP BY collection')

const getCollections = database.prepare('SELECT DISTINCT collection FROM collections WHERE caught_up = 1')
const getCollectionsForUser = database.prepare('SELECT DISTINCT collection FROM assets WHERE user = ?')

const fetchAssetsForUser = database.prepare('SELECT * FROM assets WHERE user = ?')
const fetchAssetsForCollection = database.prepare('SELECT * FROM assets WHERE collection = ?')

const fetchOrders = database.prepare(`
SELECT orders.*, forders.order_id filled_order_id FROM orders LEFT JOIN trades ON trades.b_order_id = orders.order_id OR trades.a_order_id = orders.order_id
LEFT JOIN orders as forders ON (trades.a_order_id = forders.order_id AND forders.order_id != orders.order_id) OR (trades.b_order_id = forders.order_id AND forders.order_id != orders.order_id)
`)


const fetchFilledOrders = database.prepare(`
SELECT orders.*, forders.order_id filled_order_id FROM orders LEFT JOIN trades ON trades.b_order_id = orders.order_id OR trades.a_order_id = orders.order_id
LEFT JOIN orders as forders ON (trades.a_order_id = forders.order_id AND forders.order_id != orders.order_id) OR (trades.b_order_id = forders.order_id AND forders.order_id != orders.order_id)
WHERE orders.status = 'filled'
`)

const fetchOrder = database.prepare(`
SELECT orders.*, forders.order_id filled_order_id FROM orders LEFT JOIN trades ON trades.b_order_id = orders.order_id OR trades.a_order_id = orders.order_id
LEFT JOIN orders as forders ON (trades.a_order_id = forders.order_id AND forders.order_id != orders.order_id) OR (trades.b_order_id = forders.order_id AND forders.order_id != orders.order_id)
WHERE orders.order_id = ?
`)

const main = async ()=>{
    await server.register(require("@fastify/cors"), {})

    server.get('/orders', async(req, res)=>{
        const tokens = fetchOrders.all().map((v) => ({...v, sell_data: JSON.parse(v.sell_data), buy_data: JSON.parse(v.buy_data)}))

        return { tokens }
    })

    server.get('/orders/filled', async(req, res)=>{
        const tokens = fetchFilledOrders.all().map((v) => ({...v, sell_data: JSON.parse(v.sell_data), buy_data: JSON.parse(v.buy_data)}))

        return { tokens }
    })

    server.get('/orders/:id', async(req, res)=>{
        const {sell_data, buy_data, ...order} = fetchOrder.get(req.params.id)

        return { order: {...order, sell_data: JSON.parse(sell_data), buy_data: JSON.parse(buy_data) } }
    })

    return await server.listen(3333, '0.0.0.0')
}

main()
.then(console.log)
.catch(console.error)