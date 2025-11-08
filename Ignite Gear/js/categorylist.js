document.addEventListener("DOMContentLoaded", () => {
  const categories = [
    { name: "Sportswear", img: "assets/images/soccer-shoes.png" },
    { name: "Footwear", img: "assets/images/runingshoes.jpg" },
    { name: "Accessories", img: "assets/images/gym-gloves.jpg" },
    { name: "Training", img: "assets/images/cricket-ball.jpeg" },
    { name: "Casual", img: "assets/images/sports-cap.jpeg" }
  ];

  const totalBricks = 36;
  const wall = document.getElementById("brick-wall");
  const imgDisplay = document.getElementById("category-image");

  const categoryPositions = new Set();
  while (categoryPositions.size < categories.length) {
    categoryPositions.add(Math.floor(Math.random() * totalBricks));
  }

  for (let i = 0; i < totalBricks; i++) {
    const brick = document.createElement("div");
    brick.classList.add("brick");

    if (categoryPositions.has(i)) {
      const category = categories[categoryPositions.size - [...categoryPositions].indexOf(i) - 1];
      brick.textContent = category.name;
      brick.dataset.img = category.img;

      brick.addEventListener("mouseenter", () => {
        imgDisplay.style.opacity = 0;
        setTimeout(() => {
          imgDisplay.src = category.img;
          imgDisplay.style.opacity = 1;
        }, 200);
      });

      brick.addEventListener("click", () => {
        localStorage.setItem("selectedCategory", category.name);
        window.location.href = "shop/shop.html";
      });
    }

    wall.appendChild(brick);
  }
});
