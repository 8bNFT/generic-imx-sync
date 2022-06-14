const UPSERT_ASSETS_STATEMENT= `
    INSERT INTO 
    assets (token_id, layer, user, collection, metadata, image_url, updated_at) 
    VALUES (@token_id, @layer, @user, @token_address, @metadata, @image_url, @updated_at) 
    ON CONFLICT(token_id,collection) DO UPDATE 
    SET image_url = excluded.image_url, metadata = excluded.metadata, user = excluded.user, updated_at = excluded.updated_at, layer = excluded.layer
`

const UPSERT_ORDERS_STATEMENT= `
    INSERT INTO 
    orders (
        order_id, 
        user, 
        status, 
        sell_token_type, 
        sell_token_id, 
        sell_token_address,
        sell_data,
        buy_token_type,
        buy_token_id,
        buy_token_address,
        buy_data,
        expiration,
        updated_at,
        timestamp
    ) 
    VALUES (
        @order_id, 
        @user, 
        @status,
        @sell_token_type, 
        @sell_token_id, 
        @sell_token_address,
        @sell_data,
        @buy_token_type, 
        @buy_token_id, 
        @buy_token_address,
        @buy_data,
        @expiration,
        @updated_at,
        @timestamp
    ) 
    ON CONFLICT(order_id) DO UPDATE 
    SET status = excluded.status, 
    updated_at = excluded.updated_at
`

const UPSERT_TRADES_STATEMENT= `
    INSERT INTO 
    trades (
        trade_id, 
        status, 
        a_order_id, 
        a_token_id, 
        a_token_type, 
        a_token_address,
        b_order_id, 
        b_token_id, 
        b_token_type, 
        b_token_address,
        timestamp
    ) 
    VALUES (
        @trade_id,
        @status,
        @a_order_id,
        @a_token_id,
        @a_token_type,
        @a_token_address,
        @b_order_id,
        @b_token_id,
        @b_token_type,
        @b_token_address,
        @timestamp
    ) 
    ON CONFLICT(trade_id) DO UPDATE 
    SET status = excluded.status
`

const UPSERT_SYNC = `
    INSERT INTO 
    collections (collection, type, caught_up) 
    VALUES (@collection, @type, @caught_up) 
    ON CONFLICT(collection, type) DO UPDATE 
    SET caught_up = excluded.caught_up
`

module.exports = {
    UPSERT_ASSETS_STATEMENT,
    UPSERT_ORDERS_STATEMENT,
    UPSERT_TRADES_STATEMENT,
    UPSERT_SYNC
}