module.exports = {
    // Point in time from which poller will sync all the orders
    // set it to present, as the backlog sync will make up for previous orders
    INITIAL_POLLING_TIMESTAMP: "2022-06-13T22:30:15.04Z",
    // database identifier used for the main process
    MAIN_COLLECTION: "MAIN_COLLECTION"
}