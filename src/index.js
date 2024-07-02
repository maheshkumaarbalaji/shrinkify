import { config } from 'dotenv';
config();
let { DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT } = process.env;

import express from 'express';
import morgan from 'morgan';
import { GetHashFor } from './utils/utilities.js';
import { Database } from './dal/database.js';

const database = new Database(DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT);
let isConnected = await database.TestConnection();
if(!isConnected)
{
    process.exit(1);
}

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
    console.log(`Finding URL in store with hash value of ${urlHashValue}`);
    let [targetUrl, Exists] = await database.FindUrlByHash(urlHashValue);
    if(Exists)
    {
        res.location(targetUrl);
        res.redirect(302, targetUrl)
    }
    else
    {
        res.setHeader("Content-Type", "application/json")
        res.status(404).send(JSON.stringify({ Error: "URL Not Found" }));
    }
});

/**
 * POST route to create a new hash for the given target URL. 
*/
server.post("/link", async (req, res) => {
    let TargetUrl = req.body.TargetUrl;
    let [ExistingHash, urlExists] = await database.FindByTargetUrl(TargetUrl);
    if(!urlExists)
    {
        let urlHashValue = undefined, hashEx = false;
        do
        {
            urlHashValue = GetHashFor(TargetUrl);
            [, hashEx] = await database.FindUrlByHash(urlHashValue);
        }while(hashEx);

        let isSuccess = await database.CreateHash(TargetUrl, urlHashValue);
        if(isSuccess)
        {
            res.setHeader("Content-Type", "application/json")
            res.status(200).send(JSON.stringify({ShrinkifiedUrl: `http://${Hostname}:${PortNumber}/link/${urlHashValue}`}));
        }
        else
        {
            res.setHeader("Content-Type", "application/json")
            res.status(500).send(JSON.stringify({ Error: "Unexpected error occurred." }));
        }
    }
    else
    {
        res.setHeader("Content-Type", "application/json")
        res.status(302).send(JSON.stringify({ ShrinkifiedUrl: `http://${Hostname}:${PortNumber}/link/${ExistingHash}` }));
    }
});

/**
 * DELETE route to delete the given shrinkified URL.
 */
server.delete("/link/:urlHash", async (req, res) => {
    let urlHashValue = req.params.urlHash;
    let isSuccess = await database.DeleteHash(urlHashValue);
    if(isSuccess)
    {
        res.setHeader("Content-Type", "application/json")
        res.status(200).send(JSON.stringify({Message: "URL deleted successfully."}));
    }
    else
    {
        res.setHeader("Content-Type", "application/json")
        res.status(500).send(JSON.stringify({ Error: "Unexpected error occurred." }));   
    }
})


server.listen(PortNumber, () => {
    console.log(`Shrinkify services are available at http://${Hostname}:${PortNumber}`);
});
