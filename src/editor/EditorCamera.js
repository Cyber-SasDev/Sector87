import * as THREE from "three";

export default class EditorCamera {

    constructor(camera) {

        this.camera = camera;

        this.enabled = false;

        this.keys = {};

        this.speed = 12;
        this.fastSpeed = 25;

        this.forward = new THREE.Vector3();
        this.right = new THREE.Vector3();
        this.up = new THREE.Vector3(0, 1, 0);

        document.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });

    }

    update(delta) {

        if (!this.enabled) return;

        console.log("EditorCamera funcionando");

        this.camera.getWorldDirection(this.forward);
        this.forward.normalize();

        this.right.crossVectors(
            this.forward,
            this.up
        ).normalize();

        const speed = this.keys["ShiftLeft"]
            ? this.fastSpeed
            : this.speed;

        if (this.keys["KeyW"]) {
            this.camera.position.addScaledVector(
                this.forward,
                speed * delta
            );
        }

        if (this.keys["KeyS"]) {
            this.camera.position.addScaledVector(
                this.forward,
                -speed * delta
            );
        }

        if (this.keys["KeyA"]) {
            this.camera.position.addScaledVector(
                this.right,
                -speed * delta
            );
        }

        if (this.keys["KeyD"]) {
            this.camera.position.addScaledVector(
                this.right,
                speed * delta
            );
        }

        if (this.keys["Space"]) {
            this.camera.position.y += speed * delta;
        }

        if (this.keys["ControlLeft"]) {
            this.camera.position.y -= speed * delta;
        }

    }

}