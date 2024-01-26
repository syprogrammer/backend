import express from 'express'
const app = express()
import cors from "cors"
import { errorMiddleware } from './middleware/error.middleware.js'
import userRoute from "./routes/user.routes.js"
import orderRoute from "./routes/order.routes.js"
import productRoute from './routes/product.routes.js'
import paymentRoute from './routes/payment.routes.js'
import dashboardRoute from './routes/dashboard.routes.js'
import NodeCache from 'node-cache'
import Stripe from "stripe"
import morgan from 'morgan'
//Handle cors 
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//Required Middlewares
app.use(express.json({limit:"100kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
// app.use(cookieParser())
app.use(morgan("dev"))
//Routes
app.get("/",(req,res)=>{
    res.send("Server is working properly")
})

app.use("/api/v1/user",userRoute)
app.use("/api/v1/product",productRoute)
app.use("/api/v1/order",orderRoute)
app.use("/api/v1/payment",paymentRoute)
app.use("/api/v1/dashboard",dashboardRoute)

//Error middleware to be used below route 
//to cache err from routes
app.use(errorMiddleware)
export const stripe = new Stripe(
    process.env.STRIPE_KEY || "",
)
export const myCache = new NodeCache()
export default app