const express = require('express')
const soket = require('socket.io')
const http = require('http')
const path = require('path')
const {Chess} = require('chess.js')

const app = express();

const server = http.createServer(app)
const io = soket(server);

const chess = new Chess();

let player = {}
let curplayer = 'W'

app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')));


app.get("/",(req,res)=>{
    res.render('index',{title:"chess game"});
})

io.on("connection",function(uniquesocket){
    console.log('connected');
    // uniquesocket.on('churan',function(){
    //     console.log('churan received')
    //     io.emit('churan papdi');
    // }) 
    if(!player.white){
        player.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if(!player.black){
        player.black = uniquesocket.id;
        uniquesocket.emit("playerRole",'b');
    }
    else{
        uniquesocket.emit("spectator");
    }


    uniquesocket.on('disconnect',function(){
        console.log("disconnected");
        if(uniquesocket.id === player.white){
            delete player.white;
        }
        else if(uniquesocket.id === player.black){
            delete player.black;
        }
    })
    uniquesocket.on("move",function(move){
        try {
            if(chess.turn() == "w" && uniquesocket.id !== player.white) return;
            if(chess.turn() == "b" && uniquesocket.id !== player.black) return;

            const result = chess.move(move);
            if(result){
                io.emit("move",move);
                io.emit("boardState",chess.fen());
            }else{
                console.log('invalid move: ',move);
                uniquesocket.emit("invalid move",move);
            }
        } catch (error) {
            console.log(`${error}`);
            uniquesocket.emit("invalid move",move);
        }
    })
    
})
server.listen(3000)