const ASSETS_FILTER = (collections)=> ({ token_address }) => collections.includes(token_address.toLowerCase())
const ORDERS_FILTER = (collections)=> ({ sell: { data: { token_address: sell_token_address } }, buy: { data: { token_address: buy_token_address } } }) => collections.includes(sell_token_address.toLowerCase()) || collections.includes(buy_token_address.toLowerCase())
const TRADES_FILTER = (collections)=> ({ a: { token_address: a_token_address = "" }, b: { token_address: b_token_address = "" }}) => collections.includes(a_token_address.toLowerCase()) || collections.includes(b_token_address.toLowerCase())

module.exports = {
    ASSETS_FILTER,
    ORDERS_FILTER,
    TRADES_FILTER
}