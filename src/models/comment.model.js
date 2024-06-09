import mongoose,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const commentSchema = new Schema({
    content:{
        type:String,   
        required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }


},{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate);


export const Comment =  mongoose.model("Comment", commentSchema);








/*
I'd be glad to explain the mongooseAggregatePaginate plugin and its usage in Mongoose:

Purpose:

Enables pagination for complex queries built using Mongoose's aggregation framework.
Simplifies fetching data in chunks (pages) along with pagination metadata like total documents, current page number, etc.
Functionality:

Once applied to your Mongoose schema, it adds a new method called aggregatePaginate to your model.
This method accepts two arguments:
An aggregation pipeline (an array of aggregation stages) defining your complex query.
An options object to customize pagination behavior (e.g., page number, limit, sort criteria).
Benefits:

Enhances performance by fetching data in manageable portions, especially for large datasets.
Provides a convenient way to handle pagination logic within your Mongoose queries.
Example Usage:

JavaScript
import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
});

productSchema.plugin(mongooseAggregatePaginate);

const Product = mongoose.model('Product', productSchema);

// Example complex query with pagination
const aggregate = [
  { $match: { category: 'electronics' } },
  { $sort: { price: 1 } },
];

const options = {
  page: 2, // Page number (defaults to 1)
  limit: 10, // Documents per page (defaults to 10)
};

Product.aggregatePaginate(aggregate, options)
  .then((result) => {
    console.log(result.docs); // Array of products on the current page
    console.log(result.totalDocs); // Total number of documents matching the query
    console.log(result.totalPages); // Total number of pages
    // ... other pagination metadata
  })
  .catch((error) => {
    console.error(error);
  });
Use code with caution.
content_copy
Key Points:

The aggregatePaginate method returns a Promise that resolves to an object containing the paginated data and metadata.
You can customize pagination options by providing them in the second argument.
Refer to the official documentation for more details on available options and advanced usage: https://www.npmjs.com/package/mongoose-aggregate-paginate-v2?activeTab=readme
By effectively using mongooseAggregatePaginate, you can create efficient and user-friendly pagination experiences for complex Mongoose queries.
*/