export default class Debug {

    constructor(player) {

        this.player = player;

        this.visible = false;

        this.element = document.createElement("div");
        this.element.id = "debug";

        document.body.appendChild(this.element);

        document.addEventListener("keydown", (e) => {

            if (e.code === "F3") {

                e.preventDefault();

                this.visible = !this.visible;

                this.element.style.display =
                    this.visible ? "block" : "none";

            }

        });

        this.element.style.display = "none";

    }

    update() {

        if (!this.visible) return;

        const p = this.player.camera.position;
        const s = this.player.state;

        this.element.innerHTML = `
<b>SECTOR 87 DEV</b>

<hr>

<b>PLAYER</b><br>
X: ${p.x.toFixed(2)}<br>
Y: ${p.y.toFixed(2)}<br>
Z: ${p.z.toFixed(2)}

<br>

<b>STATE</b><br>
Grounded: ${s.isGrounded}<br>
Running: ${s.isRunning}<br>
Sliding: ${s.isSliding}<br>
Jumping: ${s.isJumping}<br>

<br>

<b>SPEED</b><br>
Walk: ${s.walkSpeed}<br>
Run: ${s.runSpeed}<br>

<br>

<b>CAMERA</b><br>
FOV: ${this.player.camera.fov.toFixed(1)}
`;

    }

}