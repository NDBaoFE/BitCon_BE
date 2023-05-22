const express = require("express");
const router = express.Router();
const user = require("../services/user");
const _ = require("lodash");
const verifyToken = require("../middlewares/verifyToken");
const { registerValidator } = require("../validators/auth.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();
/* GET users. */
router.get("/leaderboard", verifyToken, async function (req, res, next) {
    try {
        let data = await user.getLeaderboard(req.query.page);
        res.json({
            account: data,
            length: data.length,
        });
    } catch (err) {
        console.error(`Error while getting user `, err.message);
        next(err);
    }
});
router.post("/login", async function (req, res, next) {
    const emailExists = await user.checkEmail(req.body.email);
    console.log(`line 23 : ${emailExists}`);
    if (emailExists == false) {
        return res.status(422).send("Incorrect username or password!!");
    }
    try {
        let data = await user.login(req.body);
        console.log(typeof data);
        if (typeof data == "object") {
            const token = jwt.sign(
                { accountId: await data.AccountId },
                process.env.TOKEN_SECRET,
                {
                    expiresIn: 60 * 60 * 24,
                }
            );
            res.header("authorization", token).json({
                account: data,
                token: token,
            });
        } else {
            res.status(401).json({
                message: data,
            });
        }
    } catch (err) {
        console.error(`Error while logging in `, err.message);
        next(err);
    }
});

router.post("/signup", async function (req, res, next) {
    const { error } = registerValidator(req.body);

    if (error) return res.status(422).send(error.details[0].message);

    const emailExists = await user.checkEmail(req.body.email);

    if (emailExists) {
        return res.status(422).send("This email has already been registered");
    }

    try {
        const response = await user.signup(req.body);
        if (response.status == true) res.json(response);
        else res.status(422).json({ message: response });
    } catch (err) {
        console.error(`Error while signing up`, err.message);
        next(err);
    }
});

router.post("/account", async function (req, res, next) {
    try {
        res.json(await user.create(req.body));
    } catch (err) {
        console.error(`Error while creating user`, err.message);
        next(err);
    }
});
router.put("/account/:id", async function (req, res, next) {
    try {
        res.json(await user.update(req.params.id, req.body));
    } catch (err) {
        console.error(`Error while updating user`, err.message);
        next(err);
    }
});
router.delete("/account/:id", async function (req, res, next) {
    try {
        res.json(await user.remove(req.params.id));
    } catch (err) {
        console.error(`Error while deleting user`, err.message);
        next(err);
    }
});
router.get("/profile", verifyToken, async function (req, res, next) {
    try {
        const token = req.headers.authorization; // extract the token from the authorization header
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const accountId = decoded.accountId;
        const data = await user.getInfoById(accountId);
        res.json({
            profile: data,
        });
    } catch (err) {
        console.error(`Error while getting user `, err.message);
        next(err);
    }
});
router.put("/profile/edit", async function (req, res, next) {
    try {
        res.json(await user.updateProfile(req.body));
    } catch (err) {
        console.error(`Error while updating user`, err.message);
        next(err);
    }
});
router.get("/balance", verifyToken, async function (req, res, next) {
    try {
        const token = req.headers.authorization; // extract the token from the authorization header
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const accountId = decoded.accountId;
        console.log(accountId);
        const data = await user.getBalance(accountId);
        console.log(data);
        res.json({
            balance: data,
        });
    } catch (err) {
        console.error(`Error while getting user `, err.message);
        next(err);
    }
});
router.get("/allblog", verifyToken, async function (req, res, next) {
    try {
        const page = parseInt(req.query.page);
        let data = await user.getBlogPagination(page);
        let maxPage = await user.getMaxPage();
        res.json({
            data: data,
            maxPage: maxPage,
        });
    } catch (err) {
        console.error(`Error while getting blog `, err.message);
        next(err);
    }
});
router.get("/blog", verifyToken, async function (req, res, next) {
    try {
        const id = parseInt(req.query.id);
        let data = await user.getBlogDetail(id);

        res.json({
            data: data,
        });
    } catch (err) {
        console.error(`Error while getting blog `, err.message);
        next(err);
    }
});

module.exports = router;
