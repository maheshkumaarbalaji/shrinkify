class SuccessResponse
{
    UrlHash = "";
    TargetUrl = "";

    constructor(urlHash, targetUrl)
    {
        this.UrlHash = urlHash;
        this.TargetUrl = targetUrl;
    }

    ToJsonString()
    {
        return JSON.stringify({UrlHash: this.UrlHash, TargetUrl: this.TargetUrl});
    }
};

const ErrorCodes = {
    ERR_INTERNAL: "Internal Server Error",
    ERR_HASH_NOTFOUND: "Hash Not Found",
};

class ErrorResponse
{
    ErrorCode = "";
    Message = "";

    constructor(errCode)
    {
        this.ErrorCode = errCode;
        if(errCode === ErrorCodes.ERR_INTERNAL)
        {
            this.Message = "An internal server error occurred while processing your request. Please try again later";
        }
        else if(errCode === ErrorCodes.ERR_HASH_NOTFOUND)
        {
            this.Message = "The given URL hash value could not be found in our record(s)";
        }
        else
        {
            this.Message = "Some unexpected error occurred";
        }
    }

    ToJsonString()
    {
        return JSON.stringify({
            ErrorCode: this.ErrorCode,
            Message: this.Message,
        });
    }
};

export { ErrorCodes, SuccessResponse, ErrorResponse };