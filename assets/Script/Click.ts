
const {ccclass, property} = cc._decorator;

export enum STATE {
    UNLOCK,
    CURRENT,
    LOCK
}
@ccclass
export default class Click extends cc.Component {

    @property(cc.SpriteFrame)
    unlock: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    current: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    lock: cc.SpriteFrame = null;

    @property(cc.Node)
    iconLock: cc.Node = null;

    private _sprite;
    private _clicked = false;
    private _view = null;

    onEnable(): void {
        this._sprite = this.node.getComponent(cc.Sprite);
        this._view = this.node.parent.parent;
    }

    setState(state: STATE): void {
        switch(state)
        {
            case STATE.UNLOCK:
                this._sprite.spriteFrame = this.unlock;
                this.iconLock.active = false;
                break;
            case STATE.CURRENT:
                this._sprite.spriteFrame = this.current;
                this.iconLock.active = false;
                break;
            case STATE.LOCK:
                this._sprite.spriteFrame = this.lock;
                this.iconLock.active = true;
                break;
        }
    }
    onClick(e): void {
        if (this._clicked) {
            return;
        }
        let event = new cc.Event.EventCustom("onclick", true);
        event["level"] = this.node.name;
        this.node.dispatchEvent(event);
    }

    update(): void {
        let pos = this.node.convertToNodeSpaceAR(this._view.position, this.node.position);
        if (pos.y < -2002 || pos.y > -28) {
            this.node.opacity = 0;
        }
        else {
            this.node.opacity = 255;
        }
    }
}
