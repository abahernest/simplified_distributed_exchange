// This RPC server will announce itself as `rpc_test`
// in our Grape Bittorrent network
// When it receives requests, it will answer with 'world'

"use strict";

const { PeerRPCServer } = require("grenache-nodejs-ws");
const Link = require("grenache-nodejs-link");
const ed = require("ed25519-supercop");


async function main () {

  //Link with DHT
  const link = new Link({
    grape: "http://127.0.0.1:30001",
  });
  link.start();

  const peer = new PeerRPCServer(link, {
    timeout: 300000,
  });
  peer.init();

  const opts = {
    keys: ed.createKeyPair(ed.createSeed()),
  };

  const port = 1024 + Math.floor(Math.random() * 1000);
  const service = peer.transport("server");
  service.listen(port);

  setInterval(function () {
    link.announce("exchange_worker", service.port, {});
  }, 1000);

  //Instantiate OrderBook
  let NODE_HASH = await instantiateOrderBook();
  
  //Listening for Client Requests
  await service.on("request", async (rid, key, payload, handler) => {
    if (payload.orderType === "init") {
      await handler.reply(null, NODE_HASH);
    } else {
      await handler.reply(null, "Invalid Order Type");
    }
  });

  async function instantiateOrderBook() {
    //Empty Order Book
    const data = {
      seq: 1,
      v: JSON.stringify({
        buyOrders: [],
        sellOrders: [],
      }),
    };
    var response;
    //Persist on DHT
    await link.putMutable(data, opts, async (err, hash) => {
      if (err) {
        console.log("Error: ", err);
        return;
      }
      console.log("hash:", hash);
      response = hash;
    });
    return response;
  }
}

main();
