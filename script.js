const gameBoard = (() => {
    let boardState = new Array(9).fill(undefined);
    let gameOver = false;
    let twoPlayerMode = true;
    let botMode = false;
    const resetBoardState = () => gameBoard.boardState = new Array(9).fill(undefined);
    const _checkRows = () => {
        for (let i = 0; i < 3; i++) {
            let row = [];
            
            for (let j = 0; j < 3; j++){
                row.push(gameBoard.boardState[i * 3 + j]);
            }

            if (row.every((state) => state == 'X')) return [true, 'X'];
            if (row.every((state) => state == 'O')) return [true, 'O'];
        }

        return [false];
    } 
    const _checkColumns = () => {
        for (let i = 0; i < 3; i++) {
            let column = [];
            
            for (let j = 0; j < 3; j++){
                column.push(gameBoard.boardState[i + j * 3]);
            }
            
            if (column.every((state) => state == 'X')) return [true, 'X'];
            if (column.every((state) => state == 'O')) return [true, 'O'];
        }

        return [false];
    }
    const _checkDiagonals = () => {
        let diagonalOne = [gameBoard.boardState[0], gameBoard.boardState[4], gameBoard.boardState[8]];
        let diagonalTwo = [gameBoard.boardState[2], gameBoard.boardState[4], gameBoard.boardState[6]];

        if(diagonalOne.every((state) => state == 'X') || diagonalTwo.every((state) => state == 'X')) return [true, 'X'];
        if(diagonalOne.every((state) => state == 'O') || diagonalTwo.every((state) => state == 'O')) return [true, 'O'];
        
        return [false];
    }
    const checkForWinner = () => {
        const columnCheck = _checkColumns();
        const rowCheck = _checkRows();
        const diagonalCheck = _checkDiagonals();

        if (columnCheck[0]) {
            return [true, columnCheck[1]];
        } else if (rowCheck[0]) {
            return [true, rowCheck[1]];
        } else if (diagonalCheck[0]) {
            return [true, diagonalCheck[1]];
        } else if (gameBoard.boardState.every((state) => state == 'X' || state == 'O')) {
            return ['tie', 'tie'];
        }

        return [false];
    }
    return {
        boardState,
        gameOver,
        twoPlayerMode,
        botMode,
        resetBoardState,
        checkForWinner,
    };
})();

