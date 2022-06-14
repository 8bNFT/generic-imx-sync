const database = require('better-sqlite3')('database.db', {});

const ADD_COLLECTION_STATEMENT = `
    INSERT OR IGNORE INTO 
    collections (collection, type, caught_up) 
    VALUES (@collection, @type, @caught_up)
`
const ADD_COLLECTION = database.prepare(ADD_COLLECTION_STATEMENT)
const addCollection = (collection, type = "assets") => ADD_COLLECTION.run({ collection, type, caught_up: 0 })

const type = process.argv.pop().toUpperCase()
const collection = process.argv.pop()

if(!["ASSETS", "ORDERS", "TRADES"].includes(type)) return console.error("Invalid type")

addCollection(collection, type)