function Coordinate (rowPos, colPos)
{
	this.row = rowPos;
	this.col = colPos;
}

function EmptySquare (coord)
{
		this.coordinate = coord;
		this.name = "emptySquare";
		this.boardId = this.name + this.coordinate.row + "-" + this.coordinate.col;
		var myself = this;
		
		this.Draw = function ()
		{
				var s = document.getElementById("square" + this.coordinate.row + "-" + this.coordinate.col);
				var emptySquare = document.createElement("div");
				emptySquare.setAttribute("class", this.name);
				emptySquare.setAttribute("id", this.boardId);
				
				emptySquare.onclick = function () {
							board.PlaceMove(myself.coordinate);
				};
				s.appendChild(emptySquare);
		}	
}

function GamePiece ()
{
	this.name = "GamePiece";
		
	this.CreateElement = function (piece, coord)
	{
		var s = document.getElementById("square" + coord.row + "-" + coord.col);
		var x = document.createElement("div");
		x.textContent = piece;
		
		x.setAttribute("class", "gamePiece");
		x.setAttribute("id", this.boardId);
		
		s.appendChild(x);
	}
}

function XPiece()
{
	GamePiece.call(this);
	this.name = "xpiece";
	this.pieceShape = "X";
	
	this.Draw = function (coord)
	{
		this.CreateElement(this.pieceShape, coord);
	}
}

function OPiece()
{
	GamePiece.call(this);
	this.name = "opiece";
	this.pieceShape = "O";
	
	this.Draw = function (coord)
	{
		this.CreateElement(this.pieceShape, coord);
	}
}

function Square (coord, size)
{
	this.coordinate = coord;
	this.name = "square";
	this.boardId = this.name + this.coordinate.row + "-" + this.coordinate.col;
	this.boardSize = size;
	
	this.Draw = function ()
	{
		var square = document.createElement('div');
		square.setAttribute("class", this.name);
		square.setAttribute("id", this.boardId);
		
				
		var row = document.getElementById("row" + this.coordinate.row);
		row.appendChild(square);
			
		
		// right 
		if( this.coordinate.col != this.boardSize-1){
			square.style.borderRight ="thin solid gray"
		}
		
		// bottom
		if( this.coordinate.row != this.boardSize-1)
		{
			square.style.borderBottom ="thin solid gray"
		}

	}
}

function Board()
{
	this.b = [];
	this.size = 3;
	this.PlayerOne;
	this.PlayerTwo;
	this.ActivePlayer;
	this.EmptySquares = [];
	
	this.StartGame = function ()
	{
		this.PlayerOne = new Player(new XPiece(), this.size);
		this.PlayerTwo = new Player(new OPiece(), this.size);
		
		this.PlayerOne.NextPlayer = this.PlayerTwo;
		this.PlayerTwo.NextPlayer = this.PlayerOne;
		this.ActivePlayer = this.PlayerOne;
	}
	
	this.DrawBoard = function ()
	{
		var boardEl = document.getElementById("gameBoard");

		
		for (var i = 0; i < this.size; i++) 
		{
			var row =  document.createElement("div");
			row.setAttribute("class", "rowDiv");
			row.setAttribute("id", "row" + i);
			var row = boardEl.appendChild(row);
						   
			this.b[i] = []; 
			
			for (var j = 0; j < this.size; j++)
			{
				var square = new Square(new Coordinate(i, j), this.size);
				square.Draw();
				
				var emSq = new EmptySquare(new Coordinate(i, j));
				emSq.Draw();
				this.EmptySquares.push(emSq);
				this.b[i].push(emSq);			
			}
		}
	}
	
	this.PlaceMove = function(coord)
	{
		ClearSquare(coord);
		
		var piece = this.ActivePlayer.GamePiece;
		piece.Draw(coord);
				
		this.b[coord.row][coord.col] = piece;
		
		this.CheckIfGameIsDone(coord);
		
		this.ActivePlayer = this.ActivePlayer.NextPlayer;
	}
	
	function ClearSquare(coord)
	{
		var square = document.getElementById("square" + coord.row + "-" + coord.col);
		
		while (square != null && square.firstChild) 
		{
			square.removeChild(square.lastChild);
		}	
	}

	this.CheckIfGameIsDone = function (lastGamePieceCoord){
		var gameOver = this.ActivePlayer.CountPieceAndCheckIfWon(lastGamePieceCoord);
		var gameOverString = "";
		
		if(gameOver)
		{
			gameOverString = this.ActivePlayer.GamePiece.pieceShape + "'s win!";
		}
		else
		{
			// Check for draw
			for(let i = 0; i < this.EmptySquares.length; i++)
			{
				if(lastGamePieceCoord.row ==  this.EmptySquares[i].coordinate.row && lastGamePieceCoord.col ==  this.EmptySquares[i].coordinate.col)
				{
					this.EmptySquares.splice(i,1);
					break;
				}
			}
			
			if(this.EmptySquares.length == 0)
			{
				gameOver = true;
				gameOverString = "It's a draw";
			}
		}
		if(gameOver)
		{
			var body = document.getElementById("gameBoard");

			var gameOver =  document.createElement("div");
			gameOver.setAttribute("class", "endGameBox");
			gameOver.setAttribute("id", "endGameBox");
			body.appendChild(gameOver);
			
			var gameOverMsg =  document.createElement("div");
			gameOverMsg.setAttribute("class", "endGameMessage");
			gameOverMsg.setAttribute("id", "endGameMessage");
			gameOverMsg.textContent = gameOverString;
			gameOver.appendChild(gameOverMsg);
			
			// New Game box
			var newGameBox = document.createElement("div");
			newGameBox.setAttribute("class", "newGameBox");
			newGameBox.setAttribute("id", "newGameBox");
			newGameBox.textContent = "New Game";
			newGameBox.onclick = function () {
				board.NewGame();
			};
			gameOver.appendChild(newGameBox);	
			
		}
	}
	
	this.NewGame = function()
	{
		var boardEl = document.getElementById("gameBoard");
		
		while (boardEl != null && boardEl.firstChild) 
		{
			boardEl.removeChild(boardEl.lastChild);
		}	
		
		this.StartGame();
		this.DrawBoard();
	}
}

function Player(gamePiece, boardSize)
{
	this.NextPlayer;
	this.GamePiece = gamePiece;
	this.boardSize = boardSize;
	this.rowPieces = new Array(boardSize).fill(0);
	this.colPieces = new Array(boardSize).fill(0);
	this.diagPieces = 0;
	this.invDiagPieces = 0;
	
	this.CountPieceAndCheckIfWon = function (coord) 
	{
		this.rowPieces[coord.row] += 1;
		if(this.rowPieces[coord.row] == this.boardSize)
		{
			return true;
		}
		
		this.colPieces[coord.col] += 1;
		if(this.colPieces[coord.col] == this.boardSize)
		{
			return true;
		}
		
		if(coord.row == coord.col)
		{
			this.diagPieces += 1;
			if(this.diagPieces == this.boardSize)
			{
				return true;
			}
		}
		
		if(coord.row + coord.col == this.boardSize - 1)
		{
			this.invDiagPieces += 1;
			if(this.invDiagPieces == this.boardSize){
				return true;
			}
		}
		
		return false;
	}
	

}

var board = new Board();
board.StartGame();
board.DrawBoard();