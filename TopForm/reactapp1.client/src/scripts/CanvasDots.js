export function initializeCanvasDots(isDarkMode) {
    const maxx = window.innerWidth;
    const maxy = window.innerHeight;
    const halfx = maxx / 2;
    const halfy = maxy / 2;

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

    const dots = Array.from({ length: dotCount }, () => new Dot());

    function render() {
        context.fillStyle = isDarkMode ? "#000000" : "#ffffff";
        context.fillRect(0, 0, maxx, maxy);
        dots.forEach((dot) => {
            dot.move();
            dot.draw();
        });
        requestAnimationFrame(render);
    }

    function cleanup() {
        cancelAnimationFrame(render);
        document.body.removeChild(canvas);
    }

    render();

    return cleanup;
}