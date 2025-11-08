
function waitForFirebase() {
  return new Promise((resolve) => {
    const check = () => {
      if (
        window.auth &&
        typeof window.createUserWithEmailAndPassword === "function" &&
        typeof window.signInWithEmailAndPassword === "function" &&
        typeof window.sendPasswordResetEmail === "function" &&
        typeof window.onAuthStateChanged === "function" &&
        typeof window.signOut === "function"
      ) {
        resolve({
          auth: window.auth,
          createUserWithEmailAndPassword: window.createUserWithEmailAndPassword,
          signInWithEmailAndPassword: window.signInWithEmailAndPassword,
          sendPasswordResetEmail: window.sendPasswordResetEmail,
          onAuthStateChanged: window.onAuthStateChanged,
          signOut: window.signOut,
        });
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export function initAuth() {

  const loginBtn = document.querySelector(".login-btn");
  const modal = document.getElementById("auth-modal");
  const closeModal = document.getElementById("close-modal");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const forgotForm = document.getElementById("forgot-form");

  if (!loginBtn || !modal) {
    console.warn("Auth modal or login button not found yet.");
    return;
  }


  loginBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
    forgotForm.classList.remove("active");
  });

  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document.getElementById("show-register").addEventListener("click", () => {
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
  });

  document.getElementById("show-login").addEventListener("click", () => {
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
  });

  document.getElementById("show-forgot").addEventListener("click", () => {
    loginForm.classList.remove("active");
    forgotForm.classList.add("active");
  });

  document.getElementById("back-to-login").addEventListener("click", () => {
    forgotForm.classList.remove("active");
    loginForm.classList.add("active");
  });



  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value.trim();

    try {
      const {
        auth,
        signInWithEmailAndPassword,
      } = await waitForFirebase();

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert(`Welcome back, ${userCredential.user.email}!`);
      modal.style.display = "none";
      updateLoginState(userCredential.user);
    } catch (error) {
      alert("Login failed: " + (error?.message || error));
    }
  });

  // Register
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registerForm.querySelector('input[type="text"]').value.trim();
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const password = registerForm.querySelector('input[type="password"]').value.trim();

    console.log(" Register form submitted:", { name, email, password });

    try {
      const {
        auth,
        createUserWithEmailAndPassword,
      } = await waitForFirebase();

      console.log(" Firebase ready:", typeof createUserWithEmailAndPassword, auth);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      console.log(" Registration success:", userCredential);
      alert(`Account created for ${userCredential.user.email}!`);
      modal.style.display = "none";
      updateLoginState(userCredential.user);
    } catch (error) {
      console.error(" Registration error:", error);
      alert("Registration failed: " + (error?.message || error));
    }
  });


  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = forgotForm.querySelector('input[type="email"]').value.trim();

    try {
      const { auth, sendPasswordResetEmail } = await waitForFirebase();
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
      forgotForm.classList.remove("active");
      loginForm.classList.add("active");
    } catch (error) {
      alert("Failed to send reset link: " + (error?.message || error));
    }
  });

  waitForFirebase().then(({ auth, onAuthStateChanged }) => {
    onAuthStateChanged(auth, (user) => {
      updateLoginState(user);
    });
  }).catch((err) => {
    console.warn("Failed to attach auth state listener:", err);
  });

 
  function updateLoginState(user) {
    const loginBtn = document.querySelector(".login-btn");
    if (!loginBtn) return;
    if (user) {
      loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.email.split("@")[0]}`;
      loginBtn.onclick = async () => {
       
        const { auth, signOut } = await waitForFirebase();
        if (confirm("Logout?")) {
          await signOut(auth);
          alert("Logged out!");
          location.reload();
        }
      };
    } else {
      loginBtn.innerHTML = `<i class="fas fa-user"></i> Login`;
      loginBtn.onclick = () => {
        modal.style.display = "flex";
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
        forgotForm.classList.remove("active");
      };
    }
  }
}

window.initAuth = initAuth;
