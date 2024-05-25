import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
))

app.use(express.json({limit:"16kb"}))
// to put a limit on the size of the file that can be recieved on the backend
app.use(express.urlencoded({extended:true,limit:"16kb"}))
// this to make ensure that the url is correctly interpreted like Hitesh choudhary when searched is encoded as  Hitesh%20choudhary in the url so to get it whe should decode it 
app.use(express.static("public"))
// to setup public folder 
app.use(cookieparser())
// to edit and set cookies in user browser in a secure mode

// (err,req,res,next)

export { app }