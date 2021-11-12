import express from 'express'
import { populateFillingSheet, getRawOrdersData, googleSpreadsheetInit } from './helpers.js'

const app = express();

const port = process.env.PORT || 3002;

app.use(express.json())

app.post('/webhooks/orders/created', async function (req, res) {
    try {
        const data = getRawOrdersData(req.body)
        const doc = await googleSpreadsheetInit();
        await populateFillingSheet(doc, data);
        res.status(200).send();
    } catch (err) {
        res.status(404).send();
    }

})

app.post('/webhooks/orders/fulfilled', async function (req, res) {
    try {
        const data = req.body;
        console.log('Showing all the fulfilled orders...')
        console.log(data);
        res.status(200).send()
    } catch (err) {
        console.log(err.message)
        res.status(404).send(err)
    }
})

app.post('/webhooks/sms/incoming', function (req, res) {
    try {
        console.log(req);
        res.status(200).send()
    } catch (err) {

    }
})

app.post('/webhooks/sms/status', function (req, res) {
    try {
        console.log(req.body);
        res.status(200).send()

    } catch (err) {

    }
})

app.post('/webhooks/sms/status/fallback', function (req, res) {
    try {
        console.log(req.body);
        res.status(200).send()

    } catch (err) {

    }
})

app.listen(port, function () {
    console.log("Server is running at port " + port);
})

app.use(function (req, res, next) {
    res.status(404);
    res.send("Error 404. Page Not Found:(");
    next();
})