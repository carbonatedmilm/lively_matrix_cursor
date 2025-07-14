var root = {
  wavecolor: {  
    r: 125,
    g: 52,
    b: 253
  },
  rainbowSpeed: 0.5,
  rainbow: true,
  matrixspeed: 50
};

var c = document.getElementById("c");
var ctx = c.getContext("2d");

var hueFw = false;
var hue = -0.01;

// making the canvas full screen
c.height = window.innerHeight;
c.width = window.innerWidth;

// the characters
var konkani  = "゠アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレワヰヱヲンヺ・ーヽヿ0123456789"
// converting the string into an array of single characters
var characters = konkani.split("");
var font_size = 14;
var columns = Math.floor(c.width / font_size);    // number of columns for the rain

// an array of drops - one per column
var drops = [];
for (var x = 0; x < columns; x++)
    drops[x] = 1;

// Trail data structure
var trails = [];
var trailFadeSpeed = 0.2; // Faster than drops

// Mouse position and movement
var mouseMoving = false;
var lastMouseTime = Date.now();
var mouseX = 0, mouseY = 0;

// Listen for mouse movement
c.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseMoving = true;
    lastMouseTime = Date.now();

    // Snap mouse position to grid
    let gridX = Math.floor(mouseX / font_size) * font_size;
    let gridY = Math.floor(mouseY / font_size) * font_size;

    // Generate several trail points around the cursor (in grid)
    for (let i = 0; i < 8; i++) {
        let angle = (Math.PI * 2) * (i / 8);
        let radius = font_size * 2;
        // Snap trail point to grid
        let x = Math.floor((gridX + Math.cos(angle) * radius) / font_size) * font_size;
        let y = Math.floor((gridY + Math.sin(angle) * radius) / font_size) * font_size;
        let char = characters[Math.floor(Math.random() * characters.length)];
        trails.push({x, y, char, alpha: 1.0});
    }
});

function getMatrixColor() {
    if (root.rainbow) {
        hue += (hueFw) ? 0.01 : -0.01;
        var rr = Math.floor(127 * Math.sin(root.rainbowSpeed * hue + 0) + 128);
        var rg = Math.floor(127 * Math.sin(root.rainbowSpeed * hue + 2) + 128);
        var rb = Math.floor(127 * Math.sin(root.rainbowSpeed * hue + 4) + 128);
        return 'rgba(' + rr + ',' + rg + ',' + rb + ')';
    } else {
        return 'rgba(' + root.wavecolor.r + ',' + root.wavecolor.g + ',' + root.wavecolor.b + ')';
    }
}

function draw() {
    // translucent BG to show trail
    ctx.fillStyle = "rgba(0,0,0, 0.05)";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.font = font_size + "px arial";

    // looping over drops
    for (var i = 0; i < drops.length; i++)
    {
        // background color
        ctx.fillStyle = "rgba(10,10,10, 1)";
        ctx.fillRect(i * font_size, drops[i] * font_size, font_size, font_size);
        // a random character to print
        var text = characters[Math.floor(Math.random() * characters.length)];

        // Use the same color logic as the trail
        ctx.fillStyle = getMatrixColor();

        ctx.fillText(text, i * font_size, drops[i] * font_size);
        drops[i]++;
        if (drops[i] * font_size > c.height && Math.random() > 0.975)
            drops[i] = 0;
    }

    // Fade out trail faster
    for (let i = trails.length - 1; i >= 0; i--) {
        let t = trails[i];
        ctx.globalAlpha = t.alpha;
        ctx.font = font_size + "px arial";
        ctx.fillStyle = getMatrixColor();
        ctx.fillText(t.char, t.x, t.y);
        t.alpha -= trailFadeSpeed;
        if (t.alpha <= 0) {
            trails.splice(i, 1);
        }
    }
    ctx.globalAlpha = 1.0; // reset alpha

    // Remove trail points if mouse hasn't moved for 100ms
    if (Date.now() - lastMouseTime > 100) mouseMoving = false;
    if (!mouseMoving) trails = [];
}

setInterval(draw, root.matrixspeed);

function livelyPropertyListener(name, val)
{
  switch(name) {
    case "matrixColor":
      root.wavecolor =  hexToRgb(val);
      break;
    case "rainBow":
      root.rainbow = val;
      break;   
    case "rainbowSpeed":
      root.rainbowSpeed = val/100;
      break;     
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Make sure canvas resizes correctly on window resize
window.addEventListener('resize', function() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    columns = Math.floor(c.width / font_size);
    drops = [];
    for (var x = 0; x < columns; x++)
        drops[x] = 1;
});
