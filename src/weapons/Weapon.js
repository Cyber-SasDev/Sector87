import * as THREE from "three";
import AK47 from "./AK47";

export default class Weapon {

    constructor(camera) {

        this.camera = camera;

        this.group = new THREE.Group();

        this.create();

        this.group.position.set(
            0.45,
            -0.35,
            -1.5
        );

        this.group.scale.set(
            2,
            2,
            2
        );

        this.camera.add(this.group);

        // =========================
        // MUNICIÓN
        // =========================

        this.magazineSize = 30;

        this.ammo = 30;

        this.reserveAmmo = 90;

        // =========================
        // DISPARO
        // =========================

        this.shooting = false;

        this.shootTimer = 0;

        this.fireCooldown = 0.10;

        this.fireTimer = 0;

        // =========================
        // RECARGA
        // =========================

        this.reloading = false;

        this.reloadDuration = 1.5;

        this.reloadTimer = 0;

        // =========================
        // RECOIL
        // =========================

        this.recoilAmount = 0.08;

        this.recoilRecovery = 10;

        this.defaultPosition =
            this.group.position.clone();

        // =========================
        // FLASH
        // =========================

        this.createMuzzleFlash();

        // =========================
        // CONTROLES
        // =========================

        document.addEventListener(
            "mousedown",
            (event) => {

                if (event.button !== 0) return;

                if (
                    document.pointerLockElement !==
                    document.body
                ) {
                    return;
                }

                this.shoot();

            }
        );

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.code === "KeyR" &&
                    !event.repeat
                ) {

                    this.reload();

                }

            }
        );

        console.log(
            "🔫 Weapon creada"
        );

    }

    create() {

        this.weapon = new AK47();

        this.group.add(
            this.weapon.group
        );

    }

    createMuzzleFlash() {

        const geometry =
            new THREE.SphereGeometry(
                0.12,
                8,
                8
            );

        const material =
            new THREE.MeshBasicMaterial({
                color: 0xffaa00
            });

        this.muzzleFlash =
            new THREE.Mesh(
                geometry,
                material
            );

        this.muzzleFlash.position.set(
            0,
            0.02,
            -0.85
        );

        this.muzzleFlash.visible = false;

        this.group.add(
            this.muzzleFlash
        );

    }

    shoot() {

        // No disparar durante recarga
        if (this.reloading) return;

        // Cooldown
        if (this.fireTimer > 0) return;

        // Sin munición
        if (this.ammo <= 0) {

            console.log(
                "🔴 Sin munición — pulsa R"
            );

            return;

        }

        // Gastar bala
        this.ammo--;

        console.log(
            `🔫 DISPARO | ${this.ammo}/${this.reserveAmmo}`
        );

        // Flash
        this.muzzleFlash.visible = true;

        this.shootTimer = 0.06;

        // Cooldown
        this.fireTimer =
            this.fireCooldown;

        // Recoil
        this.group.position.z =
            this.defaultPosition.z +
            this.recoilAmount;

        this.group.rotation.x = -0.04;

    }

    reload() {

        // Ya recargando
        if (this.reloading) return;

        // Cargador lleno
        if (
            this.ammo >=
            this.magazineSize
        ) {

            return;

        }

        // No hay reserva
        if (this.reserveAmmo <= 0) {

            console.log(
                "🔴 No tienes munición de reserva"
            );

            return;

        }

        this.reloading = true;

        this.reloadTimer =
            this.reloadDuration;

        console.log(
            "🔄 RECARGANDO..."
        );

        this.group.rotation.x = -0.45;
this.group.position.y =
    this.defaultPosition.y - 0.35;

    }

    finishReload() {

        const missingAmmo =
            this.magazineSize -
            this.ammo;

        const ammoToLoad =
            Math.min(
                missingAmmo,
                this.reserveAmmo
            );

        this.ammo += ammoToLoad;

        this.reserveAmmo -=
            ammoToLoad;

        this.reloading = false;

        console.log(
            `🔄 RECARGA COMPLETA | ${this.ammo}/${this.reserveAmmo}`
        );

        this.group.position.y =
    this.defaultPosition.y;

this.group.rotation.x = 0;

    }

    update(delta) {

        // =========================
        // FIRE COOLDOWN
        // =========================

        if (this.fireTimer > 0) {

            this.fireTimer -= delta;

        }

        // =========================
        // FLASH
        // =========================

        if (this.muzzleFlash.visible) {

            this.shootTimer -= delta;

            if (this.shootTimer <= 0) {

                this.muzzleFlash.visible =
                    false;

            }

        }

        // =========================
        // RECARGA
        // =========================

        if (this.reloading) {

            this.reloadTimer -= delta;

            if (
                this.reloadTimer <= 0
            ) {

                this.finishReload();

            }

        }

        // =========================
        // RECOIL POSITION
        // =========================

        this.group.position.lerp(
            this.defaultPosition,
            Math.min(
                1,
                delta *
                this.recoilRecovery
            )
        );

        // =========================
        // RECOIL ROTATION
        // =========================

        this.group.rotation.x =
            THREE.MathUtils.lerp(
                this.group.rotation.x,
                0,
                Math.min(
                    1,
                    delta *
                    this.recoilRecovery
                )
            );

    }

}