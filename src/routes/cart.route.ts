import express from "express"
import { changeUserRole, deleteUser, getAllUsers, getUser, newUser } from "../controllers/user.js"
import { adminOnly } from "../middleware/auth.js"
import { addItemToWishlist, getWishlist } from "../controllers/cart.js"
// import {Router} from "express"
// const router = Router()
const wishlistRouter = express.Router()

// router.route("/login").post(loginUser)

wishlistRouter.post("/addItemToWishlist",adminOnly, addItemToWishlist)
wishlistRouter.get("/wishlist",adminOnly, getWishlist)


export default wishlistRouter

