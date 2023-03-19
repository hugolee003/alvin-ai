const express = require('express')
const http = require('http')
const cors = require("cors");
const session = require('express-session')
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongodb-session')(session)
const menu = require('./helper')
require('dotenv').config()

const app = express()
const server = http.createServer( app )
const io = new Server( server )
const PORT = process.env.PORT;
const DB = process.env.DB;
const SECRET = process.env.SECRET;
require("./db")( DB );

const store = new MongoStore({
  uri: DB,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log(error);
});

const sessionMid = session({
  secret: SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, httpOnly: true }, // Set secure to true if using HTTPS
});


app.use( sessionMid )
app.use(cookieParser())
app.use(cors())
app.use(express.static("public"));
app.get("/", ( req, res ) => {
    res.sendFile(__dirname + "/public" + "/index.html")
})

const wrap = (midddleware) => (socket, next) =>
  midddleware(socket.request, {}, next);
io.use(wrap( sessionMid ))
io.on("connection", ( socket ) => {
    console.log("A user connected", socket.id)

    socket.on("request", function(data){
      const userInput = parseInt( data )

      if (userInput === 1){
        socket.emit("menu", menu)
      }
      

      if (isNaN(data)){
        socket.emit("input_error", "Please input a valid number")
      }
    })


})

server.listen(PORT, () => {
    console.log(`Server is running on PORT ${ PORT }`)
})