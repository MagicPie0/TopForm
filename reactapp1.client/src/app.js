export function modesFunction(isDarkMode, setIsDarkMode) {
    // Az állapot megváltoztatása
    setIsDarkMode(!isDarkMode);
}

export const languageSetFunction = (currentLanguage, setLanguage) => {
    setLanguage(currentLanguage === "EN" ? "HU" : "EN");
};


//Animáció
/*export function initializeCanvasDots(isDarkMode) {
    const maxx = window.innerWidth;
    const maxy = window.innerHeight;
    const halfx = maxx / 2;
    const halfy = maxy / 2;

    // Canvas létrehozása
    const canvas = document.createElement("canvas");
    canvas.width = maxx;
    canvas.height = maxy;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "-1";
    document.body.appendChild(canvas);

    const context = canvas.getContext("2d");
    const dotCount = 200;

    // Dot objektum osztálya
    class Dot {
        constructor() {
            this.rad_x = Math.random() * halfx;
            this.rad_y = Math.random() * halfy;
            this.alpha = Math.random() * 360;
            this.speed = (Math.random() < 0.5 ? 1 : -1) * 0.1;
            this.size = Math.random() * 5 + 1;
            this.color = Math.random() * 255;
        }

        draw() {
            const dx = halfx + this.rad_x * Math.cos((this.alpha * Math.PI) / 180);
            const dy = halfy + this.rad_y * Math.sin((this.alpha * Math.PI) / 180);
            context.fillStyle = `rgb(${this.color},${this.color},${this.color})`;
            context.fillRect(dx, dy, this.size, this.size);
        }

        move() {
            this.alpha += this.speed;
            this.color = Math.max(0, Math.min(255, this.color + (Math.random() < 0.5 ? 1 : -1)));
        }
    }

    // Dots inicializáció
    const dots = Array.from({ length: dotCount }, () => new Dot());

    // Renderelési ciklus
    function render() {
        context.fillStyle = isDarkMode ? "#000000" : "#ffffff";
        context.fillRect(0, 0, maxx, maxy);
        dots.forEach((dot) => {
            dot.move();
            dot.draw();
        });
        requestAnimationFrame(render);
    }

    // Canvas tisztítás és eltávolítás
    function cleanup() {
        cancelAnimationFrame(render);
        document.body.removeChild(canvas);
    }

    render();

    // A cleanup függvényt visszaadjuk, hogy szükség esetén meg lehessen hívni.
    return cleanup;
}*/

// Login function
/*export async function handleLogin(username, password, setIsLoggingIn, setError) {
  setIsLoggingIn(true);
  setError("");

  try {
    const response = await fetch("https://localhost:7196/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Sikeres bejelentkezés, token mentése a localStorage-ba
      const token = data.token; // Feltételezve, hogy a válasz tartalmazza a tokent
      localStorage.setItem("jwt", token); // A token elmentése a localStorage-ba

      return true;
    } else {
      setError(data.message || "Invalid username or password.");
      return false;
    }
  } catch (error) {
    setError("An error occurred. Please try again.");
    return false;
  } finally {
    setIsLoggingIn(false);
  }
}

export async function handleRegister(name, email, date, username, password, setIsProcessing, setError) {
  try {
    setIsProcessing(true);
    const response = await fetch("https://localhost:7196/api/auth/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, date, username, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    setError(error.message);
    return false;
  } finally {
    setIsProcessing(false);
  }
}*/