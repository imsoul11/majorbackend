class apiError extends Error{
    constructor(statusCode,message="Something went Error",errors=[],stack="")
    {        
      super(message)  // sets the property to apiError through Error
      this.statusCode=statusCode
      this.data=null
      this.message=message // sets the property to apiError directly without changing the same property of Error
      this.success=false
      this.errors=errors

      if(stack)
        {
            this.stack=stack
        }
        else
        {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {apiError}