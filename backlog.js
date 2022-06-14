const fetch = require("node-fetch");
const { ASSETS_FETCH_BACKLOG, ORDERS_FETCH_BACKLOG_A, ORDERS_FETCH_BACKLOG_B, TRADES_FETCH_BACKLOG_A, TRADES_FETCH_BACKLOG_B } = require("./fetch");
const { ASSETS_FILTER, ORDERS_FILTER, TRADES_FILTER } = require("./filters");
const { ASSETS_PARSER, ORDERS_PARSER, TRADES_PARSER } = require("./parsers");
const database = require('better-sqlite3')('database.db', {});
const { UPSERT_ASSETS_STATEMENT, UPSERT_ORDERS_STATEMENT, UPSERT_TRADES_STATEMENT, UPSERT_SYNC } = require("./statements")
const { MAIN_COLLECTION, INITIAL_POLLING_TIMESTAMP } = require("./config")

const sleep = (time)=>new Promise((res, rej)=>setTimeout(res, time * 1000))

const TYPES = {
    ASSETS: "ASSETS",
    ORDERS: "ORDERS",
    TRADES: "TRADES"
}

const METHODS = {
    [TYPES.ASSETS]: {
        insert: database.prepare(UPSERT_ASSETS_STATEMENT),
        filter: ASSETS_FILTER,
        parser: ASSETS_PARSER,
        query_backlog: ASSETS_FETCH_BACKLOG
    },
    [TYPES.ORDERS]: {
        insert: database.prepare(UPSERT_ORDERS_STATEMENT),
        filter: ORDERS_FILTER,
        parser: ORDERS_PARSER,
        query_backlog: ORDERS_FETCH_BACKLOG_A,
        query_backlog_additional: ORDERS_FETCH_BACKLOG_B
    },
    [TYPES.TRADES]: {
        insert: database.prepare(UPSERT_TRADES_STATEMENT),
        filter: TRADES_FILTER,
        parser: TRADES_PARSER,
        query_backlog: TRADES_FETCH_BACKLOG_A,
        query_backlog_additional: TRADES_FETCH_BACKLOG_B
    }
}

const updateRecords = database.transaction(
    (records, type) => {
        for (const record of records) (METHODS[type].insert).run(record);
    }
)

const UPDATE_SYNC = database.prepare(UPSERT_SYNC)
const updateSyncState = ({ collection, type, caught_up = 0 }) => UPDATE_SYNC.run({ collection, type, caught_up })

const fetchCursor = database.prepare('SELECT cursor FROM cursors WHERE collection = ? AND type = ? ORDER BY id DESC');
const insertCursor = database.prepare('INSERT or IGNORE INTO cursors(cursor, collection, type) VALUES(?, ?, ?)');
const fetchDesyncCollection = database.prepare(`SELECT collection, type, timestamp FROM collections WHERE caught_up = 0 AND collection != '${MAIN_COLLECTION}' ORDER BY id`);

const fetchResult = async ({ query, collection, type, cursor_type = type })=>{
    const collections = [collection]
    const cursor = (fetchCursor.get(collection, cursor_type))?.cursor || false
    const { result, cursor: new_cursor } = await (await fetch(query({ collection, cursor }))).json()

    const filtered_collections = result.filter((METHODS[type].filter)(collections))
    const parsed_entries = (METHODS[type].parser)(filtered_collections)

    return {
        result: {
            data: parsed_entries,
            latest_entry: parsed_entries.length ? parsed_entries.slice(-1) : { updated_at: 0 }
        },
        cursor: {
            cursor: new_cursor,
            cursor_type
        }
    }
}

const main = async()=>{
    console.log("Backlog syncing started")
    while (true){
        const _collection = fetchDesyncCollection.get()
        if(!_collection || !_collection?.collection){
            await sleep(60)
            continue
        }

        const { collection, type, timestamp: COLLECTION_TIMESTAMP } = _collection
        console.log(`Currently syncing ${type} of ${collection}.`)
        let result, cursors, latest_entries

        if(type === "ASSETS"){
            const { result: { data, latest_entry }, cursor } = await fetchResult({ query: METHODS[type].query_backlog, collection, type })
            result = data
            cursors = [cursor]
            latest_entries = [latest_entry]
        } else {
            const { result: { data: r_a, latest_entry: le_a}, cursor: cursor_a } = await fetchResult({ query: METHODS[type].query_backlog, collection, type, cursor_type: type + '_A' })
            const { result: { data: r_b, latest_entry: le_b }, cursor: cursor_b } = await fetchResult({ query: METHODS[type].query_backlog_additional, collection, type, cursor_type: type + '_B' })
            result = [...r_a, ...r_b]
            cursors = [cursor_a, cursor_b]
            latest_entries = [le_a, le_b]
        }

        if(result.length){
            updateRecords(result, type)
            latest_entries.sort((a, b) => {
                let t_a = (new Date(a.updated_at || a.timestamp)).getTime()
                let t_b = (new Date(b.updated_at || b.timestamp)).getTime()
                return t_a - t_b
            })

            const collection_timestamp_date = new Date(COLLECTION_TIMESTAMP)
            const latest_entry_date = new Date(latest_entries[0].updated_at || latest_entries[0].timestamp)

            if(collection_timestamp_date.getTime() - (15 * 60 * 1000) < latest_entry_date.getTime()){
                updateSyncState({ collection, caught_up: 1, type })
                await sleep(0.4)
                continue
            }
        }

        const f_cursors = cursors.filter((v) => v.cursor)
        if(f_cursors.length){
            for(let { cursor, cursor_type } of f_cursors){
                insertCursor.run(cursor, collection, cursor_type)
            }
            updateSyncState({ collection, caught_up: 0, type })
        } else {
            updateSyncState({ collection, caught_up: 1, type })
        }

        await sleep(0.5)
    }
}


main()
.then(()=>process.exit(0))
.catch((e)=>{
    console.log(e)
    process.exit(1)
})