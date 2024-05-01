const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const Product = require('./product');
const ItemBought = require("./itemBoughtschema")
const { XrplClient } = require("xrpl-client");
const { utils, derive, sign } = require("xrpl-accountlib");
const client = new XrplClient("wss://s.altnet.rippletest.net:51233");

const cors = require("cors");

const app = express();

app.use(cors());

// // uploading image
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `img/uploads/`);
    },
    filename: (req, file, cb) => {
        const type = req.body?.type;
        const ext = file.mimetype.split('/')[1];
        cb(null, `recipe-${Date.now()}.${ext}`);
    }
});
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! please upload only image'), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
const uploadPhoto = upload.single('imageUrl');

const main = async (seed, destination, price,res) => {
    let account;
    if (!utils.isValidSeed(seed)) {
        return res.send("invalid seed");
    }
    account = derive.familySeed(seed);
    if (!utils.isValidAddress(destination)) {
        return res.send("invalid destination address");
    }
    console.log("account : ", account);

    const data = await client.send({
        id: 1,
        command: "account_info",
        account: account.address,
        strict: true 
    });
    console.log("Data : ", data.account_data);

    if (data.error) {
        return res.send({"Error : ": data.error_message});
    }

    console.log("Balance : ", Number(data.account_data.Balance) / 1000000 - 10 - 2 * data.account_data.OwnerCount);
    if(Number(data.account_data.Balance)/1000000 < Number(price) + 10 - 2 * data.account_data.OwnerCount){
        console.log("Warning : Your balance is low\n")
        res.send("You must have 10 XRP + theamount you want to send\n")
        // process.exit(1)
    }
    await client.send({
        command:"subscribe",
        accounts:[account.address]
    })

    const {id,signedTransaction} = sign({
        TransactionType:"Payment",
        Account:account.address,
        Destination:destination,
        Amount:String(Number(price) * 1_000_000),
        Sequence:data.account_data.Sequence,
        Fee:String(12),
        LastLedgerSequence : data.ledger_current_index + 2
    },account)
    console.log("id",id)
    console.log(" ")
    console.log("signedTransaction",signedTransaction)

    const result = await client.send({
        command:"submit",
        tx_blob:signedTransaction
    })
    console.log("submited transaction result : ",result)
    return {passed:true,transactionid:id,raddress:account.address}







};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname)));
// Serve static files from the "lib" directory
app.use('/lib', express.static(path.join(__dirname, 'lib')));
app.use('/scss', express.static(path.join(__dirname, 'scss')));

// Handle product upload
app.post("/uploadproduct", uploadPhoto, async(req, res) => {
    try {
        const { productname, raddress, price } = req.body;
        const imageUrl = req.file.filename;
        console.log(productname, price, raddress, imageUrl);
        const product = new Product({ productname, raddress, price, imageUrl });
        await product.save();
        res.status(201).send({message:"Product uploaded successfully",status:"success"});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading product");
    }
});

app.post("/processpayment", async(req, res) => {
    try {
        console.log(req.body);
        const {passed, transactionid,raddress} = await main(req.body.familyseed, req.body.raddress,req.body.price,res);
        if(passed){
            req.body.trasactionid = transactionid;
            // imageUrl
            const storeondb = new ItemBought({raddress:raddress,from:req.body.raddress,price:req.body.price,imageUrl:req.body.imageUrl,transactionid:transactionid})
            storeondb.save()
            console.log(storeondb)
            res.send({message:"item bought", status:"success"})
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading product");
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "product.html"));
});

app.get("/getalldata", async (req, res) => {
    try {
        const products = await Product.find();
        console.log(products);
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
});

app.get("/getmyproduct/:raddress", async (req, res) => {
    try {
        const itembought = await ItemBought.find({ raddress: req.params.raddress });
        console.log(itembought);
        res.send({data:itembought,status:"success"})
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
});





module.exports = app;