const gameController = (() => {
    const _gameBoardDisplay = document.querySelector('.gameBoard');
    const createBoard = (undefinedBoardStateArray) => {
        undefinedBoardStateArray.forEach((state, index) => {
            const squareDiv = document.createElement('div');
            squareDiv.classList.add('available');
            squareDiv.setAttribute('id', `s${index}`);
            squareDiv.textContent = state;
            _gameBoardDisplay.appendChild(squareDiv);
        });
    }
    const clearBoardDisplay = () => {
        const boardSquares = Array.from(document.querySelectorAll('.gameBoard div'));
        boardSquares.forEach((square) => {
            square.classList.add('available');
            square.textContent = '';
        });
    }
    const _updateBoardDisplay = (id, playerSymbol) => {
        const boardSquare = document.querySelector(`#${id}`);
        boardSquare.classList.remove('available');
        boardSquare.textContent = playerSymbol;
    }
    const _updateBoardText = (text) => {
        const gameBoardText = document.querySelector('#gameText');
        gameBoardText.textContent = `${text}`;
    }
    const _updateBoardMode = (text) => {
        const _gameBoardModeText = document.querySelector('.mode');
        _gameBoardModeText.textContent = `${text}`;
    }
    const startTwoPlayerGame = () => {
        const twoPlayModeButton = document.querySelector('#two');
        twoPlayModeButton.addEventListener('click', () => {
            gameBoard.twoPlayerMode = true;
            gameBoard.botMode = false;
            _updateBoardText("It's X's turn!");
            _updateBoardMode('2 Player Mode');
        });
    }
    const twoPlayerGame = () => {
        const boardSquares = Array.from(document.querySelectorAll('.gameBoard div'));
        boardSquares.forEach((square) => {
            square.addEventListener('click', (e) => {
                if (square.classList.value != 'available' || gameBoard.gameOver || !gameBoard.twoPlayerMode) return;

                if (player.playerOneTurn) {
                    _updateBoardDisplay(e.target.id, player.playerOne);
                    _updateBoardText("It's O's turn!");
                    player.playerOneTurn = false;
                    gameBoard.boardState[e.target.id.split("")[1]] = player.playerOne;
                } else {
                    _updateBoardDisplay(e.target.id, player.playerTwo);
                    _updateBoardText("It's X's turn!");
                    player.playerOneTurn = true;
                    gameBoard.boardState[e.target.id.split("")[1]] = player.playerTwo;
                }

                winner = gameBoard.checkForWinner();

                if(winner[0] == 'tie') {
                    _updateBoardText('Tie Game');
                    gameBoard.gameOver = true;
                    return;
                }
                else if (winner[0]) {
                    _updateBoardText(`${gameBoard.checkForWinner()[1]} Wins!`);
                    gameBoard.gameOver = true;
                    return;
                }
            });
        });
    }
    const startBotGame = () => {
        const botModeButton = document.querySelector('#bot');
        botModeButton.addEventListener('click', () => {
            gameBoard.twoPlayerMode = false;
            gameBoard.botMode = true;
            _updateBoardText("It's Man vs Machine");
            _updateBoardMode('Computer Mode');
        });
    }
    const botGame = () => {
        const boardSquares = Array.from(document.querySelectorAll('.gameBoard div'));
        boardSquares.forEach((square) => {
            square.addEventListener('click', (e) => {
                if (square.classList.value != 'available' || gameBoard.gameOver || !gameBoard.botMode) return;

                    _updateBoardDisplay(e.target.id, player.playerOne);
                    gameBoard.boardState[e.target.id.split("")[1]] = player.playerOne;
                    player.playerOneTurn = false;
                    console.log(gameBoard.boardState)
                    if (gameBoard.boardState.some((state => state == undefined))) {
                        _updateBoardDisplay(`s${_botMove()}`, player.playerTwo);
                        player.playerOneTurn = true;    
                    }

                winner = gameBoard.checkForWinner();

                if(winner[0] == 'tie') {
                    _updateBoardText('Tie Game');
                    gameBoard.gameOver = true;
                }
                else if (winner[0]) {
                    _updateBoardText(`${gameBoard.checkForWinner()[1]} Wins!`);
                    gameBoard.gameOver = true;
                }
            });
        });
    }
    const _botMove = () => {
        let bestScore = -Infinity;
        let move;
        gameBoard.boardState.forEach((state, index) => {
            if (state == undefined) {
                gameBoard.boardState[index] = 'O';
                let score = _minimax(gameBoard.boardState, 0, false);
                gameBoard.boardState[index] = undefined;

                if (score > bestScore) {
                    bestScore = score;
                    move = index;
                }
            }
        });
        gameBoard.boardState[move] = 'O';
        return move;
    }
    const _minimax = (boardState, depth, isMaximizing) => {
        let scores = {
            X: -1,
            O: 1,
            tie: 0,
        }
        let result = gameBoard.checkForWinner();
        if (result[0] !== false) {
            return scores[result[1]];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            gameBoard.boardState.forEach((state, index) => {
                if (state == undefined) {
                    gameBoard.boardState[index] = 'O';
                    let score = _minimax(gameBoard.boardState, depth + 1, false);
                    gameBoard.boardState[index] = undefined;
                    bestScore = Math.max(score, bestScore)
                }
            });
            return bestScore;
        } else {
            let bestScore = Infinity;
            gameBoard.boardState.forEach((state, index) => {
                if (state == undefined) {
                    gameBoard.boardState[index] = 'X';
                    let score = _minimax(gameBoard.boardState, depth + 1, true);
                    gameBoard.boardState[index] = undefined;
                    bestScore = Math.min(score, bestScore)
                }
            });
            return bestScore;
        }
    }
    const restartGame = () => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        allButtons.forEach((button) => {
            button.addEventListener('click', () => {
                gameBoard.gameOver = true;
                gameBoard.resetBoardState();
                gameBoard.gameOver = false;
                player.playerOneTurn = true;
                clearBoardDisplay();
                if (gameBoard.twoPlayerMode) _updateBoardText("It's X's turn!");
                if (gameBoard.botMode) _updateBoardText("It's Man vs Machine");
            });
        });
    }
    const eventController = () => {
        gameController.createBoard(gameBoard.boardState);
        gameController.startTwoPlayerGame();
        gameController.startBotGame();
        gameController.restartGame();
        gameController.twoPlayerGame();
        gameController.botGame();
    }
    return {
        createBoard,
        clearBoardDisplay,
        startTwoPlayerGame,
        twoPlayerGame,
        startBotGame,
        botGame,
        restartGame,
        eventController,
    };
})();

const player = (() => {
    const playerOne = 'X';
    const playerTwo = 'O';
    let playerOneTurn = true;
    return {
        playerOne,
        playerTwo,
        playerOneTurn,
    };
})();

gameController.eventController();