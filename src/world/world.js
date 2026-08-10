import * as THREE from "three";

export default class World {

    constructor(scene) {

        this.scene = scene;

        // Aquí guardaremos las cajas de colisión
        this.colliders = [];

        this.createFloor();
        this.createObstacles();

    }

    createFloor() {

        const floor = new THREE.Mesh(

            new THREE.PlaneGeometry(60, 60),

            new THREE.MeshStandardMaterial({
                color: 0x4caf50
            })

        );

        floor.rotation.x = -Math.PI / 2;

        floor.receiveShadow = true;

        this.scene.add(floor);

    }

    createObstacles() {

        const gray = 0x707780;
        const dark = 0x454b55;

        // Obstáculos del mapa
        this.addBox(
            0, 0, -8,
            5, 2, 3,
            gray
        );

        this.addBox(
            -7, 0, -3,
            3, 3, 3,
            dark
        );

        this.addBox(
            8, 0, -2,
            4, 1.5, 4,
            gray
        );

        this.addBox(
            -10, 0, 8,
            6, 2, 2,
            gray
        );

        this.addBox(
            7, 0, 10,
            3, 4, 3,
            dark
        );

        this.addBox(
            0, 0, 14,
            8, 1, 3,
            gray
        );

        // Paredes exteriores
        this.addBox(
            0, 0, -30,
            60, 5, 1,
            dark
        );

        this.addBox(
            0, 0, 30,
            60, 5, 1,
            dark
        );

        this.addBox(
            -30, 0, 0,
            1, 5, 60,
            dark
        );

        this.addBox(
            30, 0, 0,
            1, 5, 60,
            dark
        );

    }

    addBox(
        x,
        baseY,
        z,
        width,
        height,
        depth,
        color
    ) {

        const mesh = new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),

            new THREE.MeshStandardMaterial({
                color
            })

        );

        mesh.position.set(
            x,
            baseY + height / 2,
            z
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);

        // Actualizar posición mundial antes
        // de crear la caja de colisión
        mesh.updateMatrixWorld(true);

        const collider =
            new THREE.Box3().setFromObject(mesh);

        this.colliders.push(collider);

    }

}