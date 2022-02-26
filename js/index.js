//ideas
//hold to fire
//change speed based on size; the smaller, the faster
//upgrades
   //minions
//cooldown abilities
   //circle shot
//store for upgrades and powerups between rounds
//powerups
   //machine gun
   //projectiles hit multiple times (no collision)
   //bombs/missles
//for testing
switch(window.location.protocol) {
   case 'file:':
     document.title = "Defend! (LOCAL)";
     break;
   default: 
     console.log("not a local file");
}

//------------------------------------------------------------------
//HTML & AUDIO ELEMENTS
//------------------------------------------------------------------
//canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//main menu
const mainMenu = document.querySelector("#mainMenu");
const howToMenu = document.querySelector("#howToMenu");
const scoreMenu = document.querySelector("#scoreMenu");
const customizeMenu = document.querySelector("#customizeMenu");
const feedbackMenu = document.querySelector("#feedbackMenu");
const settingsMenu = document.querySelector("#settingsMenu");
const creditsMenu = document.querySelector("#creditsMenu");
howToMenu.style.display = "none";
scoreMenu.style.display = "none";
customizeMenu.style.display = "none";
feedbackMenu.style.display = "none";
settingsMenu.style.display = "none";
creditsMenu.style.display = "none";

//pause menu
const pauseMenu = document.querySelector("#pauseMenu");
pauseMenu.style.display = "none";

//restart menu
const restartMenu = document.querySelector("#restartMenu");
const scoreCountFinal = document.querySelector("#scoreCountFinal");
const roundCountFinal = document.querySelector("#roundCountFinal");

//gui
const scoreCount = document.querySelector("#scoreCount");
const bulletCount = document.querySelector("#bulletCount");
const roundCount = document.querySelector("#roundCount");
const hpCount = document.querySelector("#hpCount");
const gui = document.querySelector("#gui");
gui.style.display = "none";

//debug menu (left alt)
const debugMenu = document.querySelector("#debugMenu");
const projectileArr = document.querySelector("#projectileArr");
const enemyArr = document.querySelector("#enemyArr");
const roundInfo = document.querySelector("#roundInfo");
const playerInfo = document.querySelector("#playerInfo");
const cannonObj = document.querySelector("#cannon");
debugMenu.style.display = "none";

//audio
let select = new Howl({src: ["./audio/select.mp3"]});
let shoot = new Howl({src: ["./audio/shoot.mp3"]});
let hit = new Howl({src: ["./audio/hit.mp3"]});

//------------------------------------------------------------------
//CLASSES
//------------------------------------------------------------------
class Player {
   //creates player with the following objects
   constructor(x, y, radius, color, hp) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = {
         original: color.original,
         currently: color.currently
      };
      
      //gameplay information
      this.hp = {
         total: hp.total,
         currently: hp.currently
      };
   }
   
   //draws, or spawns, the player
   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color.currently;
      ctx.fill();
   }
}

class Cannon {
   //creates cannon with the following objects
   constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = {original: color.original, onFire: color.onFire, currently: color.currently};
      this.velocity = velocity;
   }
   
   //spawns cannon
   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color.currently;
      ctx.fill();
   }
   
   //updates location of cannnon
   update() {
      this.draw();
      this.x = (canvas.width / 2) + (this.velocity.x * 40);
      this.y = (canvas.height / 2) + (this.velocity.y * 40);
   }
   
   move() {
      const angle = Math.atan2(
         event.clientY - (canvas.height / 2),
         event.clientX - (canvas.width / 2)
      );
      
      const velocity = {
         x: Math.cos(angle),
         y: Math.sin(angle)
      };
      
      this.velocity = velocity;
      this.update();
   }
}

class Projectile {
   //creates projectile with the following objects
   constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
   }
   
   //spawns projectile
   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
   }
   
   //updates location of projectile
   update() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
   }
}

class Enemy {
   //creates enemy with the following objects
   constructor(enemyIndex, x, y, radius, color, velocity) {
      this.enemyIndex = enemyIndex;
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
   }
   
   //spawns enemy
   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
   }
   
   //updates location of enemy
   update() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
   }
}

