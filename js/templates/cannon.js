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
