document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;

  if (name && email && subject && message) {
    alert(` Thank you, ${name}! Your message has been sent successfully.`);
    e.target.reset();
  } else {
    alert(" Please fill out all fields before sending.");
  }
});
