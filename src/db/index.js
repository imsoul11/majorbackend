import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"; // put .js always else this can cause error

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // This line connect the database
        console.log(`\n MongoDb connected ${connectionInstance.connection.host}`)
        
        // app.listen(process.env.PORT, () => {
        //     console.log(`App is listening on port ${process.env.PORT}`)
        // })

    }
    catch (e) {
        console.log('MongoDb connection failed', e)
        process.exit(1)
    }
}

export default connectDB