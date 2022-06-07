class Order {
    constructor(price, quantity, orderType ) {
        this.id = Math.random().toString().slice(2);
        this.price = price;
        this.orderType = orderType;
        this.initialQuantity = quantity;
        this.currentQuantity = quantity;
    }

}
 
class Trade {
    constructor(takerOrderId, makerOrderId, quantity, price) {
        this.takerOrderId = takerOrderId;
        this.makerOrderId = makerOrderId;
        this.quantity = quantity;
        this.price = price;
    }
}

class OrderBook {
    constructor(buyOrders,sellOrders){
        this.buyOrders =buyOrders;
        this.sellOrders = sellOrders;
        // this.trades = [];
    }

    addBuyOrder(order){
        let n = this.buyOrders.length;
        let i;
        for (i=n-1;i>=0;i--){
            let temp = this.buyOrders[i];
            if (temp.price<order.price){
                break;
            }
        }
        
        if (i === n-1){
            this.buyOrders.push(order);
        }else{
            this.buyOrders.splice(i+1,0,order);
        }
    }

    addSellOrder(order){
        let n = this.sellOrders.length;
        let i;
        for (i=n-1;i>=0;i--){
            let temp = this.sellOrders[i];
            if (temp.price>order.price){
                break;
            }
        }
        
        if (i === n-1){
            this.sellOrders.push(order);
        }else{
            this.sellOrders.splice(i+1,0,order);
        }
    }

    removeOrder(order){
        if (order.orderType === "buy") {
          return this.removeBuyOrder(order);
        }
        return this.removeSellOrder(order);
    }

    removeBuyOrder(order){
        let n = this.buyOrders.length;
        let i;
        for (i=0;i<n;i++){
            let temp = this.buyOrders[i];
            if (temp.id === order.id){
                break;
            }
        }
        if (i === n){
            return;
        }
        this.buyOrders.splice(i,1);
    }

    removeSellOrder(order){
        let n = this.sellOrders.length;
        let i;
        for (i=0;i<n;i++){
            let temp = this.sellOrders[i];
            if (temp.id === order.id){
                break;
            }
        }
        if (i === n){
            return;
        }
        this.sellOrders.splice(i,1);
    }

    removeBuyOrderAtIndex(index){
        this.buyOrders.splice(index,1);
    }
    removeSellOrderAtIndex(index){
            this.sellOrders.splice(index,1);
    }

    /**
     * This function will process the limit order depending  on terminal input
     * @param {*} order 
     * @returns {Array} trades
     */
    processOrder(order) {
        if (order.orderType==="buy"){
            return this.processLimitBuy(order);
        }
        return this.processLimitSell(order);
    }

    /**
     * This function will process the limit sell order
     * @param {*} order 
     * @returns {Array} trades
     */
    processLimitSell(order){
        let trades = []
        let n = this.buyOrders.length;

        //check if we have any matching order
        if (n !== 0 && this.buyOrders[n-1].price >= order.price){
            //traverse all matching orders
            for (let i=n-1;i>=0;i--){
                let buyOrder = this.buyOrders[i];
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
                        this.removeBuyOrderAtIndex(i);
                    }
                    return trades;
                }

                //fill order partially
                if (buyOrder.currentQuantity < order.currentQuantity){
                    console.log("FULFILL ORDER PARTIALLY")
                    let newTrade = new Trade(buyOrder.id, order.id, buyOrder.currentQuantity, buyOrder.price);
                    trades.push(newTrade);
                    order.currentQuantity -= buyOrder.currentQuantity;
                    this.removeBuyOrderAtIndex(i);
                    continue;
                }
            }
        }

        //add remaining order to orderbook
        this.addSellOrder(order);
        return trades;
    }

    /**
     * This function will process the limit buy order
     * @param {*} order 
     * @returns {Array} trades
     */
    processLimitBuy(order){
        let trades = []
        let n=this.sellOrders.length;

        //check if we have any matching order
        if (n !=0 && this.sellOrders[n-1].price <= order.price){
            //traverse all  matching orders
            for (let i=n-1;i>=0;i--){
                let sellOrder = this.sellOrders[i];
                if (sellOrder.price > order.price){
                    break;
                }

                //fill order completely
                if (sellOrder.currentQuantity >=order.currentQuantity){
                    console.log('FULFILL ORDER COMPLETELY')
                    let newTrade = new Trade(order.id, sellOrder.id, order.currentQuantity, sellOrder.price);
                    trades.push(newTrade);
                    sellOrder.currentQuantity -= order.currentQuantity;
                    if (sellOrder.currentQuantity === 0){
                        this.removeSellOrderAtIndex(i);
                    }
                    return trades;
                }

                //fill order partially
                if (sellOrder.currentQuantity < order.currentQuantity){
                    console.log("FULFILL ORDER PARTIALLY")
                    let newTrade = new Trade(order.id, sellOrder.id, sellOrder.currentQuantity, sellOrder.price);
                    trades.push(newTrade);
                    order.currentQuantity -= sellOrder.currentQuantity;
                    this.removeSellOrderAtIndex(i);
                    continue;
                }
            }
        }
        //Add remaining order to orderbook
        this.addBuyOrder(order);
        return  trades;
    }
}

module.exports = {Order,Trade,OrderBook};