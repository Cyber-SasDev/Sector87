import * as THREE from "three";

const OBJECT_LIBRARY = {
    block: {
        name: "Bloque",
        size: [1, 1, 1]
    },

    wall: {
        name: "Pared",
        size: [4, 2, 0.5]
    },

    platform: {
        name: "Plataforma",
        size: [4, 0.5, 4]
    },

    crate: {
        name: "Caja",
        size: [1.5, 1.5, 1.5]
    }
};

const MATERIAL_LIBRARY = {
    concrete: {
        name: "Concreto",
        color: 0x707780,
        roughness: 0.9,
        metalness: 0
    },

    wood: {
        name: "Madera",
        color: 0x8b5a2b,
        roughness: 1,
        metalness: 0
    },

    metal: {
        name: "Metal",
        color: 0x37474f,
        roughness: 0.45,
        metalness: 0.7
    }
};

export default class MapMaker {

    constructor(scene, camera, colliders, player = null) {

        this.scene = scene;
        this.camera = camera;
        this.colliders = colliders;
        this.player = player;

        this.enabled = false;
        this.mode = "place";

        this.objectType = "block";
        this.materialType = "concrete";

        this.customColor = null;

        this.gridSize = 1;
        this.previewScale = 1;
        this.previewRotationY = 0;

        this.editableObjects = [];
        this.selectedObject = null;
        this.selectionHelper = null;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0);

        this.pointerOverUI = false;

        this.history = [];
        this.historyIndex = -1;
        this.historyTimer = null;

        this.createGrid();
        this.createPreview();
        this.createOverlay();
        this.bindEvents();

