document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.id = "drawingCanvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none"; // 입력 필드 클릭 가능
    canvas.style.zIndex = "99";

    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let isDrawing = false;
    let isDragging = false;
    let lastPoint = null;
    let lines = [];
    const fadeOutDuration = 3000;

    class Line {
        constructor() {
            this.points = [];
            this.opacity = 0.7;  // 형광펜 불투명도
            this.startTime = Date.now();
        }
    }

    function isOverRestrictedField(x, y) {
        const elements = document.elementsFromPoint(x, y);
        return elements.some(el => ["input", "select"].includes(el.tagName.toLowerCase()));
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();

        const point = {
            x: e.type.includes("touch") ? e.touches[0].clientX : e.clientX,
            y: e.type.includes("touch") ? e.touches[0].clientY : e.clientY,
        };

        if (lines.length > 0 && lastPoint) {
            const lastLine = lines[lines.length - 1];
            const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);

            if (distance > 5) {
                const midpoint = {
                    x: (point.x + lastPoint.x) / 2,
                    y: (point.y + lastPoint.y) / 2,
                };
                lastLine.points.push(midpoint);
            }
        }

        lastPoint = point;
        lines[lines.length - 1].points.push(point);
        drawLines();
    }

    function drawLines() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        lines.forEach(line => {
            if (line.points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(line.points[0].x, line.points[0].y);

            for (let i = 1; i < line.points.length; i++) {
                ctx.lineTo(line.points[i].x, line.points[i].y);
            }

            ctx.strokeStyle = `rgba(255, 255, 0, ${line.opacity})`;
            ctx.lineWidth = 12;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();
        });
    }

    function startDrawing(e) {
        if (!e.buttons) return;

        const point = {
            x: e.type.includes("touch") ? e.touches[0].clientX : e.clientX,
            y: e.type.includes("touch") ? e.touches[0].clientY : e.clientY,
        };

        // `input`과 `select` 위에서는 형광펜 작동 금지, `textarea`에서는 정상 작동
        if (isOverRestrictedField(point.x, point.y)) {
            isDragging = false;
            return;
        }

        isDrawing = true;
        isDragging = true;
        lastPoint = point;
        lines.push(new Line());
        draw(e);
    }

    function stopDrawing() {
        if (!isDragging) return;
        isDrawing = false;
        isDragging = false;
        lastPoint = null;
    }

    function animate() {
        const currentTime = Date.now();

        lines = lines.filter(line => {
            const elapsed = currentTime - line.startTime;
            line.opacity = Math.max(0, 0.7 - elapsed / fadeOutDuration);  // 불투명도
            return line.opacity > 0;
        });

        drawLines();
        requestAnimationFrame(animate);
    }

    document.addEventListener("mousedown", startDrawing);
    document.addEventListener("mousemove", draw);
    document.addEventListener("mouseup", stopDrawing);
    document.addEventListener("mouseout", stopDrawing);

    document.addEventListener("touchstart", startDrawing);
    document.addEventListener("touchmove", draw);
    document.addEventListener("touchend", stopDrawing);

    animate();
});
