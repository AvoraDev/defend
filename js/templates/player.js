class Player {
   //creates player with the following objects
   constructor(x, y, radius, color, info) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      
      //gameplay information
      this.info = {
         hp: {total: info.hp.total, currently: info.hp.currently},
         wait: info.wait,
         projectileRadius: info.projectileRadius,
         projectileColor: {lead: info.projectileColor.lead, follower: info.projectileColor.follower},
         volley: info.volley,
         max: info.max,
         cooldown: {wait: info.cooldown.wait, enabled: info.cooldown.enabled}
      };
   }
   
   //draws, or spawns, the player
   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
   }
}