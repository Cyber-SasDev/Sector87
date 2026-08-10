import * as THREE from "three";

export default class CameraManager {

    constructor() {

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Modos
        this.mode = "first";

        // Configuración tercera persona
        this.distance = 5;
        this.height = 2.2;
        this.offset = new THREE.Vector3();

        this.camera.position.set(0, 2, 5);

        document.addEventListener("keydown", (e) => {

            if (e.code === "F1") {

                e.preventDefault();

                this.mode = "first";

            }

            if (e.code === "F2") {

                e.preventDefault();

                this.mode = "third";

            }

        });

    }

    update(player, delta) {

        if (this.mode === "first") return;

        // Posición objetivo detrás del jugador
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);

        forward.y = 0;
        forward.normalize();

        const target = player.camera.position.clone();

        target.add(
            forward.multiplyScalar(-this.distance)
        );

        target.y += this.height;

        // Movimiento suave
        this.camera.position.lerp(
            target,
            delta * 8
        );

        // Mirar al jugador
        this.camera.lookAt(
            player.camera.position
        );

    }

}