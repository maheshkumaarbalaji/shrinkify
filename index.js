import { config } from 'dotenv';
config();
let { DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT } = process.env;

import express from 'express';
import morgan from 'morgan';
import { BalUrlDetails } from "./src/bal/bal-url-details.js";
import { ErrorResponse, SuccessResponse, ErrorCodes } from './src/models/responses.js';

const BAL = new BalUrlDetails(DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT);
BAL.TestDbConnection();

const server = express();
let PortNumber = process.env.PORT || 8080;
let Hostname = process.env.HOST || "localhost";

server.use(morgan('common'));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));


/**
 * A GET route to find the target URL for given hash and reroute the user accordingly. 
 */
server.get("/link/:urlHash", async (req, res) => {
    let urlHashValue = req.params.urlHash;
    let [targetUrl, Exists, error] = BAL.GetUrl(urlHashValue);
    if(error)
    {
        res.setHeader("Content-Type", "application/json");
        let message = new ErrorResponse(ErrorCodes.ERR_INTERNAL);
        res.status(500).send(message.ToJsonString());
    }
    else if(Exists)
    {
        let message = new SuccessResponse(urlHashValue, targetUrl);
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(message.ToJsonString());
    }
    else
    {
        res.setHeader("Content-Type", "application/json");
        let message = new ErrorResponse(ErrorCodes.ERR_HASH_NOTFOUND);
        res.status(404).send(message.ToJsonString());
    }
});


/**
 * DELETE route to delete the given shrinkified URL.
 */
server.delete("/link/:urlHash", async (req, res) => {
    let urlHashValue = req.params.urlHash;
    let [targetUrl, Success, error] = BAL.DeleteUrl(urlHashValue);
    if(error)
    {
        res.setHeader("Content-Type", "application/json");
        let message = new ErrorResponse(ErrorCodes.ERR_INTERNAL);
        res.status(500).send(message.ToJsonString());
    }
    else if(Success)
    {
        let message = new SuccessResponse(urlHashValue, targetUrl);
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(message.ToJsonString());
    }
    else
    {
        res.setHeader("Content-Type", "application/json");
        let message = new ErrorResponse(ErrorCodes.ERR_HASH_NOTFOUND);
        res.status(404).send(message.ToJsonString());
    }
});


/**
 * POST route to create a new hash for the given target URL. 
*/
server.post("/link", async (req, res) => {
    let TargetUrl = req.body.TargetUrl;
    let [hashValue, Success, error] = BAL.CreateUrl(TargetUrl);
    if(error)
    {
        res.setHeader("Content-Type", "application/json");
        let message = new ErrorResponse(ErrorCodes.ERR_INTERNAL);
        res.status(500).send(message.ToJsonString());
    }
    else if(Success)
    {
        let message = new SuccessResponse(hashValue, TargetUrl);
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(message.ToJsonString());
    }
    else
    {
        res.setHeader("Content-Type", "application/json");
        let message = new ErrorResponse(ErrorCodes.ERR_HASH_NOTFOUND);
        res.status(404).send(message.ToJsonString());
    }
});


server.listen(PortNumber, () => {
    console.log(`Shrinkify services are available at http://${Hostname}:${PortNumber}`);
});
