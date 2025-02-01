// This is a utility function that we will use to wrap our async route handlers. It will catch any errors that are thrown and pass them to the error handling middleware.
// This will help us to avoid writing try/catch blocks in every route handler.

// If an error is caught, it will pass it to the next middleware function, which will be our error handling middleware.

//It is higher order function that takes a function as an argument and returns a new function that will call the original function and catch any errors that are thrown.

/*

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
};

*/

const asyncHandler = async (req, res, next) => {
    (req, res, next) => {
        Promise.resolve(asyncHandler(req, res, next)).catch((err) => next(err));
    };
};
export { asyncHandler };
