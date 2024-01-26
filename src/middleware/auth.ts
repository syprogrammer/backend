import { User } from "../models/user.models.js";
import ErrorHandler from "../utils/errorHandler.js";
import { asyncErrorHandler } from "./error.middleware.js";


export const adminOnly = asyncErrorHandler(async (req, res, next) => {

    const { id } = req.query
    if (!id) return next(new ErrorHandler("please provided id", 401))
    const user = await User.findById(id)
    if (!user) return next(new ErrorHandler("your id is invalid", 401))

    if (user.role !== "admin") {
        return next(new ErrorHandler("access is unauthorized", 401))

    }
    next()

})