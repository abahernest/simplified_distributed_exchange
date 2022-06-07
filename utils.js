const prompt = require("prompt-sync")({ sigint: this });

/**
 * This function will prompt user for input

 * @returns {float price, float quantity} orderinput
 */
function getUserOrderDetails() {
  let quantity = parseFloat(
    prompt("Please enter the quantity you want to sell:"),
    10
  );
  let price = parseFloat(
    prompt("Please enter the price you want to sell at:"),
    10
  );

  return { price, quantity };
}

/**
 * This function will display the main menu of the application
 * @returns {string} orderType
 */
function displayMainMenu(){
    console.log(
      "Please enter a command:\n1. Buy\n2. Sell\n3. Exit\n4. OrderBook\n5. Cancel Order \n"
    );
    let orderType = prompt();
    return orderType;
}

/**
 * This function will add a buy order to the orderbook
 * @param {object} order 
 * @param {Array} buyOrders
 * @returns {Array} buyOrders
 */
function  addBuyOrder(order, buyOrders){
    let n = buyOrders.length;
    let i;
    for (i=n-1;i>=0;i--){
        let temp = buyOrders[i];
        if (temp.price<order.price){
            break;
        }
    }
    
    if (i === n-1){
        buyOrders.push(order);
    }else{
        buyOrders.splice(i+1,0,order);
    }

    return buyOrders;
}

/**
 * This function will add a sell order to the orderbook
 * @param {object} order 
 * @param {Array} sellOrders
 * @returns {Array} sellOrders
 */
function addSellOrder(order, sellOrders){
    let n = sellOrders.length;
    let i;
    for (i=n-1;i>=0;i--){
        let temp = sellOrders[i];
        if (temp.price>order.price){
            break;
        }
    }
    
    if (i === n-1){
        sellOrders.push(order);
    }else{
        sellOrders.splice(i+1,0,order);
    }

    return sellOrders;
}

/**
 * This function will remove an order using its Id
 * @param {object} order 
 * @param {object} orderBook
 * @returns {object} orderBook
 */
function removeOrder(order, orderBook){
    if (order.orderType === "buy") {
        removeBuyOrder(order, orderBook.buyOrders);
        return orderBook
    }
    removeSellOrder(order, orderBook.sellOrders);
    return orderBook;
}

/**
 * This function will remove a buy order using its Id
 * @param {object} order 
 * @param {Array} buyOrders
 * @returns {Array} buyOrders
 */
function removeBuyOrder(order, buyOrders){
    let n = buyOrders.length;
    let i;
    for (i=0;i<n;i++){
        let temp = buyOrders[i];
        if (temp.id === order.id){
            break;
        }
    }
    if (i === n){
        return;
    }
    buyOrders.splice(i,1);

    return buyOrders
}

/**
 * This function will remove a sell order using its Id
 * @param {object} order 
 * @param {Array} sellOrders
 * @returns {Array} sellOrders
 */
function removeSellOrder(order, sellOrders){
    let n = sellOrders.length;
    let i;
    for (i=0;i<n;i++){
        let temp = sellOrders[i];
        if (temp.id === order.id){
            break;
        }
    }
    if (i === n){
        return;
    }
    sellOrders.splice(i,1);

    return sellOrders;
}


/**
 * This function will remove a buy order at a specified index
 * @param {int} index 
 * @param {Array} buyOrders
 * @returns {Array} buyOrders
 */
function removeBuyOrderAtIndex(index, buyOrders){
    buyOrders.splice(index,1);
    return buyOrders;
}

/**
 * This function will remove a sell order at a specified index
 * @param {int} index 
 * @param {Array} sellOrders
 * @returns {Array} sellOrders
 */
function removeSellOrderAtIndex(index, sellOrders){
        sellOrders.splice(index,1);
        return sellOrders;
}

/**
 * This function will process the limit order depending  on terminal input
 * @param {*} order 
 * @returns {Array} trades
 */
function processOrder(order, orderBook) {
    if (order.orderType==="buy"){
        return processLimitBuy(order, orderBook.sellOrders);
    }
    return processLimitSell(order, orderBook.buyOrders);
}

/**
 * This function will process the limit buy order
 * @param {*} order 
 * @returns {Array} trades
 */
function processLimitBuy(order, sellOrders) {
  let trades = [];
  let n = sellOrders.length;

  //check if we have any matching order
  if (n != 0 && sellOrders[n - 1].price <= order.price) {
    //traverse all  matching orders
    for (let i = n - 1; i >= 0; i--) {
      let sellOrder = sellOrders[i];
      if (sellOrder.price > order.price) {
        break;
      }

      //fill order completely
      if (sellOrder.currentQuantity >= order.currentQuantity) {
        console.log("FULFILL ORDER COMPLETELY");
        let newTrade = new Trade(
          order.id,
          sellOrder.id,
          order.currentQuantity,
          sellOrder.price
        );
        trades.push(newTrade);
        sellOrder.currentQuantity -= order.currentQuantity;
        if (sellOrder.currentQuantity === 0) {
          removeSellOrderAtIndex(i, sellOrders);
        }
        return trades;
      }

      //fill order partially
      if (sellOrder.currentQuantity < order.currentQuantity) {
        console.log("FULFILL ORDER PARTIALLY");
        let newTrade = new Trade(
          order.id,
          sellOrder.id,
          sellOrder.currentQuantity,
          sellOrder.price
        );
        trades.push(newTrade);
        order.currentQuantity -= sellOrder.currentQuantity;
        removeSellOrderAtIndex(i, sellOrders);
        continue;
      }
    }
  }
  //Add remaining order to orderbook
  addBuyOrder(order, buyOrders);
  return trades;
}


/**
 * This function will process the limit sell order
 * @param {*} order 
 * @returns {Array} trades
 */
function processLimitSell(order,  buyOrders){
    let trades = []
    let n = buyOrders.length;

    //check if we have any matching order
    if (n !== 0 && buyOrders[n-1].price >= order.price){
        //traverse all matching orders
        for (let i=n-1;i>=0;i--){
            let buyOrder = buyOrders[i];
            if (buyOrder.price < order.price){
                break;
            }

            //fill order completely
            if (buyOrder.currentQuantity >=order.currentQuantity){
                console.log('FULFILL ORDER COMPLETELY')
                let newTrade = new Trade(order.id, buyOrder.id, order.currentQuantity, buyOrder.price);
                trades.push(newTrade);
                buyOrder.currentQuantity -= order.currentQuantity;
                if (buyOrder.currentQuantity === 0){
                    removeBuyOrderAtIndex(i, buyOrders);
                }
                return trades;
            }

            //fill order partially
            if (buyOrder.currentQuantity < order.currentQuantity){
                console.log("FULFILL ORDER PARTIALLY")
                let newTrade = new Trade(buyOrder.id, order.id, buyOrder.currentQuantity, buyOrder.price);
                trades.push(newTrade);
                order.currentQuantity -= buyOrder.currentQuantity;
                removeBuyOrderAtIndex(i,buyOrders);
                continue;
            }
        }
    }

    //add remaining order to orderbook
    addSellOrder(order, sellOrders);
    return trades;
}

module.exports = {
    processLimitBuy,
    processOrder,
    processOrder,
    removeBuyOrder,
    removeSellOrder,
    removeOrder,
    removeBuyOrderAtIndex,
    removeSellOrderAtIndex,
    addBuyOrder,
    addSellOrder,
    getUserOrderDetails,
    displayMainMenu
}