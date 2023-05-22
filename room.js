var rooms = [
    {
        name: "Bitcoin",
        url: "https://api.pro.coinbase.com/products/BTC-USD/ticker",
        subscribers: [],
    },
    {
        name: "Ethereum",
        url: "https://api.pro.coinbase.com/products/ETH-USD/ticker",
        subscribers: [],
    },
    {
        name: "Stellar",
        url: "https://api.pro.coinbase.com/products/XLM-USD/ticker",
        subscribers: [],
    },
    {
        name: "Cardano",
        url: "https://api.pro.coinbase.com/products/ADA-USD/ticker",
        subscribers: [],
    },
    {
        name: "Dogecoin",
        url: "https://api.pro.coinbase.com/products/DOGE-USD/ticker",
        subscribers: [],
    },
    {
        name: "XRP",
        url: "https://api.pro.coinbase.com/products/XRP-USD/ticker",
        subscribers: [],
    },
    {
        name: "Polkadot",
        url: "https://api.pro.coinbase.com/products/DOT-USD/ticker",
        subscribers: [],
    },
    {
        name: "Uniswap",
        url: "https://api.pro.coinbase.com/products/UNI-USD/ticker",
        subscribers: [],
    },
    {
        name: "Chainlink",
        url: "https://api.pro.coinbase.com/products/LINK-USD/ticker",
        subscribers: [],
    },
    {
        name: "Litecoin",
        url: "https://api.pro.coinbase.com/products/LTC-USD/ticker",
        subscribers: [],
    },
];

const add = (room, user) => {
    rooms[room].subscribers.push(user);
};
const remove = (user) => {
    rooms.forEach((room) => {
        const index = room.subscribers.indexOf(user);
        console.log(index);
        if (index !== -1) {
            room.subscribers.splice(index, 1);
            console.log("delete succesfully from room of " + room.name);
        }
    });
};

module.exports = {
    rooms,
    add,
    remove,
};
