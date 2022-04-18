import { GROUP } from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private _inside = [];
    private _level = null;

    onEnable(): void {
        this._level = this.node.parent.parent.getComponent("LevelController");
    }
    onTouchStart(): void {
        this._inside = [];
    }

    onTouchEnd(): void {
        let e = new cc.Event.EventCustom("valid", true);
        if (this._inside.length == this._level.inside.length && !this._inside.includes(this._level.outside)) {
            e["valid"] = true;
        }
        else {
            e["valid"] = false;
        }
        this.node.dispatchEvent(e);
    }

    onCollisionEnter(other, self): void {
        if (!this._inside.includes(other.node)) {
            this._inside.push(other.node);
        }
    }
}