//the closer to 0, the slower the speed
const friction = 0.98;
class Particle {
   //creates particle with the following objects
   constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
      this.alpha = 1;
   }
   
   //spawns particle
   draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2,false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
   }
   
   //updates location and opacity of particle
   update() {
      this.draw();
      this.velocity.x *= friction;
      this.velocity.y *= friction;
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
      this.alpha -= 0.01;
   }
}

//------------------------------------------------------------------
//GAME CODE
//------------------------------------------------------------------
//item arrays
let projectiles = [];
let enemies = [];
let particles = [];

//gameplay loop?
let animateId;
let score = 0;
function animate() {
   //makes a loop 
   animateId = requestAnimationFrame(animate);
   
   //clears canvas every frame in order to redraw everything
   ctx.fillStyle = game.settings.trailing ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 1)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   
   //redraw cannon and player
   cannon.draw();
   player.draw();
   
   //update bulletCount
   bulletCount.innerHTML = `${Math.floor((game.projectile.max - (projectiles.length / game.projectile.volley))).toFixed()}/${(game.projectile.max).toFixed()}`;
   if (game.projectile.max - (projectiles.length / game.projectile.volley) <= 1) {
      bulletCount.style.color = "red";
   } else {
      bulletCount.style.color = "white";
   }
   
   //spawns/despawns particles when enemy is hit
   particles.forEach((particle,index) => {
      if (particle.alpha <= 0) {
         particles.splice(index, 1);
      } else {
         particle.update();
      }
   });
   
   //spawns/despawns projectiles
   projectiles.forEach((projectile, index) => {
      //despawns projectiles when offscreen
      if (
         (projectile.x + projectile.radius) + 20 < 0 || 
         (projectile.x - projectile.radius) - 20 > canvas.width ||
         (projectile.y + projectile.radius) + 20 < 0 ||
         (projectile.y - projectile.radius) - 20 > canvas.height) {
         projectiles.splice(index, 1);
      } else {
        projectile.update();
      }
   });
   
   //bunch of stuff
   enemies.forEach((enemy, index) => {
      //update enemy location
      enemy.update();
      
      //finds distance between player and enemy
      let dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      
      //enemy/player collision detection and game over
      if ((dist - enemy.radius) - player.radius < 1) {
         //play sound
         hit.play();

         player.hp.currently--;
         hpCount.innerHTML = `${player.hp.currently}/${player.hp.total}`;
         
         if (player.hp.currently < 1) {
            gameOver();
         } else {
            enemies.splice(index, 1);
            
            //damage instance
            player.color.currently = "red";
            hpCount.style.color = "red";
            setTimeout(() => {
               gsap.to(player.color, {
                  currently: player.color.original
               });
               if (player.hp.currently !== 1) {
                  gsap.to(hpCount, {
                     color: "white"
                  });
               }
            }, 100);
         }
      }
      
      //enemy/projectile collision detection and more
      projectiles.forEach((projectile, projectileIndex) => {
         //finds distance between projectile and enemy
         let dist2 = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
         
         if (dist2 - enemy.radius - projectile.radius < 1) {
            //play sound
            hit.play();
            
            //spawns particles when enemy is hit
            if (game.settings.particles) {
               for (let i = 0; i < enemy.radius * 1.5; i++) {
                  particles.push(
                     new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,
                        {
                           x:(Math.random() - 0.5) * (Math.random() * 8),
                           y:(Math.random() - 0.5) * (Math.random() * 8)
                        }
                     )
                  );
               }
            }
            
            //shrinks/despawns enemy when hit and gives points
            if (enemy.radius - 10 > 5) {
               //add 100 points when hit isn't fatal
               score += 100;
               scoreCount.innerHTML = score.toLocaleString();
               
               //transition to smaller size when hit
               gsap.to(enemy, {
                  radius: enemy.radius - 10
               });
               
               projectiles.splice(projectileIndex, 1);
            } else {
               //adds 250 points when hit is fatal
               score += 250;
               scoreCount.innerHTML = score.toLocaleString();
               
               setTimeout (() => {
                  enemies.splice(index, 1);
                  projectiles.splice(projectileIndex, 1);
               }, 0);
            }
         }
      });
   });
   
   //debug menu
   projectileArr.innerHTML = `projectiles: <br>
      [${projectiles.length}]: ${(projectiles.length / game.projectile.volley).toFixed(2)} volley(s) <br>`;
   enemyArr.innerHTML = `enemies: <br>
      [${enemies.length}]: enabled: ${enemySpawnId !== undefined} (toggle with left ctrl) <br>`;
   roundInfo.innerHTML = `round: <br>
      [counter: ${game.round.counter}] <br>
      [increase: ${game.round.increase}] <br>
      [multiplier: ${game.round.multiplier}] <br>
      [minimum: ${game.round.minimum}] <br>
      [spawnRate: {inital: ${game.round.spawnRate.initial}, currently: ${game.round.spawnRate.currently}}] <br>`;
   playerInfo.innerHTML = `player: <br>
      [color: {original: ${player.color.original}, currently: ${player.color.currently}}] <br>
      [hp: {total: ${player.hp.total}, currently: ${player.hp.currently}}] <br>
      [wait: ${game.projectile.wait}] <br>
      [projectileRadius: ${game.projectile.radius}] <br>
      [projectileColor: {lead: ${game.projectile.color.lead}, follower: ${game.projectile.color.follower}}] <br>
      [volley: ${game.projectile.volley}] <br>
      [max: ${game.projectile.max}] <br>
      [cooldown: {wait: ${game.projectile.cooldown.wait}, enabled: ${game.projectile.cooldown.enabled}}] <br>`;
   cannonObj.innerHTML = `cannon: <br>
      [radius: ${cannon.radius}] <br>
      [color: {original: ${cannon.color.original}, onFire: ${cannon.color.onFire}, currently: ${cannon.color.currently}}] <br>
      [x: ${cannon.x}] <br>
      [y: ${cannon.y}] <br>`;
}

