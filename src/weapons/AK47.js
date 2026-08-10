import * as THREE from "three";

export default class AK47 {

    constructor() {

        this.group = new THREE.Group();

        this.create();

        console.log("🔫 AK47 creada", this.group);

    }

    create() {

        const black = new THREE.MeshStandardMaterial({
            color: 0x202020,
            roughness: 0.8
        });

        const wood = new THREE.MeshStandardMaterial({
            color: 0x8b5a2b,
            roughness: 0.9
        });

        // Cuerpo
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.14,
                0.14,
                0.75
            ),
            black
        );

        this.group.add(body);

        // Cañón
        const barrel = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.04,
                0.04,
                0.45
            ),
            black
        );

        barrel.position.set(
            0,
            0.02,
            -0.60
        );

        this.group.add(barrel);

        // Culata
        const stock = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.08,
                0.12,
                0.28
            ),
            wood
        );

        stock.position.set(
            0,
            -0.01,
            0.48
        );

        this.group.add(stock);

        // Cargador
        const mag = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.08,
                0.20,
                0.06
            ),
            black
        );

        mag.position.set(
            0,
            -0.16,
            -0.02
        );

        mag.rotation.x = 0.35;

        this.group.add(mag);

        // Empuñadura
        const grip = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.06,
                0.16,
                0.05
            ),
            wood
        );

        grip.position.set(
            0,
            -0.15,
            0.12
        );

        grip.rotation.x = 0.25;

        this.group.add(grip);

    }

}