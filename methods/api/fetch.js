const ASSETS_FETCH = ({ INITIAL_POLLING_TIMESTAMP, cursor }) => `https://api.x.immutable.com/v1/assets?order_by=updated_at&updated_min_timestamp=${INITIAL_POLLING_TIMESTAMP}&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`
const ORDERS_FETCH = ({ INITIAL_POLLING_TIMESTAMP, cursor }) => `https://api.x.immutable.com/v1/orders?order_by=updated_at&updated_min_timestamp=${INITIAL_POLLING_TIMESTAMP}&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`
const TRADES_FETCH = ({ INITIAL_POLLING_TIMESTAMP, cursor }) => `https://api.x.immutable.com/v1/trades?order_by=transaction_id&min_timestamp=${INITIAL_POLLING_TIMESTAMP}&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`


const ASSETS_FETCH_BACKLOG = ({ collection, cursor }) => `https://api.x.immutable.com/v1/assets?collection=${collection}&order_by=updated_at&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`
const ORDERS_FETCH_BACKLOG_A = ({ collection, cursor }) => `https://api.x.immutable.com/v1/orders?sell_token_address=${collection}&order_by=updated_at&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`
const ORDERS_FETCH_BACKLOG_B = ({ collection, cursor }) => `https://api.x.immutable.com/v1/orders?buy_token_address=${collection}&order_by=updated_at&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`
const TRADES_FETCH_BACKLOG_A = ({ collection, cursor }) => `https://api.x.immutable.com/v1/trades?party_a_token_address=${collection}&order_by=transaction_id&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`
const TRADES_FETCH_BACKLOG_B = ({ collection, cursor }) => `https://api.x.immutable.com/v1/trades?party_b_token_address=${collection}&order_by=transaction_id&direction=asc&page_size=200${cursor && `&cursor=${cursor}` || ""}`

module.exports = {
    ASSETS_FETCH,
    ORDERS_FETCH,
    TRADES_FETCH,
    ASSETS_FETCH_BACKLOG,
    ORDERS_FETCH_BACKLOG_A,
    ORDERS_FETCH_BACKLOG_B,
    TRADES_FETCH_BACKLOG_A,
    TRADES_FETCH_BACKLOG_B
}
