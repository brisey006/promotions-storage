module.exports = {
    formError: (errors) => {
        const error = new Error(JSON.stringify(errors));
        error.status = 406;
        return error;
    },
    systemError: (message, status) => {
        const error = new Error(JSON.stringify([message]));
        error.status = status;
        return error;
    }
}