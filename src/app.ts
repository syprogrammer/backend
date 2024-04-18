import express from 'express'
const app = express()
import cors from "cors"
import { errorMiddleware } from './middleware/error.middleware.js'
import cartRoute from "./routes/cart.route.js"
import userRoute from "./routes/user.routes.js"
import orderRoute from "./routes/order.routes.js"
import productRoute from './routes/product.routes.js'
import paymentRoute from './routes/payment.routes.js'
import dashboardRoute from './routes/dashboard.routes.js'
import NodeCache from 'node-cache'
import Stripe from "stripe"
import morgan from 'morgan'


//apollo server setup
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';


export async function initServer() {
    const app = express();
    app.use(express.json({ limit: "100kb" }))
    const graphqlServer = new ApolloServer({
        typeDefs: `
        type Query{
          sayHello:String
        }
        `,
        resolvers: {
            Query: {
                sayHello:()=>`Hello From Graphql Server`
            },
            // Mutation:{}
        }
    })

    await graphqlServer.start()
    app.use("/graphql", expressMiddleware(graphqlServer))

    return app

}








//Handle cors 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//Required Middlewares
app.use(express.json({ limit: "100kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
// app.use(cookieParser())
app.use(morgan("dev"))
//Routes
app.get("/", (req, res) => {
    res.send("Server is working properly")
})

app.use("/api/v1/user", userRoute)
app.use("/api/v1/product", productRoute)
app.use("/api/v1/order", orderRoute)
app.use("/api/v1/payment", paymentRoute)
app.use("/api/v1/dashboard", dashboardRoute)
app.use("/api/v1/cart", cartRoute)

//Error middleware to be used below route 
//to cache err from routes
app.use(errorMiddleware)
export const stripe = new Stripe(
    process.env.STRIPE_KEY || "",
)
export const myCache = new NodeCache()
export default app