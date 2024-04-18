import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app, { initServer } from "./app.js";

dotenv.config({
    path: "./env"
})

console.log(process.env.PORT)


//graphql setup 

async function init(){
    const app = await initServer()
    app.listen(8000,()=>console.log("server started successfully"))
}


init()




// connectDB().then(() => {
    
//     app.listen(process.env.PORT || 4000, () => {
//         console.log("Server is started successfully on port: ", process.env.PORT)
//     })

//     app.on("error",(err)=>{
//         console.log("server failed to start ",err)
//     })
// }).catch((err) => {
//     console.log("Mongodb connection failed !!!", err)
// })