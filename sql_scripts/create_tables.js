const database = require('better-sqlite3')('./database/database.db', {});

const CREATE_ASSETS_STATEMENT = `
CREATE TABLE IF NOT EXISTS 
assets(
    'internal_id' integer PRIMARY KEY, 
    'token_id' integer, 
    'layer' text,
    'user' text, 
    'collection' text, 
    'metadata' text DEFAULT '{}', 
    'image_url' text, 
    'updated_at' DATETIME,
    CONSTRAINT unique_token UNIQUE(token_id, collection)
)`    

const CREATE_ORDERS_STATEMENT = `
CREATE TABLE IF NOT EXISTS 
orders(
    'order_id' integer PRIMARY KEY, 
    'user' text,
    'status' text, 
    'sell_token_type' text,
    'sell_token_id' integer,
    'sell_token_address' text,
    'sell_data' JSON, 
    'buy_token_type' text,
    'buy_token_id' integer,
    'buy_token_address' text,
    'buy_data' JSON, 
    'expiration' DATETIME,
    'updated_at' DATETIME,
    'timestamp' DATETIME
)`

const CREATE_TRADES_STATEMENT = `
CREATE TABLE IF NOT EXISTS 
trades(
    'trade_id' integer PRIMARY KEY, 
    'status' text,
    'a_order_id' integer,
    'a_token_id' integer,
    'a_token_type' text,
    'a_token_address' text,
    'b_order_id' integer,
    'b_token_id' integer,
    'b_token_type' text,
    'b_token_address' text,
    'timestamp' DATETIME
)`    

const CREATE_CURSOR_STATEMENT = `
CREATE TABLE IF NOT EXISTS 
cursors(
    'id' integer PRIMARY KEY, 
    'cursor' string UNIQUE, 
    'collection' text, 
    'type' text,
    'timestamp' DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const CREATE_COLLECTIONS_STATEMENT = `
CREATE TABLE IF NOT EXISTS 
collections(
    'id' integer PRIMARY KEY,
    'collection' text, 
    'caught_up' integer,
    'type' text,
    'timestamp' DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_pair UNIQUE(collection, type)
)
`

database.exec(CREATE_ASSETS_STATEMENT)
database.exec(CREATE_ORDERS_STATEMENT)
database.exec(CREATE_TRADES_STATEMENT)
database.exec(CREATE_CURSOR_STATEMENT)
database.exec(CREATE_COLLECTIONS_STATEMENT)