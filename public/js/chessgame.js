
const socket = io();
// for app.js line 27
// socket.emit('churan') 
// socket.on('churan papdi',function(){
//     console.log("churan papdi received")
// })
const chess = new Chess();
const boardElement = document.querySelector('.chessboard')

let draggedPiece = null;
let sourceSquare = null;
let PlayerRole = null;

const renderBoard = ()=>{
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
            const squareElement = document.createElement('div');
            squareElement.classList.add("square",(rowindex+squareindex) %2 === 0 ?"light":"dark");


            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex 
            
            if(square){
                const PieceElement = document.createElement('div')
                PieceElement.classList.add('piece',square.color === 'w'?"white":"black");
                PieceElement.innerText = getPieceUniCode(square)
                PieceElement.draggable = PlayerRole === square.color

                PieceElement.addEventListener("dragstart",(e)=>{
                    if(PieceElement.draggable){
                        draggedPiece = PieceElement;
                        sourceSquare = {row:rowindex , col:squareindex};
                        e.dataTransfer.setData("text/plain"," ")
                    }
                })
                PieceElement.addEventListener("dragend",(e)=>{
                    draggedPiece = null,
                    sourceSquare = null
                })
                squareElement.appendChild(PieceElement);
            }
            squareElement.addEventListener("dragover",(e)=>{
                e.preventDefault();
            })
            squareElement.addEventListener('drop',(e)=>{
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    }
                    handelMove(sourceSquare,targetSource);
                }
            })
            boardElement.appendChild(squareElement);
        })
        // 1hr 36m
    })

}
const handelMove = (source , target)=>{
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8-source.row}` ,
        to: `${String.fromCharCode(97 + target.col)}${8-target.row}`,
        promotion: 'q',
    };
    socket.emit("move",move);
}
const getPieceUniCode = (piece)=>{
    const unicodepieces = {
        p : "♟",
        r : "♜",
        n : "♞",
        b : "♝",
        q : "♛",
        k : "♚",
        P : "♙",
        R : "♖",
        N : "♘",
        B : "♗",
        Q : "♕",
        K : "♔"
    };
    return unicodepieces[piece.type] || "";
}
socket.on("playerRole",function(role){
    PlayerRole = role;
    renderBoard();
})
socket.on("spectatorRole",function(){
    PlayerRole = null;
    renderBoard();
})
socket.on("boradState",function(fen){
    chess.load(fen);
    renderBoard();
})
socket.on("move",function(move){
    chess.move(move);
    renderBoard();
})
renderBoard();
