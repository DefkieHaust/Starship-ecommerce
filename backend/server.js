const app = require('./app');
const dotenv = require('dotenv')

// uncaught handle error;
process.on("uncaughtException", (err)=> {
    console.log(`Error: ${err.message}`)
    console.log("server is closing due to uncaught Exception error!")
    // for shutting down th server
    process.exit(1)
})

//config
dotenv.config({path: 'backend/config/.env'})


//database
const connectDatabase = require('./config/database');
connectDatabase();


const server = app.listen(process.env.PORT, ()=> {
    console.log(`server is running on localhost:${process.env.PORT}`)
})

// unhandled promise rejection error // server error;

process.on("unhandledRejection", (err)=> {
    console.log(`Error: ${err.message}` );
    console.log(`shutting down the server due to unhandled Promise Rejection`);

    server.close(()=> {
        process.exit(1)
    })
});