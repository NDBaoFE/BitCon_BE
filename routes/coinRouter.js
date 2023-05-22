const verifyToken = require("../middlewares/verifyToken");
const quotes = require("../services/user");
const express = require("express");
const router = express.Router();
router.get("/", verifyToken, async function (req, res, next) {
    try {
        let data = await quotes.getAllCoin();
        res.json({
            account: data,
        });
    } catch (err) {
        console.error(`Error while getting users `, err.message);
        next(err);
    }
});
// Add new route to allow users to change the default coin
router.post("/change", verifyToken, async (req, res, next) => {
    const coin = req.body.coin;

    if (!coin) {
        return res.status(400).send("Coin not specified");
    } else {
        try {
            console.log(coin);
            // io.emit("coinChanged", defaultCoin);
            return res.status(200).send(`Default coin set to ${coin}`);
        } catch (error) {
            return res.status(400).send(error);
        }
    }
});

module.exports = router;
