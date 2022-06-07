'use strict'

const { PeerRPCClient }  = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link');
const ed =  require('ed25519-supercop');
const prompt = require("prompt-sync")({ sigint: this });

//Local modules
const { Order, OrderBook } = require("./order");
const  {getUserOrderDetails, processLimitBuy, displayMainMenu} = require('./utils')

//Link with DHT
const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const opts = {
  keys: ed.createKeyPair(ed.createSeed())
}

const peer = new PeerRPCClient(link, {})
peer.init()

let NODE_HASH;
let ClientOrderBook;
var endProgram = false;

//First Connect to Server to get the HASH of the orderbook
console.log("fetching HASH from server...")
peer.request("exchange_worker", {orderType:"init"}, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("hash:",data)
  NODE_HASH = data;
});

//Instantiate Client OrderBook
ClientOrderBook = new OrderBook([],[]);
console.log("Connected to DHT")

//START PROGRAM FLOW
console.log("Welcome to Bitfinex Exchange!");
while (!endProgram){
  //Display main menu
    const orderType = displayMainMenu();
    
    //Buy Order
    if (orderType === "1") {
      //Fetch order details from user
      const { price, quantity } = getUserOrderDetails("buy");
      //Create Order
      let order = new Order(price, quantity, "buy");
      //Add Order to Client OrderBook
      let trades = ClientOrderBook.processLimitBuy(order)
      console.log("Trades: ", trades);
    } 
    //Sell Order
    else if (orderType === "2") {
      //Fetch order details from user
      const { price, quantity } = getUserOrderDetails("sell");
      //Create Order
      let order = new Order(price, quantity, "sell");
      //Add Order to Client OrderBook
      let trades = ClientOrderBook.processLimitSell(order);
      console.log("Trades: ", trades);
    } 
    //Exit program
    else if (orderType === "3") {
      console.log("Exiting...");
      endProgram = true;
    } 
    //Display Order book
    else if (orderType === "4"){
        console.log(ClientOrderBook);
    } 
    //Invalid input
    else {
      console.log("Invalid order type");
      process.exit(0);
    }
}

function getDHT(hash) {
  let orderbook;
  link.get(hash, async (err, res) => {
    if (err) {
      console.log("Error: ", err);
      return;
    }
    orderbook = JSON.parse(res.v);
  });
  return Promise.resolve(orderbook);
}

function updateDHT(orderbook) {
  const data = {
    seq: 1,
    V: JSON.stringify(orderbook),
  };
  let response;
  link.putMutable(data, opts, (err, hash) => {
    if (err){
      console.log("Error: ", err);
      return;
    }
    console.log(hash)
    response = hash;
  });
  return response;
}