const sql = require("mssql");
const config = require("../config");
const bcrypt = require("bcrypt");

async function login(req) {
    await sql.connect(config);
    const email = req.email;
    const password = req.password;

    if (email && password) {
        try {
            const results =
                await sql.query`SELECT * FROM Account WHERE email = ${email}`;
            if (results.recordset.length === 0) {
                return "Incorrect username or password!!";
            }

            if (bcrypt.compareSync(password, results.recordset[0].password)) {
                return results.recordset[0];
            } else {
                return "Incorrect username or password!!";
            }
        } catch (error) {
            console.log(error);
            return "An error occurred while fetching data from the database.";
        }
    } else {
        return "Please input userName or password!!";
    }
}
async function signup(req) {
    await sql.connect(config);
    const email = req.email;
    const password = req.password.trim();
    const name = req.name;
    const hash = bcrypt.hashSync(password, 10).trim();
    console.log(email);
    if (email && hash) {
        try {
            const result = await sql.query`INSERT INTO Account 
              (fullname, password, email) 
              VALUES 
              (${name}, ${hash},${email})`;
            console.log(result);

            if (result.rowsAffected[0] > 0) {
                return {
                    status: true,
                    message: "Sign up successfully",
                };
            }
        } catch (error) {
            return {
                status: false,
                message: "Sign up currently not available",
            };
        }
    } else {
        return {
            status: true,
            message: "Please input email and password",
        };
    }
}
async function checkEmail(email) {
    await sql.connect(config);
    if (email) {
        const rows = await sql.query`SELECT email FROM Account `;
        if (rows.recordset.length == 0) {
            return false;
        }
        console.log(rows.recordset);
        const data = rows.recordset;
        for (const line of data) {
            if (line.email == email) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
}
async function getAllCoin() {
    await sql.connect(config);
    const rows = await sql.query`SELECT *
    FROM coins `;
    const data = rows.recordset;

    return {
        data,
    };
}
async function getCoinUrl(name) {
    const rows = await sql.query`SELECT *
    FROM coins WHERE coin_name = ${name}`;
    const url = rows.recordset[0].url;
    return {
        url,
    };
}
async function updatingBalance(balance, id) {
    console.log(balance + " " + id);
    const result =
        await sql.query`update customer set balance = ${balance} where AccountId=${id}`;
    console.log(result);
    if (result.rowsAffected[0] > 0) {
        return true;
    } else {
        console.log("hi");
        return false;
    }
}
async function getBalance(id) {
    await sql.connect(config);
    const rows = await sql.query`SELECT balance
    FROM customer where AccountId = ${id} `;
    const data = rows;
    return data.recordset[0];
}
async function getLeaderboard() {
    await sql.connect(config);
    const rows =
        await sql.query`SELECT a.fullname AS Name,a.image, c.roundPlayed, c.winRound,c.balance, 
        (CAST(c.winRound AS FLOAT) / NULLIF(c.roundPlayed, 0)) * 100 AS WinPercentage
    FROM customer c
    JOIN account a ON c.AccountId = a.AccountId
    ORDER BY c.balance DESC;
    
    
    
    `;
    const data = rows;
    return data.recordset;
}
async function createGameResult(accountId, coinType, Result) {
    await sql.connect(config);
    const result = await sql.query(
        `INSERT INTO Game 
      ( accountId, coinType,result,timestamp) 
      VALUES 
      (${accountId}, '${coinType}','${Result}', GETDATE())`
    );
    let message = "Error in creating gameResult";

    if (result.affectedRows) {
        message = "game result created successfully";
    }

    return { message };
}
async function updateLeaderBoard() {
    await sql.connect(config);
    const result = await sql.query(
        `UPDATE [BitCon].[dbo].[customer]
        SET roundPlayed = (SELECT COUNT(*) FROM [BitCon].[dbo].[Game] WHERE [BitCon].[dbo].[Game].[AccountId] = [BitCon].[dbo].[customer].[AccountId]),
            winRound = (SELECT COUNT(*) FROM [BitCon].[dbo].[Game] WHERE [BitCon].[dbo].[Game].[AccountId] = [BitCon].[dbo].[customer].[AccountId] AND [BitCon].[dbo].[Game].[result] = 1)
        `
    );
    let message = "Error in creating gameResult";

    if (result.affectedRows) {
        message = "game result created successfully";
    }

    return { message };
}
async function getInfoById(id) {
    await sql.connect(config);
    const rows =
        await sql.query`SELECT AccountId, email, fullname, image, region, bio, phone, facebook 
        FROM [BitCon].[dbo].[Account] 
        WHERE AccountId = ${id}
    `;
    const data = rows;
    return data.recordset;
}
async function updateProfile(newProfile) {
    await sql.connect(config);

    const result = await sql.query(
        `
        UPDATE [BitCon].[dbo].[Account]
SET email = '${newProfile.email}', 
    fullname = '${newProfile.fullname}', 
    image = '${newProfile.image}',
    region = '${newProfile.region}',
    bio = '${newProfile.bio}',
    phone = '${newProfile.phone}',
    facebook = '${newProfile.facebook}',
    dateOfBirth = '${newProfile.dateOfBirth}'
WHERE AccountId = ${newProfile.id}

        `
    );
    console.log(result);
    let message = "Error in edting profile";

    if (result.rowsAffected) {
        message = "Profile edited successfully";
    }

    return { message };
}
async function insertBlog(info) {
    await sql.connect(config);
    const result = await sql.query(
        `INSERT INTO blog (title, description, pubDate, author, link, imageUrl, content, subHeadLine) 
        VALUES ('${info.title}', '${info.description}', '${info.pubDate}', '${info.author}', '${info.link}', '${info.imageUrl}', '${info.content}', '${info.subHeadLine}');
        `
    );
    let message = "Error in inserting blog";

    if (result.affectedRows) {
        message = "game result created successfully";
    }

    return { message };
}
async function getBlogPagination(page) {
    await sql.connect(config);
    const rows = await sql.query`SELECT *
    FROM blog
    ORDER BY id ASC
    OFFSET ${page * 10 - 1} ROWS FETCH NEXT 10 ROWS ONLY; `;
    const data = rows.recordset;

    return data;
}
async function getMaxPage() {
    await sql.connect(config);
    const rows = await sql.query`SELECT CEILING(COUNT(*) / CAST(10 AS FLOAT))
    FROM blog;
     `;
    const data = rows.recordset[0];
    const count = parseInt(Object.values(data)[0]);
    console.log(count);
    return count;
}
async function getBlogDetail(id) {
    await sql.connect(config);
    const rows = await sql.query`select * from blog where blog.id=${id}`;
    const data = rows.recordset;

    return data;
}

module.exports = {
    login,
    signup,
    checkEmail,
    getAllCoin,
    getCoinUrl,
    getBalance,
    updatingBalance,
    getLeaderboard,
    createGameResult,
    updateLeaderBoard,
    getInfoById,
    updateProfile,
    insertBlog,
    getBlogPagination,
    getMaxPage,
    getBlogDetail,
};
