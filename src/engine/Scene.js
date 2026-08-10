import * as THREE from "three";

export default class SceneManager {

    constructor() {

        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0x87ceeb);

        const ambient = new THREE.AmbientLight(0xffffff, 1.2);

        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 2);

        sun.position.set(20,30,10);

        sun.castShadow = true;

        this.scene.add(sun);

    }

}