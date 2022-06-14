const ASSETS_PARSER = (_tokens)=>{
    let tokens = []
    for(let { token_id, user, status: layer, image_url, metadata, token_address, updated_at } of _tokens){
        tokens.push({
            token_id: parseInt(token_id),
            layer,
            user,
            token_address,
            metadata: JSON.stringify(metadata || "{}"),
            image_url,
            updated_at
        })
    }

    return tokens
}

const ORDERS_PARSER = (_orders)=>{
    let orders = []
    for(let { order_id, status, user, sell, buy, expiration_timestamp: expiration, timestamp, updated_timestamp: updated_at } of _orders){
        orders.push({
            order_id,
            user,
            status,
            sell_token_type: sell.type,
            sell_token_id: sell.data.token_id ? parseInt(sell.data.token_id) : null,
            sell_token_address: sell.data.token_address,
            sell_data: JSON.stringify(sell),
            buy_token_type: buy.type,
            buy_token_id: buy.data.token_id ? parseInt(buy.data.token_id) : null,
            buy_token_address: sell.data.token_address,
            buy_data: JSON.stringify(buy),
            expiration,
            updated_at,
            timestamp
        })
    }

    return orders
}

const TRADES_PARSER = (_trades)=>{
    let trades = []
    for(let { transaction_id: trade_id, status, a, b, timestamp } of _trades){
        trades.push({
            trade_id,
            status,
            a_order_id: a.order_id,
            a_token_id: a.token_id ? parseInt(a.token_id) : null,
            a_token_type: a.token_type,
            a_token_address: a.token_address || "",
            b_order_id: b.order_id,
            b_token_id: b.token_id ? parseInt(b.token_id) : null,
            b_token_type: b.token_type,
            b_token_address: b.token_address || "",
            timestamp
        })
    }

    return trades
}

module.exports = {
    ASSETS_PARSER,
    ORDERS_PARSER,
    TRADES_PARSER
}