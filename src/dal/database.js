import { Sequelize, DataTypes } from "sequelize";

/**
 * A class to create and manage database connections and assosciated models.
 */
class Database
{
    sequelize = undefined;
    UrlDetail = undefined;

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
        this.sequelize = new Sequelize(DB_NAME, DB_USER, DB_PWD, {
            host: DB_HOST,
            port: DB_PORT,
            dialect: 'mssql',
            logging: null,
            dialectOptions: {
                options: {
                    encrypt: true,
                    trustServerCertificate: true
                },
            },
        });

        this.UrlDetail = this.sequelize.define('UrlDetail', {
            HashValue: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "HashValue",
                primaryKey: true
            },
            TargetUrl: {
                type: DataTypes.STRING,
                field: "TargetUrl"
            }
        }, {
            tableName: "UrlDetails",
            schema: "Shrinkify",
            timestamps: false
        });
    }

    /**
     * Test if the connection to remote database server can be established successfully.
     * @returns {boolean} - value indicating if connection was established successfully.
     */
    async TestConnection()
    {
        try
        {
            await this.sequelize.authenticate();
            console.log("Database connectivity has been established successfully.");
            return true;
        }
        catch(error)
        {
            console.log("Error occurred while testing database connectivity::", error);
            return false;
        }
    }

    /**
     * Searches for a hash in the database and returns its mapped target url.
     * @param {string} hashValue - hash value to be searched in the database.
     * @returns {Array} - returns an array of 2 values - first value being the target url mapped to the given hash. 2nd value is a boolean indicating if any records were present in the database.
     */
    async FindUrlByHash(hashValue)
    {
        let targetUrl = "";
        let Exists = false;

        try
        {
            let result = await this.UrlDetail.findByPk(hashValue);
            let targetUrl = undefined;
            if(result !== null)
            {
                targetUrl = result.TargetUrl;
                Exists = true;
            }
        }
        catch(error)
        {
            targetUrl = "";
            Exists = false;
            console.log(`Error occurred while querying SQL table for records matching hash - ${hashValue}: ${error}`);
        }

        return [targetUrl, Exists];
    }

    /**
     * Searches the database for a record with target url that matches the given value.
     * @param {string} targetUrl - target url to be searched in the database.
     * @returns {Array} - returns an array of 2 values - first value being the hash value mapped to the given target url and the second value being a boolean indicating the presence of records matching the given criteria in the database.
     */
    async FindByTargetUrl(targetUrl)
    {
        let hashValue = undefined;
        let urlExists = false;

        try
        {
            let result = await this.UrlDetail.findOne({ where: { TargetUrl: targetUrl } });
            if(result !== null)
            {
                urlExists = true;
                hashValue = result.HashValue;
            }
        }
        catch(error)
        {
            urlExists = false;
            hashValue = undefined;
            console.log(`Error occurred while querying SQL table for records matching target url - ${targetUrl}: ${error}`);
        }

        return [hashValue, urlExists];
    }

    /**
     * Inserts the given hash and corresponding target URL in the database.
     * @param {string} targetUrl - target URL mapped to the given hash.
     * @param {string} hashValue - hash value of the URL record.
     * @returns {boolean} - if the record was created successfully in the database.
     */
    async CreateHash(targetUrl, hashValue)
    {
        let isSuccess = false;

        try
        {
            await this.UrlDetail.create({
                HashValue: hashValue,
                TargetUrl: targetUrl
            });

            isSuccess = true;
            console.log(`New Url Detail for ${hashValue} has been successfully created in SQL table.`);
        }
        catch(error)
        {
            isSuccess = false;
            console.log(`Error occurred while inserting records in SQL table: ${error}`);
        }

        return isSuccess;
    }

    /**
     * Deletes the record in database that matches the given hash value.
     * @param {string} hashValue - hash value to be deleted from database.
     * @returns {boolean} - returns if the deletion of record was successful.
     */
    async DeleteHash(hashValue)
    {
        let isSuccess = false;

        try
        {
            await this.UrlDetail.destroy({
                where: {
                    HashValue: hashValue,
                },
            });
    
            console.log(`Record in SQL table corresponding to hash - ${hashValue} has been deleted successfully.`);
        }
        catch(error)
        {
            isSuccess = false;
            console.log(`Error occurred while deleting records from SQL table: ${error}`);
        }

        return isSuccess;
    }
}

export { Database };