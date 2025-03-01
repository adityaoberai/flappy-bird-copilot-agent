document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('.bird');
    const gameContainer = document.querySelector('.game-container');
    const ground = document.querySelector('.ground');
    const sky = document.querySelector('.sky');
    const scoreDisplay = document.getElementById('score-display');
    const finalScore = document.getElementById('final-score');
    const gameOverScreen = document.getElementById('game-over');
    const startScreen = document.getElementById('start-screen');
    const restartButton = document.getElementById('restart-button');
    
    // Game constants
    const GRAVITY = 0.5;
    const JUMP_FORCE = -8;
    const PIPE_SPEED = 2;
    const PIPE_INTERVAL = 2000; // Time in ms between pipe generation
    const GAP_SIZE = 150;
    
    // Game variables
    let birdVelocity = 0;
    let birdPosition = 50;
    let isGameStarted = false;
    let isGameOver = false;
    let score = 0;
    let pipes = [];
    let gameTimerId;
    let pipeGeneratorId;
    
    // Set initial bird position
    function resetBird() {
        birdPosition = sky.clientHeight / 2;
        birdVelocity = 0;
        updateBirdPosition();
    }

    // Update bird position based on velocity
    function updateBirdPosition() {
        bird.style.top = `${birdPosition}px`;
    }

    // Make the bird jump
    function jump() {
        if (isGameOver) return;
        
        if (!isGameStarted) {
            startGame();
            return;
        }
        
        birdVelocity = JUMP_FORCE;
    }

    // Start the game
    function startGame() {
        isGameStarted = true;
        isGameOver = false;
        score = 0;
        scoreDisplay.textContent = score;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        
        resetBird();
        clearPipes();
        
        // Start game loop
        gameTimerId = setInterval(gameLoop, 20);
        
        // Start generating pipes
        pipeGeneratorId = setInterval(generatePipe, PIPE_INTERVAL);
    }

    // Game over
    function endGame() {
        isGameOver = true;
        clearInterval(gameTimerId);
        clearInterval(pipeGeneratorId);
        finalScore.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    // Main game loop
    function gameLoop() {
        if (isGameOver) return;
        
        // Apply gravity to bird velocity
        birdVelocity += GRAVITY;
        birdPosition += birdVelocity;
        updateBirdPosition();
        
        // Check for collisions with ground and sky
        if (birdPosition <= 0 || birdPosition >= sky.clientHeight - bird.clientHeight) {
            endGame();
            return;
        }
        
        // Move pipes and check for collisions
        movePipes();
    }

    // Generate a new pipe
    function generatePipe() {
        if (isGameOver) return;
        
        const pipeHeight = Math.floor(Math.random() * (sky.clientHeight - GAP_SIZE - 100)) + 50;
        
        // Create top pipe
        const topPipe = document.createElement('div');
        topPipe.classList.add('pipe', 'pipe-top');
        topPipe.style.height = `${pipeHeight}px`;
        topPipe.style.left = `${gameContainer.clientWidth}px`;
        topPipe.passed = false;
        sky.appendChild(topPipe);
        
        // Create bottom pipe
        const bottomPipe = document.createElement('div');
        bottomPipe.classList.add('pipe', 'pipe-bottom');
        bottomPipe.style.height = `${sky.clientHeight - pipeHeight - GAP_SIZE}px`;
        bottomPipe.style.bottom = '0';
        bottomPipe.style.left = `${gameContainer.clientWidth}px`;
        sky.appendChild(bottomPipe);
        
        // Add pipes to the array
        pipes.push({
            top: topPipe,
            bottom: bottomPipe,
            passed: false
        });
    }

    // Move all pipes and check for collisions
    function movePipes() {
        pipes.forEach((pipe, index) => {
            // Move the pipe
            const currentPosition = parseInt(pipe.top.style.left);
            const newPosition = currentPosition - PIPE_SPEED;
            pipe.top.style.left = `${newPosition}px`;
            pipe.bottom.style.left = `${newPosition}px`;
            
            // Check if bird passed the pipe
            if (!pipe.passed && newPosition + pipe.top.clientWidth < bird.offsetLeft) {
                pipe.passed = true;
                score++;
                scoreDisplay.textContent = score;
            }
            
            // Check for collisions
            if (checkCollision(pipe)) {
                endGame();
                return;
            }
            
            // Remove pipes that are off-screen
            if (newPosition < -pipe.top.clientWidth) {
                sky.removeChild(pipe.top);
                sky.removeChild(pipe.bottom);
                pipes.splice(index, 1);
            }
        });
    }

    // Check for collision with a pipe
    function checkCollision(pipe) {
        const birdRect = bird.getBoundingClientRect();
        const topPipeRect = pipe.top.getBoundingClientRect();
        const bottomPipeRect = pipe.bottom.getBoundingClientRect();
        
        return (
            birdRect.right > topPipeRect.left &&
            birdRect.left < topPipeRect.right && (
                birdRect.top < topPipeRect.bottom ||
                birdRect.bottom > bottomPipeRect.top
            )
        );
    }

    // Clear all pipes from the game
    function clearPipes() {
        pipes.forEach(pipe => {
            sky.removeChild(pipe.top);
            sky.removeChild(pipe.bottom);
        });
        pipes = [];
    }
    
    // Event listeners
    document.addEventListener('click', jump);
    document.addEventListener('keydown', event => {
        if (event.code === 'Space') {
            jump();
        }
    });
    
    restartButton.addEventListener('click', startGame);
    
    // Initial setup
    resetBird();
});