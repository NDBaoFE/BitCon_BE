const express = require("express");
const app = express();
const http = require("http");
const user = require("./services/user");
const server = http.createServer(app);
const quoteRouter = require("./routes/quoteRouter");
const coinRouter = require("./routes/coinRouter");
const room = require("./room");
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
let { rooms, add, remove } = room;
const axios = require("axios");
const cors = require("cors");
const { subscribe } = require("diagnostics_channel");
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

app.use("/auth", quoteRouter);
app.use("/api/coin", coinRouter);
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});
//inital value
const startingBalance = 10000;
const betPercentage = 0.95;
let previousPrice = 0;
let currentPrice = 0;
// Store the current balance of each connected client
const clients = [];
let countdown = 60; // initialize the countdown to 60 seconds
/*---------------------------------------------*/
const getBitcoinPrice = async (url) => {
    try {
        const response = await axios.get(url);
        const price = response.data.price;
        return price;
    } catch (error) {
        console.error(error);
    }
};
/*---------------------------------------------*/
setInterval(() => {
    if (countdown === 0) {
        countdown = 60; // reset the countdown to 60 seconds
        rooms.forEach((room) => {
            if (room.subscribers.length > 0) {
                console.log(room.name);
                getBitcoinPrice(room.url).then((price) => {
                    room.subscribers.forEach((subscriber) => {
                        io.to(subscriber.id).emit("bitcoinPrice", price);
                    });
                    previousPrice = currentPrice;
                    currentPrice = price;
                });
            }
        });
    } else {
        io.emit("countdown", countdown); // send the remaining countdown time to the client
        countdown--; // decrement the countdown
    }
}, 1000);

/*---------------------------------------------*/
io.on("connection", async (socket) => {
    const accountId =
        socket.request.headers["account-id"] ||
        socket.handshake.query["account-id"];
    if (accountId !== "undefined") {
        try {
            const res = await user.getBalance(accountId);
            console.log(await res);
            const balance = await res.balance;

            clients[socket.id] = {
                id: socket.id,
                balance: balance,
                coin: "Bitcoin",
            };
            add(0, clients[socket.id]);
            console.log(rooms[0].subscribers.length);
            io.to(socket.id).emit("balance", balance);
        } catch (error) {
            console.log("Error occurred while fetching balance: ", error);
        }
    } else {
        console.log("Undefined account ID");
    }

    console.log(socket.id + " connected");
    // Set up the bitcoinPrice listener
    socket.on("disconnect", () => {
        remove(clients[socket.id]);
        console.log("A user disconnected");
    });
    const checkBetOutcome = async (
        betDirection,
        amount,
        currentPrice,
        previousPrice
    ) => {
        const betOutcome =
            (betDirection === "higher" && currentPrice > previousPrice) ||
            (betDirection === "lower" && currentPrice < previousPrice);

        const betWon = betOutcome;
        const result = betWon == true ? 1 : 0;
        clients[socket.id].balance += betOutcome ? amount : -amount;

        await user.updatingBalance(clients[socket.id].balance, accountId);
        io.to(socket.id).emit("balance", clients[socket.id].balance);
        io.to(socket.id).emit("betOutcome", { betWon, price: currentPrice });
        await user.createGameResult(accountId, clients[socket.id].coin, result);
        await user.updateLeaderBoard();
    };
    const handleCoinReceived = (direction, bet) => {
        checkBetOutcome(direction, bet, currentPrice, previousPrice);
    };
    socket.on("placeBet", async ({ direction, amount }) => {
        previousPrice = currentPrice;
        socket.once("receiveCoin", () => {
            handleCoinReceived(direction, amount);
        });
    });
    socket.on("newCoin", async ({ newCoin }) => {
        console.log(`${socket.id}change coin to ${newCoin}`);
        previousPrice = 0;
        currentPrice = 0;
        remove(clients[socket.id]);
        add(newCoin, clients[socket.id]);
        clients[socket.id] = {
            ...clients[socket.id],
            coin: newCoin,
        };
        io.to(socket.id).emit("coinChanged", newCoin);
    });
});

server.listen(8080, () => {
    console.log("Server listening on port 8080");
});
