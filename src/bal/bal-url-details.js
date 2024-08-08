import { Database } from "../dal/database";
import { GetHashFor } from "../utils/utilities";

/**
 * Class that contains the business logic for all url detail processing.
 */
class BalUrlDetails
{
    database = undefined;

    /**
     * @constructor
     * @param {string} DB_NAME - Name of the database
     * @param {string} DB_USER - SQL login username
     * @param {string} DB_PWD - SQL login password
     * @param {string} DB_HOST - Name of the database server
     * @param {number} DB_PORT - Port number of the database server
     */
    constructor(DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT)
    {
        this.database = new Database(DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT);
    }

    TestDbConnection()
    {
        let [connected, error] = this.database.TestConnection();
        if(error)
        {
            console.log(`Error occurred while testing database connection: ${error}`);
        }
        else if (connected)
        {
            console.log(`Database connection test was successful.`);
        }
    }

    GetUrl(urlHash)
    {
        return this.database.FindUrlByHash(urlHash);
    }

    DeleteUrl(urlHash)
    {
        let [targetUrl, exists, error] = this.database.FindUrlByHash(urlHash);
        if(error)
        {
            return ["", false, error];
        }
        else if(!exists)
        {
            return ["", false, null];
        }
        else
        {
            let [deleteSuccess, error] = this.database.DeleteHash(urlHash);
            if(error)
            {
                return ["", false, error];
            }
            else if(deleteSuccess)
            {
                return [targetUrl, true, null];
            }
        }
    }

    CreateUrl(targetUrl)
    {
        let [ExistingHash, Exists, error] = this.database.FindByTargetUrl(targetUrl);
        if(error)
        {
            return ["", false, error];
        }
        else if(Exists)
        {
            return [ExistingHash, true, null];
        }
        else
        {
            let NewHash = GetHashFor(targetUrl);
            let [CreateSuccess, err] = this.database.CreateHash(targetUrl, NewHash);
            if(err)
            {
                return ["", false, err];
            }
            else if(CreateSuccess)
            {
                return [NewHash, true, null];
            }
        }
    }
}

export { BalUrlDetails };