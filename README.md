# Generic IMX API poller

## Available types
Assets, Orders, Trades

### TBD
Mints, Transfers

# Commands

```
npm run init:db
    - initializes the database, shocker

npm run insert:collection COLLECTION_ADDRESS TYPE(ASSETS|ORDERS|TRADES)
    - adds the collection for backlog and realtime syncer to fetch

npm run sync:backlog
    - starts the process that will fetch any backlog (leave it running)

npm run sync
    - starts the process that fetches any entries for registered collections from the INITIAL_POLLING_TIMESTAMP (config.js) onwards
    - also, yes, leave it running

npm run server
    - starts the Fastify server, barebones rn
    - soon:tm: will have basic mgmnt.
```

###### There's no error handling whatsoever