let enemySpawnId;
function spawnEnemies() {
   enemySpawnId = setInterval(() => {
      const radius = Math.random() * (30 - 8) + 8;
      const color = `hsl(${Math.random() * 360},100%,50%)`;
      let x;
      let y;
      
      //makes enemies spawn at the edge of the canvas
      if (Math.random() < 0.5) {
         x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
         y = Math.random() * canvas.height;
      } else {
         x = Math.random() * canvas.width;
         y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
      }
      
      //trigonometry magic
      //make the enemies go to the center
      const angle = Math.atan2(
         (canvas.height / 2) - y,
         (canvas.width / 2) - x
      );
      
      //enemy speed
      const velocity = {
         x: Math.cos(angle) * 2,
         y: Math.sin(angle) * 2
      };
      
      //add enemy to array
      enemies.push(new Enemy(undefined, x, y, radius, color, velocity)); //undefined is enemyIndex
   }, game.round.spawnRate.currently); //enemy spawnrate
}

//initialization function
function init() {
   //play sound
   select.play();
   
   //sets colors for player and cannon
   player.color.currently = player.color.original;
   cannon.color.currently = cannon.color.original;
   
   //clears screen
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   
   //hides main, pause, and restart menu
   mainMenu.style.display = "none";
   pauseMenu.style.display = "none";
   restartMenu.style.display = "none";
   
   //clears all object arrays
   projectiles = [];
   enemies = [];
   particles = [];
   
   //resets score
   score = 0;
   scoreCount.innerHTML = score;
   
   //resets round
   roundCount.innerHTML = 1;
   
   //resets hp
   player.hp.currently = player.hp.total;
   hpCount.innerHTML = `${player.hp.currently}/${player.hp.total}`;
   hpCount.style.color = "white";
   
   //unhides gui
   gui.style.display = "flex";
   
   //starts game
   setTimeout(() => {
      animate();
      game.round.begin();
      spawnEnemies();
   }, 0);
}

function gameOver() {
   //end game
   cancelAnimationFrame(animateId);
   clearInterval(enemySpawnId);
   clearInterval(game.round.increase);
   
   //hides gui, unhides start menu and updates score
   gui.style.display = "none";
   restartMenu.style.display = "flex";
   scoreCountFinal.innerHTML = score.toLocaleString();
   roundCountFinal.innerHTML = game.round.counter;
   
   //store score
   localStorage.getItem("score") ? localStorage.setItem("score", localStorage.getItem("score") + " " + score) : localStorage.setItem("score", score);
}