        this.commitHistory();

    }

    // =========================
    // GRID
    // =========================

    createGrid() {

        this.grid = new THREE.GridHelper(
            60,
            60,
            0x00ffff,
            0x164b5f
        );

        this.grid.position.y = 0.012;
        this.grid.visible = false;

        this.grid.userData.ignoreMapMaker = true;

        const materials = Array.isArray(this.grid.material)
            ? this.grid.material
            : [this.grid.material];

        for (const material of materials) {

            material.transparent = true;
            material.opacity = 0.48;

        }

        this.scene.add(this.grid);

    }

    // =========================
    // PREVIEW
    // =========================

    createPreview() {

        this.preview = null;

        this.rebuildPreview();

    }

    rebuildPreview() {

        if (this.preview) {

            this.scene.remove(this.preview);

            this.preview.geometry.dispose();
            this.preview.material.dispose();

        }

        const definition =
            OBJECT_LIBRARY[this.objectType];

        this.preview = new THREE.Mesh(

            new THREE.BoxGeometry(
                ...definition.size
            ),

            new THREE.MeshBasicMaterial({
                color: this.getCurrentColor(),
                transparent: true,
                opacity: 0.42,
                wireframe: false,
                depthWrite: false
            })

        );

        this.preview.visible = false;
        this.preview.userData.ignoreMapMaker = true;

        this.scene.add(this.preview);

        this.updatePreviewTransform();

    }

    updatePreviewTransform() {

        if (!this.preview) return;

        this.preview.scale.setScalar(
            this.previewScale
        );

        this.preview.rotation.y =
            this.previewRotationY;

        this.preview.material.color.setHex(
            this.getCurrentColor()
        );

        this.preview.updateMatrixWorld(true);

    }

    // =========================
    // INTERFAZ
    // =========================

    createOverlay() {

        this.overlay = document.createElement("div");

        this.overlay.id = "mapMakerOverlay";

        this.overlay.innerHTML = `
            <div class="map-maker-title">
                <strong>SECTOR87 MAP MAKER</strong>
                <span>v0.9.2</span>
            </div>

            <div class="map-maker-section">
                <label>Modo</label>

                <div class="map-maker-buttons">
                    <button data-map-mode="place">
                        Colocar
                    </button>

                    <button data-map-mode="select">
                        Seleccionar
                    </button>
                </div>
            </div>

            <div class="map-maker-section">
                <label>Biblioteca</label>

                <div class="map-maker-library">
                    <button data-map-object="block">
                        Bloque
                    </button>

                    <button data-map-object="wall">
                        Pared
                    </button>

                    <button data-map-object="platform">
                        Plataforma
                    </button>

                    <button data-map-object="crate">
                        Caja
                    </button>
                </div>
            </div>

            <div class="map-maker-section">
                <label>Material</label>

                <div class="map-maker-buttons">
                    <button data-map-material="concrete">
                        Concreto
                    </button>

                    <button data-map-material="wood">
                        Madera
                    </button>

                    <button data-map-material="metal">
                        Metal
                    </button>
                </div>

                <div class="map-maker-color">
                    <span>Color</span>

                    <input
                        id="mapMakerColor"
                        type="color"
                        value="#707780"
                    >
                </div>
            </div>

            <div class="map-maker-section map-maker-status">
                <div>
                    Objeto:
                    <strong id="mapMakerObjectName">
                        Bloque
                    </strong>
                </div>

                <div>
                    Escala:
                    <strong id="mapMakerScale">
                        1.00
                    </strong>
                </div>

                <div>
                    Rotación:
                    <strong id="mapMakerRotation">
                        0°
                    </strong>
                </div>

                <div>
                    Bloques:
                    <strong id="mapMakerObjectCount">
                        0
                    </strong>
                </div>
            </div>

            <div class="map-maker-section">
                <div class="map-maker-actions">
                    <button id="mapMakerUndo">
                        Deshacer
                    </button>

                    <button id="mapMakerRedo">
                        Rehacer
                    </button>

                    <button id="mapMakerExport">
                        Exportar
                    </button>

                    <button id="mapMakerImport">
                        Importar
                    </button>

                    <button
                        id="mapMakerClear"
                        class="danger"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            <div class="map-maker-help">
                <span>Click izquierdo: colocar/seleccionar</span>
                <span>Click derecho: eliminar</span>
                <span>R: rotar</span>
                <span>Rueda: escalar</span>
                <span>Ctrl + Z / Ctrl + Y: historial</span>
                <span>Delete: borrar seleccionado</span>
                <span>F4: cerrar editor</span>
            </div>

            <input
                id="mapMakerFileInput"
                type="file"
                accept=".json,application/json"
                hidden
            >
        `;

        this.overlay.style.display = "none";

        document.body.appendChild(this.overlay);

        this.fileInput = this.overlay.querySelector(
            "#mapMakerFileInput"
        );

        this.overlay.addEventListener(
            "mouseenter",
            () => {

                this.pointerOverUI = true;

            }
        );

        this.overlay.addEventListener(
            "mouseleave",
            () => {

                this.pointerOverUI = false;

            }
        );

        this.overlay.addEventListener(
            "mousedown",
            (event) => {

                event.stopPropagation();

            }
        );

        this.bindOverlayButtons();

        this.updateOverlay();

    }

    bindOverlayButtons() {

        const modeButtons =
            this.overlay.querySelectorAll(
                "[data-map-mode]"
            );

        for (const button of modeButtons) {

            button.addEventListener("click", () => {

                this.setMode(
                    button.dataset.mapMode
                );

            });

        }

        const objectButtons =
            this.overlay.querySelectorAll(
                "[data-map-object]"
            );

        for (const button of objectButtons) {

            button.addEventListener("click", () => {

                this.setObjectType(
                    button.dataset.mapObject
                );

            });

        }

        const materialButtons =
            this.overlay.querySelectorAll(
                "[data-map-material]"
            );

        for (const button of materialButtons) {

            button.addEventListener("click", () => {

                this.setMaterial(
                    button.dataset.mapMaterial
                );

            });

        }

        const colorInput =
            this.overlay.querySelector(
                "#mapMakerColor"
            );

        colorInput.addEventListener(
            "input",
            (event) => {

                this.customColor = parseInt(
                    event.target.value.substring(1),
                    16
                );

                this.updatePreviewTransform();

                if (this.selectedObject) {

                    this.selectedObject.material.color.setHex(
                        this.customColor
                    );

                    this.selectedObject.userData.color =
                        this.customColor;

                    this.scheduleHistory();

                }

            }
        );

        this.overlay
            .querySelector("#mapMakerUndo")
            .addEventListener(
                "click",
                () => this.undo()
            );

        this.overlay
            .querySelector("#mapMakerRedo")
            .addEventListener(
                "click",
                () => this.redo()
            );

        this.overlay
            .querySelector("#mapMakerExport")
            .addEventListener(
                "click",
                () => this.exportMap()
            );

        this.overlay
            .querySelector("#mapMakerImport")
            .addEventListener(
                "click",
                () => this.fileInput.click()
            );

        this.overlay
            .querySelector("#mapMakerClear")
            .addEventListener(
                "click",
                () => this.clearMap(true)
            );

        this.fileInput.addEventListener(
            "change",
            async (event) => {

                const file =
                    event.target.files?.[0];

                if (!file) return;

                try {

                    const text =
                        await file.text();

                    const data =
                        JSON.parse(text);

                    this.loadMapData(
                        data,
                        true
                    );

                } catch (error) {

                    console.error(
                        "No se pudo cargar el mapa:",
                        error
                    );

                    alert(
                        "El archivo JSON no es válido."
                    );

                }

                event.target.value = "";

            }
        );

    }

    // =========================
    // EVENTOS
    // =========================

    bindEvents() {

        document.addEventListener(
            "keydown",
            (event) => this.handleKeyDown(event)
        );

        document.addEventListener(
            "mousemove",
            (event) => this.handleMouseMove(event)
        );

        document.addEventListener(
            "mousedown",
            (event) => this.handleMouseDown(event)
        );

        document.addEventListener(
            "wheel",
            (event) => this.handleWheel(event),
            {
                passive: false
            }
        );

        document.addEventListener(
            "contextmenu",
            (event) => {

                if (this.enabled) {

                    event.preventDefault();

                }

            }
        );

        // Evita que Controls.js capture el cursor
        // cuando hacemos clic en el editor.
        document.addEventListener(
            "click",
            (event) => {

                if (
                    this.enabled &&
                    !event.target.closest?.(
                        "#mapMakerOverlay"
                    )
                ) {

                    event.preventDefault();
                    event.stopImmediatePropagation();

                }

            },
            true
        );

    }

    handleKeyDown(event) {

        if (event.code === "F4") {

            event.preventDefault();

            this.toggle();

            return;

        }

        if (!this.enabled) return;

        if (
            event.ctrlKey &&
            event.code === "KeyZ"
        ) {

            event.preventDefault();

            this.undo();

            return;

        }

        if (
            event.ctrlKey &&
            event.code === "KeyY"
        ) {

            event.preventDefault();

            this.redo();

            return;

        }

        if (event.code === "KeyB") {

            this.setMode("place");

        }

        if (event.code === "KeyV") {

            this.setMode("select");

        }

        if (
            event.code === "KeyR" &&
            !event.repeat
        ) {

            event.preventDefault();

            this.rotateCurrent();

        }

        if (
            event.code === "Delete" &&
            !event.repeat
        ) {

            event.preventDefault();

            if (this.selectedObject) {

                this.deleteBlock(
                    this.selectedObject,
                    true
                );

            }

        }

        if (
            event.code === "KeyP" &&
            !event.repeat
        ) {

            this.exportMap();

        }

        if (
            event.code === "KeyO" &&
            !event.repeat
        ) {

            this.fileInput.click();

        }

    }

    handleMouseMove(event) {

        if (!this.enabled) return;

        this.mouse.x =
            (event.clientX / window.innerWidth) * 2 - 1;

        this.mouse.y =
            -(event.clientY / window.innerHeight) * 2 + 1;

    }

    handleMouseDown(event) {

        if (
            !this.enabled ||
            this.pointerOverUI
        ) {

            return;

        }

        if (event.button === 0) {

            event.preventDefault();

            if (this.mode === "place") {

                this.placeObject();

            } else {

                this.selectAtPointer();

            }

        }

        if (event.button === 2) {

            event.preventDefault();

            this.removeAtPointer();

        }

    }

    handleWheel(event) {

        if (
            !this.enabled ||
            this.pointerOverUI
        ) {

            return;

        }

        event.preventDefault();

        const amount =
            event.deltaY < 0
                ? 0.1
                : -0.1;

        if (
            this.mode === "select" &&
            this.selectedObject
        ) {

            const newScale = THREE.MathUtils.clamp(
                this.selectedObject.scale.x + amount,
                0.25,
                5
            );

            this.selectedObject.scale.setScalar(
                newScale
            );

            this.selectedObject.updateMatrixWorld(true);

            this.updateCollider(
                this.selectedObject
            );

            this.updateSelectionHelper();
            this.scheduleHistory();

        } else {

            this.previewScale =
                THREE.MathUtils.clamp(
                    this.previewScale + amount,
                    0.25,
                    5
                );

            this.updatePreviewTransform();

        }

        this.updateOverlay();

    }

    // =========================
    // ACTIVAR / DESACTIVAR
    // =========================

    toggle() {

        this.enabled = !this.enabled;

        this.overlay.style.display =
            this.enabled
                ? "flex"
                : "none";

        this.grid.visible =
            this.enabled;

        if (this.enabled) {

            document.exitPointerLock?.();

            this.stopPlayer();

        } else {

            this.preview.visible = false;

            this.clearSelection();

        }

        console.log(
            `Map Maker: ${
                this.enabled
                    ? "ACTIVADO"
                    : "DESACTIVADO"
            }`
        );

    }

    stopPlayer() {

        if (!this.player) return;

        if (this.player.movement) {

            this.player.movement.keys = {};

        }

        if (this.player.state) {

            this.player.state.velocity.x = 0;
            this.player.state.velocity.z = 0;

            this.player.state.isRunning = false;
            this.player.state.isSliding = false;

        }

    }

    // =========================
    // UPDATE
    // =========================

    update() {

        if (!this.enabled) return;

        this.stopPlayer();

        if (
            this.mode === "place" &&
            !this.pointerOverUI
        ) {

            this.updatePreview();

        } else {

            this.preview.visible = false;

        }

        this.updateSelectionHelper();
        this.updateOverlay();

    }

    updatePreview() {

        const hit = this.getSceneHit();

        if (!hit) {

            this.preview.visible = false;

            return;

        }

        const position =
            this.getSnappedPosition(hit);

        this.preview.position.copy(position);

        this.updatePreviewTransform();

        this.preview.visible = true;

    }

    // =========================
    // RAYCAST
    // =========================

    setRaycaster() {

        this.raycaster.setFromCamera(
            this.mouse,
            this.camera
        );

    }

    getSceneHit() {

        this.setRaycaster();

        const hits =
            this.raycaster.intersectObjects(
                this.scene.children,
                true
            );

        return hits.find((hit) => {

            if (!hit.object.isMesh) {

                return false;

            }

            return !this.isIgnored(
                hit.object
            );

        }) || null;

    }

    getEditableHit() {

        this.setRaycaster();

        const hits =
            this.raycaster.intersectObjects(
                this.editableObjects,
                false
            );

        return hits.length > 0
            ? hits[0]
            : null;

    }

    isIgnored(object) {

        let current = object;

        while (current) {

            if (
                current.userData.ignoreMapMaker
            ) {

                return true;

            }

            current = current.parent;

        }

        return false;

    }

    // =========================
    // POSICIÓN Y SNAP
    // =========================

    getCurrentSize() {

        const definition =
            OBJECT_LIBRARY[this.objectType];

        let x =
            definition.size[0] *
            this.previewScale;

        const y =
            definition.size[1] *
            this.previewScale;

        let z =
            definition.size[2] *
            this.previewScale;

        const turns =
            Math.abs(
                Math.round(
                    this.previewRotationY /
                    (Math.PI / 2)
                )
            ) % 2;

        if (turns === 1) {

            [x, z] = [z, x];

        }

        return new THREE.Vector3(
            x,
            y,
            z
        );

    }

    getSnappedPosition(hit) {

        const normal =
            new THREE.Vector3(0, 1, 0);

        if (hit.face) {

            normal
                .copy(hit.face.normal)
                .transformDirection(
                    hit.object.matrixWorld
                )
                .round();

        }

        const size =
            this.getCurrentSize();

        const offset =
            Math.abs(normal.x) * size.x / 2 +
            Math.abs(normal.y) * size.y / 2 +
            Math.abs(normal.z) * size.z / 2;

        const position =
            hit.point
                .clone()
                .addScaledVector(
                    normal,
                    offset + 0.002
                );

        position.x =
            Math.round(
                position.x /
                this.gridSize
            ) * this.gridSize;

        position.z =
            Math.round(
                position.z /
                this.gridSize
            ) * this.gridSize;

        position.y =
            Math.round(
                (
                    position.y -
                    size.y / 2
                ) /
                this.gridSize
            ) *
            this.gridSize +
            size.y / 2;

        return position;

    }

    // =========================
    // CREAR OBJETOS
    // =========================

    createObjectMesh(data) {

        const definition =
            OBJECT_LIBRARY[data.type] ||
            OBJECT_LIBRARY.block;

        const materialData =
            MATERIAL_LIBRARY[data.material] ||
            MATERIAL_LIBRARY.concrete;

        const mesh = new THREE.Mesh(

            new THREE.BoxGeometry(
                ...definition.size
            ),

            new THREE.MeshStandardMaterial({
                color:
                    data.color ??
                    materialData.color,

                roughness:
                    materialData.roughness,

                metalness:
                    materialData.metalness
            })

        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.userData.isMapObject = true;
        mesh.userData.objectType =
            data.type;

        mesh.userData.materialType =
            data.material;

        mesh.userData.color =
            data.color ??
            materialData.color;

        return mesh;

    }

    addObject(data, addHistory = true) {

        const mesh =
            this.createObjectMesh(data);

        mesh.position.set(
            data.position.x,
            data.position.y,
            data.position.z
        );

        mesh.rotation.y =
            data.rotationY ?? 0;

        if (typeof data.scale === "number") {

            mesh.scale.setScalar(
                data.scale
            );

        } else {

            mesh.scale.set(
                data.scale?.x ?? 1,
                data.scale?.y ?? 1,
                data.scale?.z ?? 1
            );

        }

        this.scene.add(mesh);

        mesh.updateMatrixWorld(true);

        const collider =
            new THREE.Box3().setFromObject(
                mesh
            );

        mesh.userData.collider = collider;

        this.editableObjects.push(mesh);
        this.colliders.push(collider);

        if (addHistory) {

            this.commitHistory();

        }

        this.updateOverlay();

        return mesh;

    }

    placeObject() {

        this.updatePreview();

        if (!this.preview.visible) return;

        const position =
            this.preview.position.clone();

        const exists =
            this.editableObjects.some(
                (object) =>
                    object.position
                        .distanceToSquared(position) <
                    0.001
            );

        if (exists) return;

        this.addObject({
            type: this.objectType,

            material: this.materialType,

            color: this.getCurrentColor(),

            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },

            rotationY:
                this.previewRotationY,

            scale: this.previewScale
        });

    }

    // =========================
    // SELECCIÓN
    // =========================

    selectAtPointer() {

        const hit =
            this.getEditableHit();

        if (!hit) {

            this.clearSelection();

            return;

        }

        this.selectObject(
            hit.object
        );

    }

    selectObject(object) {

        this.clearSelection();

        this.selectedObject = object;

        this.selectionHelper =
            new THREE.BoxHelper(
                object,
                0x00ffff
            );

        this.selectionHelper.userData.ignoreMapMaker =
            true;

        this.scene.add(
            this.selectionHelper
        );

        this.updateOverlay();

    }

    clearSelection() {

        if (this.selectionHelper) {

            this.scene.remove(
                this.selectionHelper
            );

            this.selectionHelper.geometry.dispose();
            this.selectionHelper.material.dispose();

        }

        this.selectionHelper = null;
        this.selectedObject = null;

    }

    updateSelectionHelper() {

        if (
            !this.selectionHelper ||
            !this.selectedObject
        ) {

            return;

        }

        this.selectionHelper.update();

    }

    // =========================
    // ROTAR / ESCALAR
    // =========================

    rotateCurrent() {

        const rotationStep =
            Math.PI / 2;

        if (
            this.mode === "select" &&
            this.selectedObject
        ) {

            this.selectedObject.rotation.y +=
                rotationStep;

            this.selectedObject.updateMatrixWorld(
                true
            );

            this.updateCollider(
                this.selectedObject
            );

            this.updateSelectionHelper();
            this.commitHistory();

        } else {

            this.previewRotationY +=
                rotationStep;

            this.updatePreviewTransform();

        }

        this.updateOverlay();

    }

    updateCollider(object) {

        const collider =
            object.userData.collider;

        if (!collider) return;

        object.updateMatrixWorld(true);

        collider.setFromObject(object);

    }

    // =========================
    // BORRAR
    // =========================

    removeAtPointer() {

        const hit =
            this.getEditableHit();

        if (!hit) return;

        this.deleteBlock(
            hit.object,
            true
        );

    }

    deleteBlock(
        object,
        addHistory = true
    ) {

        if (!object) return;

        if (this.selectedObject === object) {

            this.clearSelection();

        }

        const collider =
            object.userData.collider;

        const colliderIndex =
            this.colliders.indexOf(
                collider
            );

        if (colliderIndex !== -1) {

            this.colliders.splice(
                colliderIndex,
                1
            );

        }

        const objectIndex =
            this.editableObjects.indexOf(
                object
            );

        if (objectIndex !== -1) {

            this.editableObjects.splice(
                objectIndex,
                1
            );

        }

        this.scene.remove(object);

        object.geometry.dispose();
        object.material.dispose();

        if (addHistory) {

            this.commitHistory();

        }

        this.updateOverlay();

    }

    clearMap(addHistory = true) {

        this.clearSelection();

        const objects = [
            ...this.editableObjects
        ];

        for (const object of objects) {

            this.deleteBlock(
                object,
                false
            );

        }

        if (addHistory) {

            this.commitHistory();

        }

    }

    // =========================
    // MODOS Y MATERIALES
    // =========================

    setMode(mode) {

        this.mode = mode;

        if (mode === "place") {

            this.clearSelection();

        } else {

            this.preview.visible = false;

        }

        this.updateOverlay();

    }

    setObjectType(type) {

        if (!OBJECT_LIBRARY[type]) return;

        this.objectType = type;
        this.previewScale = 1;
        this.previewRotationY = 0;

        this.rebuildPreview();
        this.updateOverlay();

    }

    setMaterial(material) {

        if (!MATERIAL_LIBRARY[material]) {

            return;

        }

        this.materialType = material;
        this.customColor = null;

        const color =
            MATERIAL_LIBRARY[material].color;

        const colorInput =
            this.overlay.querySelector(
                "#mapMakerColor"
            );

        colorInput.value =
            `#${color
                .toString(16)
                .padStart(6, "0")}`;

        this.updatePreviewTransform();

        if (this.selectedObject) {

            this.selectedObject.userData.materialType =
                material;

            this.selectedObject.userData.color =
                color;

            this.selectedObject.material.color.setHex(
                color
            );

            this.selectedObject.material.roughness =
                MATERIAL_LIBRARY[material].roughness;

            this.selectedObject.material.metalness =
                MATERIAL_LIBRARY[material].metalness;

            this.selectedObject.material.needsUpdate =
                true;

            this.commitHistory();

        }

        this.updateOverlay();

    }

    getCurrentColor() {

        if (this.customColor !== null) {

            return this.customColor;

        }

        return MATERIAL_LIBRARY[
            this.materialType
        ].color;

    }

    // =========================
    // HISTORIAL
    // =========================

    serializeMap() {

        return {
            name: "Sector87 Map",
            version: 2,

            objects:
                this.editableObjects.map(
                    (object) => ({
                        type:
                            object.userData.objectType,

                        material:
                            object.userData.materialType,

                        color:
                            object.userData.color,

                        position: {
                            x: object.position.x,
                            y: object.position.y,
                            z: object.position.z
                        },

                        rotationY:
                            object.rotation.y,

                        scale: {
                            x: object.scale.x,
                            y: object.scale.y,
                            z: object.scale.z
                        }
                    })
                )
        };

    }

    commitHistory() {

        const snapshot =
            JSON.stringify(
                this.serializeMap()
            );

        if (
            this.history[
                this.historyIndex
            ] === snapshot
        ) {

            return;

        }

        this.history =
            this.history.slice(
                0,
                this.historyIndex + 1
            );

        this.history.push(snapshot);

        if (this.history.length > 50) {

            this.history.shift();

        }

        this.historyIndex =
            this.history.length - 1;

    }

    scheduleHistory() {

        clearTimeout(
            this.historyTimer
        );

        this.historyTimer = setTimeout(
            () => this.commitHistory(),
            180
        );

    }

    undo() {

        if (this.historyIndex <= 0) {

            return;

        }

        this.historyIndex--;

        const snapshot =
            JSON.parse(
                this.history[
                    this.historyIndex
                ]
            );

        this.loadMapData(
            snapshot,
            false
        );

    }

    redo() {

        if (
            this.historyIndex >=
            this.history.length - 1
        ) {

            return;

        }

        this.historyIndex++;

        const snapshot =
            JSON.parse(
                this.history[
                    this.historyIndex
                ]
            );

        this.loadMapData(
            snapshot,
            false
        );

    }

    // =========================
    // GUARDAR / CARGAR
    // =========================

    exportMap() {

        const mapData =
            this.serializeMap();

        const json =
            JSON.stringify(
                mapData,
                null,
                4
            );

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "sector87-map.json";

        document.body.appendChild(link);

        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        console.log(
            "Mapa exportado:",
            mapData
        );

    }

    loadMapData(
        mapData,
        addHistory = true
    ) {

        if (
            !mapData ||
            !Array.isArray(
                mapData.objects
            )
        ) {

            throw new Error(
                "Formato de mapa inválido."
            );

        }

        this.clearMap(false);

        for (
            const objectData
            of mapData.objects
        ) {

            this.addObject(
                objectData,
                false
            );

        }

        this.clearSelection();

        if (addHistory) {

            this.commitHistory();

        }

        this.updateOverlay();

    }

    // =========================
    // ACTUALIZAR UI
    // =========================

    updateOverlay() {

        if (!this.overlay) return;

        const objectName =
            this.selectedObject
                ? OBJECT_LIBRARY[
                    this.selectedObject
                        .userData.objectType
                ]?.name
                : OBJECT_LIBRARY[
                    this.objectType
                ].name;

        const scale =
            this.selectedObject
                ? this.selectedObject.scale.x
                : this.previewScale;

        const rotation =
            this.selectedObject
                ? this.selectedObject.rotation.y
                : this.previewRotationY;

        this.overlay.querySelector(
            "#mapMakerObjectName"
        ).textContent =
            objectName || "Objeto";

        this.overlay.querySelector(
            "#mapMakerScale"
        ).textContent =
            scale.toFixed(2);

        this.overlay.querySelector(
            "#mapMakerRotation"
        ).textContent =
            `${Math.round(
                THREE.MathUtils.radToDeg(
                    rotation
                )
            ) % 360}°`;

        this.overlay.querySelector(
            "#mapMakerObjectCount"
        ).textContent =
            this.editableObjects.length;

        const modeButtons =
            this.overlay.querySelectorAll(
                "[data-map-mode]"
            );

        for (const button of modeButtons) {

            button.classList.toggle(
                "active",
                button.dataset.mapMode ===
                this.mode
            );

        }

        const objectButtons =
            this.overlay.querySelectorAll(
                "[data-map-object]"
            );

        for (const button of objectButtons) {

            button.classList.toggle(
                "active",
                button.dataset.mapObject ===
                this.objectType
            );

        }

    }

}