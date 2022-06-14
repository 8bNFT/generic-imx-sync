const fetch = require("node-fetch");
const { ASSETS_FETCH, ORDERS_FETCH, TRADES_FETCH } = require("./fetch");
const { ASSETS_FILTER, ORDERS_FILTER, TRADES_FILTER } = require("./filters");
const { ASSETS_PARSER, ORDERS_PARSER, TRADES_PARSER } = require("./parsers");
const database = require('better-sqlite3')('database.db', {});
const { UPSERT_ASSETS_STATEMENT, UPSERT_ORDERS_STATEMENT, UPSERT_TRADES_STATEMENT, UPSERT_SYNC } = require("./statements")
const { INITIAL_POLLING_TIMESTAMP, MAIN_COLLECTION } = require("./config")

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
        query: ASSETS_FETCH
    },
    [TYPES.ORDERS]: {
        insert: database.prepare(UPSERT_ORDERS_STATEMENT),
        filter: ORDERS_FILTER,
        parser: ORDERS_PARSER,
        query: ORDERS_FETCH
    },
    [TYPES.TRADES]: {
        insert: database.prepare(UPSERT_TRADES_STATEMENT),
        filter: TRADES_FILTER,
        parser: TRADES_PARSER,
        query: TRADES_FETCH
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
const fetchCollections = database.prepare(`SELECT collection FROM collections WHERE type = ? AND collection != '${MAIN_COLLECTION}'`);

const main = async()=>{
    console.log("Realtime syncing started")
    while (true){
        for(let type of Object.values(TYPES)){
            const cursor = (fetchCursor.get(MAIN_COLLECTION, type))?.cursor || false
            const collections = (fetchCollections.all(type)).reduce((acc, v)=>[...acc, v.collection], [])
            // console.log(`${collections.length} collections for ${type}.`)
            if(!collections.length){
                // console.log(`No collectios set for ${type}. Skipping...`)
                await sleep(0.25)
                continue
            }

            const { result, cursor: new_cursor } = await (await fetch((METHODS[type].query)({ INITIAL_POLLING_TIMESTAMP, cursor }))).json()
            console.log(`${result.length} results for ${type}.`)

            if(result.length){
                const filtered_collections = result.filter((METHODS[type].filter)(collections))
                const parsed_entries = (METHODS[type].parser)(filtered_collections)
                if(parsed_entries.length) updateRecords(parsed_entries, type)
            }

            if(new_cursor){
                insertCursor.run(new_cursor, MAIN_COLLECTION, type)
                updateSyncState({ collection: MAIN_COLLECTION, caught_up: 0, type })
            } else {
                updateSyncState({ collection: MAIN_COLLECTION, caught_up: 1, type })
            }
            // console.log(new_cursor ? `New cursor for ${type}.` : 'No new cursor. All caught up.')

            await sleep(0.25)
        }
    }
}


main()
.then(()=>process.exit(0))
.catch((e)=>{
    console.log(e)
    process.exit(1)
})