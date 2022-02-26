//game info
const game = {
   //round settings
   round: {
      increase: 0,
      spawnRate: {initial: 2000, currently: 0},
      multiplier: 0.90,
      minimum: 150,
      counter: 1,
      interval: 5000,
      begin: function() {
         this.spawnRate.currently = this.spawnRate.initial;
         this.counter = 1;
         this.increase = setInterval(() => {
            if (this.spawnRate.currently >= this.minimum && (this.spawnRate.currently * this.multiplier) >= this.minimum) {
               this.spawnRate.currently *= this.multiplier;
               clearInterval(enemySpawnId);
               spawnEnemies();
               
               this.counter++;
               roundCount.innerHTML = this.counter;
            } else {
               roundCount.innerHTML = `${this.counter} (Max)`;
               clearInterval(this.increase);
            }
         }, this.interval); //new round every n milliseconds
     }
   },
   
   //projectile settings
   projectile: {
      //projectile color
      color: {
         lead: "white",
         follower: "white"
      },
      
      //projectile size
      radius: 6,
      
      //cooldown between fire
      cooldown: {wait: 150, enabled: false},
      
      //total projectiles spawned per click (~63 is a full circle)
      volley: 1,
      
      //time between spawing each extra projectile (in milliseconds)
      wait: 20,
      
      //maximum amount of Projectile groups allowed on screen
      max: 10
   },
   
   //game settings (see if more settings should be added for special needs people or just other general settings)
   settings: {
      trailing: true,
      particles: true
   }
};

//game customization
const toggle = {
   //player color
   player: {
      cycle: 0,
      preset: [["White","white"],["Blue","blue"],["Green","rgb(0, 255, 0)"],["Yellow","yellow"]]
   },
   
   //cannon color
   cannon: {
      cycle: 0,
      preset: [["Original","yellow","rgb(255, 0, 80)"],["Red/Blue","red","blue"],["Yellow/Purple","yellow","rgb(110, 0, 255)"]]
   },
   
   //projectile color
   projectile: {
      cycle: 0,
      preset: [["White","white","white"],["White/Red","white","red"],["Yellow/Purple","yellow","rgb(110, 0, 255)"]]
   },
   
   //hp amount
   hp: {
      cycle: 0,
      preset: [3,4,5,10,1]
   },
   
   //volley amount
   volley: {
      cycle: 0,
      preset: [1,3,6,9]
   },
   
   //round multiplier
   round: {
      cycle: 0,
      preset: [0.90,0.85,0.80,0.75]
   },
   
   //functions
   rotate: function(item) {
      if (item.cycle < (item.preset.length - 1)) {
         item.cycle++;
      } else {
         item.cycle = 0;
      }
   },
   getPreset: function(item,index = null) {
      if (index !== null) {
         return item.preset[item.cycle][index];
      } else {
         return item.preset[item.cycle];
      }
   }
};