function pause(quit = undefined) {
   //play sound
   select.play();
   
   if (quit !== undefined) { //prevents player from getting a new score if they quit
      pauseMenu.style.display = "none";
      mainMenu.style.display = "flex";
      cancelAnimationFrame(animateId);
      clearInterval(game.round.increase);
      clearInterval(enemySpawnId);
      score = 0;
   } else if (pauseMenu.style.display === "none") {
      gui.style.display = "none";
      pauseMenu.style.display = "flex";
      cancelAnimationFrame(animateId);
      clearInterval(game.round.increase);
      clearInterval(enemySpawnId);
   } else {
      gui.style.display = "flex";
      pauseMenu.style.display = "none";
      setTimeout(() => {
         animate();
         game.round.begin();
         spawnEnemies();
      }, 0);
   }
}

//------------------------------------------------------------------
//PLAYER, CANNON, & PROJECTILES
//------------------------------------------------------------------
//spawn player
const x = canvas.width / 2;
const y = canvas.height / 2;
const player = new Player(x, y, 20, {
   //make sure that both color.original and color.currently are the same
   original: "white",
   currently: "white"
}, {
   total: 3,
   currently: 0
});

//spawns cannon
const cannon = new Cannon(x, y, 10, {
   //make sure that both color.original and color.currently are the same
   original: "yellow",
   onFire: "rgb(255, 0, 80)",
   currently: "yellow"
}, {});

//cannon movement
document.addEventListener("mousemove", () => {if (restartMenu.style.display === "none") {cannon.move()}});

//shoot projectiles on click
canvas.addEventListener("click", (event) => {
   //spawn projectiles
   //only spawns in projectiles if the max amount of projectiles allowed hasn't been reached
   if (projectiles.length / game.projectile.volley <= game.projectile.max - 1 && game.projectile.cooldown.enabled === false) {
      //play sound
      shoot.play();
      
      //change cannon color
      cannon.color.currently = cannon.color.onFire;
      
      //trigonometry magic
      const angle = Math.atan2(
         event.clientY - (canvas.height / 2),
         event.clientX - (canvas.width / 2)
      );
      
      //projectile speed
      const velocity = {
         x: Math.cos(angle) * 6,
         y: Math.sin(angle) * 6
      };
      
      projectiles.push(
         new Projectile (
            cannon.x,
            cannon.y,
            game.projectile.radius,
            game.projectile.color.lead,
            velocity
         )
      );
      
      //multishot
      let flipflop = true; 
      if (game.projectile.volley > 1) {
         //projectile pseudoloop
         const projI = {
            loop: 0,
            i: 0,
         };
         
         projI.loop = setInterval(() => {
            //flipflop?
            if (flipflop) {//try using projI.i instead
               angle2 = angle + (0.05 * ((projI.i + 2)));
            } else {
               angle2 = angle + (0.05 * (-(projI.i + 1)));
            }
            
            //projectile speed
            const velocity2 = {
               x: Math.cos(angle2) * 6,
               y: Math.sin(angle2) * 6
            };
            
            //spawn multishots
            setTimeout(() => {
               projectiles.push(
                  new Projectile (
                     cannon.x,
                     cannon.y,
                     game.projectile.radius,
                     game.projectile.color.follower,
                     velocity2
                  )
               );
            });
            
            //flip flipflop
            flipflop = !flipflop;
            
            projI.i++;
            if (projI.i >= game.projectile.volley - 1) {
               clearInterval(projI.loop);
            }
         }, game.projectile.wait);
      }
      
      //enable/disable cooldown
      game.projectile.cooldown.enabled = true;
      setTimeout(() => {
         game.projectile.cooldown.enabled = false;
         cannon.color.currently  = cannon.color.original;
         //gsap.to(cannon, { //try to find out how to make this slower
         //   color: "yellow"
         //});
      }, game.projectile.cooldown.wait);
   }
});

//------------------------------------------------------------------
//MISC FUNCTIONS & EVENT LISTENERS
//------------------------------------------------------------------
//log scores
function scoreLog() {
   let arr = localStorage.getItem("score").split(" ");
   arr.sort(function(a, b){return b - a});
   
   for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(arr[i]);
      
      if (i === 0)  {
         arr[i] = `<span style="color: red">1: ${arr[i].toLocaleString()}</span>`
      } else {
         arr[i] = `${i + 1}: ${arr[i]}`;
      }
   }
   
   document.getElementById("scoreLog").innerHTML = arr.join("<br>");
}

