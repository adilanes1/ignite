document.addEventListener("DOMContentLoaded", () => {
  // ===== Wavy Text Breaker =====
const wavy = document.getElementById("breaker-wavy");

if (wavy) {
  const text = "⚡ SPORTS WEAR ⚡ IGNITE GEAR ⚡ PERFORMANCE ⚡ ENERGY ⚡ DRIVE ⚡"; 
  const letters = text.split("").map((ch, i) => `<span style="--i:${i}">${ch}</span>`).join("");
  
  // We duplicate the text so that as one scroll leaves, another comes in — infinite seamless loop
  const doubledText = letters + letters;

  wavy.innerHTML = `
    <section class="breaker breaker-wavy">
      <div class="wave-line">
        <p class="wave-text">${doubledText}</p>
      </div>
    </section>
  `;
}


 const ballBreaker = document.getElementById("breaker-balls");

if (ballBreaker) {
  
  const colors = ["#0d0d0dff", "#8d4909ff", "#e27614"];
  const ballCount = 20; 

  
  const balls = Array.from({ length: ballCount }, (_, i) => {
    const color = colors[i % colors.length];
    return `<span class="wave-ball" style="--i:${i}; background:${color}"></span>`;
  }).join("");

  
  const doubledBalls = balls + balls;

  ballBreaker.innerHTML = `
    <section class="breaker breaker-balls">
      <div class="ball-line">
        ${doubledBalls}
      </div>
    </section>
  `;
}


const orbitalBreaker = document.getElementById("breaker-orbital");

if (orbitalBreaker) {
  const ringCount = 20;
  const colors = ["#0d0d0dff", "#8d4909ff", "#e27614"];

  const rings = Array.from({ length: ringCount }, (_, i) => {
    const delay = (i * 0.5).toFixed(2);
    const size = 40 + Math.random() * 60;
    const color = colors[i % colors.length];
    const opacity = 0.6 + Math.random() * 0.4;
    return `
      <div 
        class="orbital-ring" 
        style="--i:${i}; 
               --size:${size}px; 
               --color:${color};
               --delay:${delay}s;
               --opacity:${opacity};">
      </div>`;
  }).join("");

  orbitalBreaker.innerHTML = `
    <section class="breaker breaker-orbital">
      <div class="orbital-track">
        ${rings}
      </div>
    </section>
  `;
}

});
