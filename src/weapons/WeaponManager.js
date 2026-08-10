import Weapon from "./Weapon";

export default class WeaponManager {

    constructor(camera) {

        console.log("WeaponManager creado");

        this.weapon = new Weapon(camera);

    }

    update(delta) {

        this.weapon.update(delta);

    }

}
