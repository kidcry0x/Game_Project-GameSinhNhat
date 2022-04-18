import Item from "./Item";
import { SOUND } from "./GameManager";

const {ccclass, property} = cc._decorator;

export enum STATE {
    USE,
    USED,
    FREE
}

@ccclass
export default class ItemPencil extends Item {

    @property(cc.Node)
    use: cc.Node = null;

    @property(cc.Node)
    used: cc.Node = null;

    @property(cc.Node)
    free: cc.Node = null;

    private _state = null;
    private _block = false;
    private _view = null;

    onEnable(): void {
        this._view = this.node.parent.parent;
    }

    setState(state: STATE): void {
        this._state = state;
        this.use.active = false;
        this.used.active = false;
        this.free.active = false;
        this._block = false;
        switch(state)
        {
            case STATE.USE:
                this.use.active = true;
                break;
            case STATE.USED:
                this.used.active = true;
                break;
            case STATE.FREE:
                this.free.active = true;
                break;
        }
    }

    onClick(event): void {
        this.gameManager.playSound(SOUND.CLICK);
        if (this._state == STATE.USED)
            return;
        if (this._block) {
            return;
        }
        this._block = true;
        this.event["_this"] = this;
        this.event["idItem"] = this.getID();
        this.event["state"] = this._state;
        super.onClick(event);
    }

    update(): void {
        let pos = this.node.convertToNodeSpaceAR(this._view.position, this.node.position);
        if (pos.y < -2030 || pos.y > 46) {
            this.node.opacity = 0;
        }
        else {
            this.node.opacity = 255;
        }
    }
}
