const asyncHandler =(requestHandler)=>{
    
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}



/*
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    new Promise((resolve, reject) => {
      const result = requestHandler(req, res, next);
      if (result instanceof Promise) {
        result.then(resolve).catch(reject);
      } else {
        resolve(result);
      }
    })
      .then((message) => {
        console.log('This is in the then + message)');
      })
      .catch((err) => {
        next(err);
      });
  };
};
*/
// couldh you explain from where this req,res,next is coming from
// i undestand that we are passing a function as requestHandler and then we are passing the req,res,next to the requestHandler function
// but from where these req,res,next are coming from

export {asyncHandler}






// const asyncHandler = (fn)=>{
//     async (req,res,next)=>{
//         try{
//            await fn(req,res,next)
//         }
//         catch(err)
//         {
//             res.status(err.code || 500).json({
//                 success:false,
//                 message:err.message,
//             })
//         }
//     }
// }