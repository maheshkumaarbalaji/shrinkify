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
     * @returns {Array} - returns an array of 2 values - first value is a boolean indicating if the connection was established successfully, second value returns the error object in case of error encountered.
     */
    async TestConnection()
    {
        try
        {
            await this.sequelize.authenticate();
            return [true, null];
        }
        catch(error)
        {
            return [false, error];
        }
    }

    /**
     * Searches for a hash in the database and returns its mapped target url.
     * @param {string} hashValue - hash value to be searched in the database.
     * @returns {Array} - returns an array of 3 values - first value being the target url mapped to the given hash. 2nd value is a boolean indicating if any records were present in the database and the last value being the error object containing details of error occurred.
     */
    async FindUrlByHash(hashValue)
    {
        try
        {
            let result = await this.UrlDetail.findByPk(hashValue);
            if(result !== null)
            {
                return [result.TargetUrl, true, null];
            }
            else
            {
                return ["", false, null];
            }
        }
        catch(error)
        {
            return ["", false, error];
        }
    }

    /**
     * Searches the database for a record with target url that matches the given value.
     * @param {string} targetUrl - target url to be searched in the database.
     * @returns {Array} - returns an array of 3 values - first value being the hash value mapped to the given target url and the second value being a boolean indicating the presence of records matching the given criteria in the database, last value is the error object and null in case of successful processing.
     */
    async FindByTargetUrl(targetUrl)
    {
        let hashValue = undefined;

        try
        {
            let result = await this.UrlDetail.findOne({ where: { TargetUrl: targetUrl } });
            if(result !== null)
            {
                hashValue = result.HashValue;
                return [hashValue, true, null];
            }
            else
            {
                return ["", false, null];
            }
        }
        catch(error)
        {
            urlExists = false;
            hashValue = undefined;
            return ["", false, error];
        }
    }

    /**
     * Inserts the given hash and corresponding target URL in the database.
     * @param {string} targetUrl - target URL mapped to the given hash.
     * @param {string} hashValue - hash value of the URL record.
     * @returns {Array} - returns an array of 2 values - first value is a boolean indicating if the record was created. Second value is an error object if record was not created in the database.
     */
    async CreateHash(targetUrl, hashValue)
    {
        try
        {
            await this.UrlDetail.create({
                HashValue: hashValue,
                TargetUrl: targetUrl
            });

            return [true, null];
        }
        catch(error)
        {
            return [false, error];
        }
    }

    /**
     * Deletes the record in database that matches the given hash value.
     * @param {string} hashValue - hash value to be deleted from database.
     * @returns {Array} - returns an array of 2 values - 1st value is a boolean indicating if any records were present in the database and the last value being the error object containing details of error occurred.
     */
    async DeleteHash(hashValue)
    {
        try
        {
            await this.UrlDetail.destroy({
                where: {
                    HashValue: hashValue,
                },
            });

            return [true, null];
        }
        catch(error)
        {
            return [false, error];
        }
    }
}

export { Database };