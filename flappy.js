window.addEventListener('load', function() {
    const resources = [
        'assets/flappy_bird.gif',
        'assets/flappy_bird_backdrop.png',
    ];
    
    let loadedResources = 0;
    const minLoadingTime = 700;
    const startTime = Date.now();

    function updatePreloader() {
        loadedResources++;
        let progress = Math.floor((loadedResources / resources.length) * 100);
        document.getElementById('progress-bar').style.width = progress + '%';
        document.getElementById('progress-text').innerText = progress + '%';
        
        if (loadedResources === resources.length) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = minLoadingTime - elapsedTime;

            if (remainingTime > 0) {
                setTimeout(hidePreloader, remainingTime);
            } else {
                hidePreloader();
            }
        }
    }

    function hidePreloader() {
        document.getElementById('preloader').style.display = 'none';
        showMainMenu();
    }

    resources.forEach(resource => {
        let img = new Image();
        img.src = resource;
        img.onload = updatePreloader;
    });

    document.addEventListener("DOMContentLoaded", function() {
        updatePreloader();
    });
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let birdImage = new Image();
birdImage.src = 'assets/flappy_bird.gif';
let backgroundImage = new Image();
backgroundImage.src = 'assets/flappy_bird_backdrop.png';
let bird = { x: 100, y: 150, width: 68, height: 48, gravity: 0.3, lift: -4, velocity: 0 };
let pipes = [];
let score = 0;
let gameInterval;
let difficultySettings;
let countdown = 3;
let currentDifficulty;

let highestScores = {
    easy: localStorage.getItem('easyScore') || 0,
    hard: localStorage.getItem('hardScore') || 0,
    advanced: localStorage.getItem('advancedScore') || 0
};

currentDifficulty = localStorage.getItem('currentDifficulty') || 'easy';

document.addEventListener("DOMContentLoaded", function() {
    showMainMenu();
    updateSelectedDifficulty(currentDifficulty);
});

function startplay() {
    hideAll();
    canvas.style.display = 'block';
    startGame(currentDifficulty);
}

function showHighestScores() {
    hideAll();
    document.getElementById('highestScoresOverlay').style.display = 'flex';
    document.getElementById('easyScore').innerText = highestScores.easy;
    document.getElementById('hardScore').innerText = highestScores.hard;
    document.getElementById('advancedScore').innerText = highestScores.advanced;
}

function showDifficultyScreen() {
    hideAll();
    document.getElementById('difficultyScreen').style.display = 'flex';
}

function showAbout() {
    hideAll();
    document.getElementById('about').style.display = 'flex';
}

function showReset() {
    hideAll();
    document.getElementById('reset').style.display = 'flex';
}

function closeOverlay() {
    hideAll();
    document.getElementById('Mainmenu').style.display = 'flex';
}

function startGame(difficulty) {
    hideAll();
    canvas.style.display = 'block';
    currentDifficulty = difficulty;
    updateSelectedDifficulty(difficulty);

    switch(difficulty) {
        case 'easy':
            difficultySettings = { gap: 240, speed: 2 };
            break;
        case 'hard':
            difficultySettings = { gap: 195, speed: 3 };
            break;
        case 'advanced':
            difficultySettings = { gap: 130, speed: 4 };
            break;
    }

    pipes = [];
    score = 0;
    bird.y = 150;
    bird.velocity = 0;
    countdown = 3;

    drawStaticGame();

    let countdownInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawStaticGame();
        ctx.font = '72px "Press Start 2P"';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
        ctx.textAlign = 'center';
        if (countdown > 0) {
            ctx.strokeText(countdown, canvas.width / 2, canvas.height / 2);
            ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
        } else {
            ctx.strokeText('Go!', canvas.width / 2, canvas.height / 2);
            ctx.fillText('Go!', canvas.width / 2, canvas.height / 2);
        }
        countdown--;

        if (countdown < -1) {
            clearInterval(countdownInterval);
            gameInterval = setInterval(gameLoop, 1000 / 60);
            document.addEventListener('keydown', controlBird);
            canvas.addEventListener('click', controlBird);
        }
    }, 1000);
}

function controlBird(event) {
    if ((event.type === 'keydown' && event.code === 'Space') || event.type === 'click') {
        bird.velocity = bird.lift;
    }
}

function gameLoop() {
    updateBird();
    updatePipes();
    checkCollisions();
    drawGame();
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
}

function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        let pipeY = Math.floor(Math.random() * (canvas.height - difficultySettings.gap));
        pipes.push({ x: canvas.width, y: pipeY, width: 50, gap: difficultySettings.gap });
    }

    pipes.forEach(pipe => {
        pipe.x -= difficultySettings.speed;
    });

    if (pipes[0].x + pipes[0].width < 0) {
        pipes.shift();
        score++;
    }
}

function checkCollisions() {
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }

    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipe.gap)) {
            endGame();
        }
    });
}

function endGame() {
    clearInterval(gameInterval);
    document.removeEventListener('keydown', controlBird);
    canvas.removeEventListener('click', controlBird);

    if (score > highestScores[currentDifficulty]) {
        highestScores[currentDifficulty] = score;
        localStorage.setItem(currentDifficulty + 'Score', score);
    }

    document.getElementById('finalScore').innerText = 'Score: ' + score + '\n\nHighest Score: ' + highestScores[currentDifficulty];
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function restartGame() {
    startGame(currentDifficulty);
}

function showMainMenu() {
    hideAll();
    document.getElementById('Mainmenu').style.display = 'flex';
}

function confirmResetBtn() {
    localStorage.clear();
    highestScores = { easy: 0, hard: 0, advanced: 0 };
    closeOverlay();
}

function hideAll() {
    document.getElementById('Mainmenu').style.display = 'none';
    document.getElementById('highestScoresOverlay').style.display = 'none';
    document.getElementById('difficultyScreen').style.display = 'none';
    document.getElementById('about').style.display = 'none';
    document.getElementById('reset').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    canvas.style.display = 'none';
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.save();
    
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    if (bird.velocity >= 0) {
        ctx.rotate(Math.min(bird.velocity * 0.05, 0.5));
    } else {
        ctx.rotate(Math.max(bird.velocity * 0.05, -0.5));
    }
    
    ctx.drawImage(birdImage, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();
    
    pipes.forEach(pipe => {
        let gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        gradient.addColorStop(0, 'darkgreen');
        gradient.addColorStop(1, 'lightgreen');
        ctx.fillStyle = gradient;
        
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
        ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width, canvas.height - (pipe.y + pipe.gap));
    });
    
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 60, 50);
}

window.addEventListener('keydown', function(e) {
    if(e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

function drawStaticGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

function updateSelectedDifficulty(difficulty) {
    const selectedDifficultySpan = document.getElementById('selectedDifficulty');
    selectedDifficultySpan.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    localStorage.setItem('currentDifficulty', difficulty);
}