//toggle menu
function menuToggle(id) {
   //play sound
   select.play();
   
   let temp = document.querySelector(`#${id}`);
   if (temp.style.display === "none") {
      temp.style.display = "flex";
   } else {
      temp.style.display = "none";
   }
}

//settings toggle and game customization
function settingsToggle(id) {
   //play sound
   select.play();
   
   let temp = document.querySelector(`#${id}`);
   switch (id) {
      //settings
      case 'trailingSetting':
         game.settings.trailing = !game.settings.trailing;
         
         if (game.settings.trailing) {temp.innerHTML = "On";}
            else {temp.innerHTML = "Off";}
         break;
         
      case 'particlesSetting':
         game.settings.particles = !game.settings.particles;
         
         if (game.settings.particles) {temp.innerHTML = "On";}
            else {temp.innerHTML = "Off";}
         break;
      
      //game customization
      case 'playerColorCustomize':
         toggle.rotate(toggle.player);
         
         temp.innerHTML = toggle.getPreset(toggle.player,0);
         player.color.original = toggle.getPreset(toggle.player,1);
         break;
      
      case 'cannonColorCustomize':
         toggle.rotate(toggle.cannon);
      
         temp.innerHTML = toggle.getPreset(toggle.cannon,0);
         cannon.color.original = toggle.getPreset(toggle.cannon,1);
         cannon.color.onFire = toggle.getPreset(toggle.cannon,2);
         break;
         
      case 'projectileColorCustomize':
         toggle.rotate(toggle.projectile);
      
         temp.innerHTML = toggle.getPreset(toggle.projectile,0);
         game.projectile.color.lead = toggle.getPreset(toggle.projectile,1);
         game.projectile.color.follower = toggle.getPreset(toggle.projectile,2);
         break;
         
      case 'hpCustomize':
         toggle.rotate(toggle.hp);
      
         temp.innerHTML = toggle.getPreset(toggle.hp);
         player.hp.total = toggle.getPreset(toggle.hp);
         break;
         
      case 'volleyCustomize':
         toggle.rotate(toggle.volley)
      
         temp.innerHTML = toggle.getPreset(toggle.volley);
         game.projectile.volley = toggle.getPreset(toggle.volley);
         break;
         
      case 'roundCustomize':
         toggle.rotate(toggle.round)
      
         temp.innerHTML = toggle.getPreset(toggle.round);
         game.round.multiplier = toggle.getPreset(toggle.round);
         break;
   }
}

//key shortcuts
addEventListener("keydown", (event) => {
   switch (event.code) {
      case 'Enter':
         if (mainMenu.style.display === "flex" || restartMenu.style.display === "flex") {
            init();
         } else if (pauseMenu.style.display === "flex") {
            pause();
         }
         break;
         
      case 'KeyP':
         if (mainMenu.style.display === "none" && restartMenu.style.display === "none") {
            pause();
         }
         break;
         
      case 'Escape':
         if (pauseMenu.style.display === "flex") {
            pause("quit");
         } else if (restartMenu.style.display === "flex") {
            mainMenu.style.display = "flex";
         }
         break;
         
      //debugging
      case 'AltRight':
         if (debugMenu.style.display === "none") {
            debugMenu.style.display = "flex";
         } else {
            debugMenu.style.display = "none";
         }
         break;
         
      case 'ControlRight':
         if (enemySpawnId) {
            clearInterval(game.round.increase);
            clearInterval(enemySpawnId);
            enemySpawnId = undefined;
         } else {
            game.round.begin();
            spawnEnemies();
         }
         break;
   }
});

//resize on change
addEventListener("resize", () => {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
   
   const x = canvas.width / 2;
   const y = canvas.height / 2;
   player.x = x;
   player.y = y;
});

//splash screen
const splashScreen = document.querySelector("#splashScreen");
setTimeout(() => {
   splashScreen.style.display = "none";
   cancelAnimationFrame(animateId);
   clearInterval(enemySpawnId);
   clearInterval(game.round.increase);
}, 250);
