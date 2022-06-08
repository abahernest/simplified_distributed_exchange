'use strict'

const { PeerRPCClient }  = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link');
const ed =  require('ed25519-supercop');
const prompt = require("prompt-sync")({ sigint: this });

//Local modules
const { Order, OrderBook } = require("./order");
const {
  processLimitBuy,
  processLimitSell,
  processOrder,
  removeBuyOrder,
  removeSellOrder,
  removeOrder,
  removeBuyOrderAtIndex,
  removeSellOrderAtIndex,
  addBuyOrder,
  addSellOrder,
  getUserOrderDetails,
  displayMainMenu,
} = require("./utils");
const  {NODE_HASH,updateHash,incrementSequenceNumber} = require('./config');

//Link with DHT
const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

let opts = {
  keys: ed.createKeyPair(ed.createSeed())
}

const peer = new PeerRPCClient(link, {})
peer.init()

let ClientOrderBook;
var endProgram = false;

if  (NODE_HASH === ""){
  //Instantiate Client OrderBook
  setTimeout(async () => {
    instantiateOrderBook()
      .then(async (hash) => {
        updateHash(hash);
        console.log(hash);
        return getDHT(hash);
      })
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, 5000);
}

// START PROGRAM FLOW
console.log("Welcome to Bitfinex Exchange!");
while (!endProgram) {
  //Display main menu
  const orderType = displayMainMenu();

  //Buy Order
  if (orderType === "1") {
    //Fetch order details from user
    const { price, quantity } = getUserOrderDetails("buy");
    //Create Order
    let order = new Order(price, quantity, "buy");
    console.log(order)
    //Add Order to Client OrderBook
    let trades = ClientOrderBook.processLimitBuy(order);
    console.log("Trades: ", trades);
  }
  //Sell Order
  else if (orderType === "2") {
    //Fetch order details from user
    const { price, quantity } = getUserOrderDetails("sell");
    //Create Order
    let order = new Order(price, quantity, "sell");
    console.log(order, orderbook)
    //fetch orderbook from dht
    getDHT(NODE_HASH)
      .then((orderbook) => {
        console.log("orderbook", orderbook);
        //Process Sell Order
        let trades = processLimitSell(order, orderbook["buyOrders"]);
        console.log("Trades: ", trades);
        return updateDHT(incrementSequenceNumber(), orderbook);
      })
      .then((hash) => {
        updateHash(hash);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //Exit program
  else if (orderType === "3") {
    console.log("Exiting...");
    endProgram = true;
  }
  //Display Order book
  else if (orderType === "4") {
    console.log(ClientOrderBook);
  }
  //Invalid input
  else {
    console.log("Invalid order type");
    process.exit(0);
  }
}
// console.log("Connected to DHT")

function getDHT(hash) {
  return new Promise ((resolve,reject)=>{
    link.get(hash, async (err, res) => {
      if (err) {
        reject(Error(err));
      }
      resolve(JSON.parse(res.v));
      // resolve(res)
    });
  })

}

function updateDHT(sequence_number, orderbook) {
  return new Promise((resolve,reject)=>{
    const data = {
      seq: sequence_number,
      v: JSON.stringify(orderbook),
    };
    link.putMutable(data, opts, (err, hash) => {
      if (err) {
        reject(Error(err));
      }
      resolve(hash);
    });
  })
}

function instantiateOrderBook() {
  return new Promise((resolve, reject) => {
    //Empty Order Book
    const data = {
      seq: 1,
      v: JSON.stringify({
        buyOrders: [],
        sellOrders: [],
      }),
    };

    //Persist on DHT
    link.putMutable(data, opts, (err, hash) => {
      if (err) {
        reject(Error(err));
      }
      resolve(hash);
    });
  });
}

