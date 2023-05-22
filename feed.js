const axios = require("axios");
const cheerio = require("cheerio");
const { connect } = require("mssql");
const sql = require("mssql");
const config = require("./config");
function escapeSingleQuotes(str) {
    return str.replace(/'/g, "''");
}
async function insertProduct(info) {
    await sql.connect(config);
    const quantity = Math.floor(Math.random() * 11) + 20; // Generate a random number between 20 and 30 (inclusive)
    const productTypeId = 5;
    const result = await sql.query(
        `INSERT INTO product (name, quantity, productTypeId, price, productImt, isDeleting) 
        VALUES (N'${escapeSingleQuotes(
            info.name
        )}', ${quantity}, ${productTypeId}, ${
            parseFloat(info.price.replace("₫", "")) * 100
        }, '${info.img}', '0');
        `
    );
    let message = "Error in inserting blog";

    if (result.affectedRows) {
        message = "game result created successfully";
    }

    return { message };
}

const getFcode = async () => {
    try {
        const response = await axios.get(
            "https://www.bachhoaxanh.com/nuoc-ngot"
        );
        const $ = cheerio.load(response.data);
        const products = [];

        $(".cate")
            .children()
            .each((index, element) => {
                const productName = $(element)
                    .find(".product-name")
                    .text()
                    .trim();
                const price = $(element).find(".price strong").text().trim();
                const originalPrice = $(element)
                    .find(".price span")
                    .text()
                    .trim();
                const discount = $(element).find(".price label").text().trim();
                let imgSrc = $(element).find(".boximg img").attr("src");
                if (!imgSrc) {
                    imgSrc = $(element).find(".boximg img").attr("data-src");
                }
                const product = {
                    name: productName,
                    price: price,
                    img: imgSrc,
                };
                if (product.name != "") insertProduct(product);
                products.push(product);
            });

        console.log(products);
    } catch (err) {
        console.error(`Error fetching products: `, err);
    }
};
getFcode();
