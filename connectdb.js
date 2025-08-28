const mongoose=require('mongoose')

require('dotenv').config()

const connect=()=>
    
    {
        try {
            const resp = mongoose.connect(process.env.DATABASE);
            console.log('database connect successfully');
        } 
        catch (error)
         {
            console.log(error);
        }
    }
    module.exports= connect;