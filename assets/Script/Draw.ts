
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.CircleCollider)
    touch: cc.CircleCollider = null;

    private _graphic;
    private _pos;
    private _valid = false;
    private _data = null;
    private _touch = null;

    onEnable(): void {
        this.node.on("touchstart", this.onTouchStart, this);
        this.node.on("touchmove", this.onTouchMove, this);
        this.node.on("touchend", this.onTouchEnd, this);
        this._touch = this.node.parent.getComponent("LevelController").touch;
    }

    start () {
        this._graphic = this.node.getComponent(cc.Graphics);
    }

    onTouchStart(event): void {
        this._touch.onTouchStart();
        this._pos = this.node.convertToNodeSpaceAR(event.getLocation());
        let pen = this.node.parent.getChildByName("Pen");
        pen.position = this._pos;
        this.touch.node.position = this._pos;
        let e = new cc.Event.EventCustom("draw_start", true);
        this.node.dispatchEvent(e);
    }

    onTouchMove(event): void {
        let pen = this.node.parent.getChildByName("Pen");
        this._pos = this.node.convertToNodeSpaceAR(event.getLocation());
        pen.position = this._pos;
        this.touch.node.position = this._pos;
        this._graphic.lineTo(this._pos.x, this._pos.y);
        this._graphic.stroke();
        this._graphic.moveTo(this._pos.x, this._pos.y);
    }

    onTouchEnd(): void {
        this._touch.onTouchEnd();
        let event = new cc.Event.EventCustom("draw_complete", true);
        this.node.dispatchEvent(event);
        this._graphic.clear();
    }
}
