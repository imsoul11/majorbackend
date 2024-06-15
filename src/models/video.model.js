import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema =  new Schema({
        videoFile:{
            type:String,
            required:true,
        },
        thumbnail:{
            type:String,
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number, // we get it from cloudinary
            required:true,
        },
        views:{
            type:Number,
            default:0,
        },
        isPublished:{
            type:Boolean,
            default:false,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate);
// this takes our model to advance level

export const Video = mongoose.model("Video",videoSchema);




/*
The `videoSchema.plugin(mongooseAggregatePaginate)` line is used in a Node.js application that uses the Mongoose library to interact with a MongoDB database. Specifically, it adds the `mongooseAggregatePaginate` plugin to the `videoSchema` schema definition.

The `mongooseAggregatePaginate` plugin is a third-party Mongoose plugin that provides a convenient way to implement pagination for MongoDB aggregate queries. Pagination is the process of dividing a large set of data into smaller, more manageable chunks (pages) to display or process at a time.

When this plugin is added to a Mongoose schema, it extends the schema with a new method called `aggregatePaginate`. This method allows you to execute MongoDB aggregation pipelines and retrieve paginated results. The `aggregatePaginate` method takes the following arguments:

1. `pipeline`: An array of stages for the MongoDB aggregation pipeline.
2. `options` (optional): An object containing options for the pagination, such as:
   - `page`: The page number to retrieve (default: 1).
   - `limit`: The maximum number of documents to return per page (default: 10).
   - `sort`: The sort order for the documents (default: no sorting).
   - `populate`: Fields to populate (similar to Mongoose's `populate` method).

The `aggregatePaginate` method returns a Promise that resolves to an object containing the following properties:

- `docs`: An array of documents for the current page.
- `totalDocs`: The total number of documents across all pages.
- `limit`: The maximum number of documents per page.
- `page`: The current page number.
- `totalPages`: The total number of pages.
- `hasNextPage`: A boolean indicating whether there is a next page.
- `hasPrevPage`: A boolean indicating whether there is a previous page.
- `nextPage`: The page number of the next page (if available).
- `prevPage`: The page number of the previous page (if available).

By adding this plugin to your Mongoose schema, you can easily implement pagination for aggregation pipelines, which can be useful when dealing with large datasets or when you want to limit the amount of data returned to the client at once.
*/
