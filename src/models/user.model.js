import mongoose ,{ Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    username: { 
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // Coudinary URL
        required: true,       
    },
    coverImage: {
        type: String, // CLoudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video',
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String,
    },
}
, { timestamps: true });

// dont use arrow function here because we need to use this keyword
// and arrow function does not have context of this
// this is a pre hook that will run before we save our user to db
// it will hash the password before saving it to db
// alsocheck if password is modified or not
// it is a middleware that is provided by mongoose

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    console.log("am i being called",password, this.password)
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
   return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
        // THIS IS THE PAYLOAD
        // WE CAN HAVE JUST ID THEN WE CAN FETCH OTHER DATA FROM DB
        //BUT WE ARE SENDING ALL DATA IN PAYLOAD
        // SO THAT WE DONT HAVE TO FETCH DATA FROM DB
        // WE SEND THIS ID TO CLIENT SIDE WITH ENCRYPTION
        
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }) 

}

export const User = mongoose.model('User', userSchema);
// bcypt helps you to hash your password
// jwt helps you to generate token
// jwt is a bearer token as whoever has the token can access the data


/*
1. Pagination:

Involves dividing large datasets into smaller, manageable chunks (pages) for efficient display and retrieval.
Common in web applications where displaying all data at once would be overwhelming or impractical.
Mongoose provides various approaches for pagination, including:
Using skip and limit in regular find queries.
Using the mongoose-paginate-v2 plugin for more advanced features.
2. Pipeline:

Refers to a sequence of operations applied to data in Mongoose.
Each operation is a "stage" in the pipeline, transforming or manipulating the data.
Pipelines are powerful for data processing and analysis.
3. Aggregation:

A specific type of pipeline used to perform complex calculations and data transformations on collections.
Involves stages like $match, $group, $sort, and others to filter, group, and manipulate data.
Aggregation is often used for tasks like:
Calculating statistics (e.g., average order value)
Finding trends and patterns
Creating custom reports
*/



/*
User Login:

The user provides their username and password during login.
The server verifies the password against the hashed password stored in the database.
Access Token Generation:

If the password is correct, the server generates an access token.
This access token typically includes the user's ID (_id) as one of the claims in the payload.
Client-Side Storage:

The access token is sent back to the client-side (e.g., web browser) and stored in local storage or cookies.
Accessing Protected Resources:

With each subsequent request to protected resources, the client-side automatically includes the access token in the request header.
Server-Side Verification:

The server receives the request and extracts the access token.
It verifies the token's signature and, if valid, extracts the user ID from the payload.
Authorization:

Using the extracted user ID, the server can identify the user and determine their access permissions.
Based on these permissions, the server grants or denies access to the requested resource.
Key Points:

The access token acts as a temporary "key" that allows the user to access protected resources without re-entering their password for each request.
The user ID in the token helps the server identify the user and grant appropriate access based on their permissions.
If a user is not authenticated, they won't have a valid access token and therefore will be denied access to protected resources.
Additional Considerations:

Access tokens have a limited lifespan to mitigate security risks.
Refresh tokens can be used to obtain new access tokens when the current one expires.
Robust token management strategies are crucial for ensuring secure and efficient authentication.
*/


