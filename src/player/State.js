import * as THREE from "three";

export default class State {

    constructor() {

        // Movimiento
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.slideDirection = new THREE.Vector3();

        // Física vertical
        this.verticalVelocity = 0;
        this.feetY = 0;

        // Estados
        this.isGrounded = true;
        this.isRunning = false;
        this.isSliding = false;
        this.isJumping = false;
        this.isCrouching = false;

        // Solicitudes de acciones
        this.jumpRequested = false;
        this.slideRequested = false;

        // Velocidades
        this.walkSpeed = 6;
        this.runSpeed = 10;
        this.crouchSpeed = 3.5;

        // Suavidad del movimiento
        this.groundAcceleration = 35;
        this.airAcceleration = 8;
        this.groundDeceleration = 28;

        // Salto y gravedad
        this.jumpForce = 7;
        this.gravity = 20;

        // Altura del suelo
        // Ahora representa la altura de los pies, no la cámara.
        this.floorHeight = 0;

        // Tamaño del jugador
        this.playerRadius = 0.38;

        this.standingHeight = 2;
        this.crouchHeight = 1.25;
        this.slideHeight = 1;

        this.currentHeight = this.standingHeight;

        // Slide
        this.slideSpeed = 14;
        this.slideFriction = 8;

        this.slideDuration = 0.75;
        this.slideTimer = 0;

        this.slideCooldown = 1.1;
        this.slideCooldownTimer = 0;

        // Cámara
        this.defaultFov = 75;
        this.sprintFov = 82;
        this.slideFov = 86;

        this.headBobTime = 0;

        // Camera Effects
     this.cameraHeight = this.standingHeight;

     this.targetFov = this.defaultFov;

     this.currentRoll = 0;

     this.headBob = 0;

     this.headBobSpeed = 10;

     this.headBobAmount = 0.04;

     this.landingOffset = 0;

     // =========================
// VIDA DEL JUGADOR
// =========================

this.maxHealth = 100;
this.health = 100;

    }

}