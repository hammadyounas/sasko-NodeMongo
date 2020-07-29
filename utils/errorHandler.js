let errorHandler = error => {
    return {
        stack: error.stack,
        code: error.code,
        message: error.message
    }
}

module.exports = errorHandler;