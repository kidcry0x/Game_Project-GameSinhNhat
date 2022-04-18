const {ccclass, property} = cc._decorator;

enum Transition {
    NONE,
    SCROLL
}

@ccclass
export default class Button extends cc.Component {

    @property(cc.Node)
    on: cc.Node = null;

    @property(cc.Node)
    off: cc.Node = null;
    
    @property
    buttonName: string = "";

    private _state = true;

    onEnable(): void {
        this.node.on("touchend", this.onTouchEnd, this);
        // this.off.on("touchstart", this.onTouchStart, this);
    }

    setState(on: boolean): void {
        if (on) {
            this.on.opacity = 255;
            this.off.opacity = 0;
        }
        else {
            this.on.opacity = 0;
            this.off.opacity = 255;
        }
    }

    onTouchEnd(event): void {
        this._state = !this._state;
        this.setState(this._state);
        let e = new cc.Event.EventCustom("change_setting", true);
        e["state"] = this._state;
        e["nameTarget"] = this.buttonName;
        this.node.dispatchEvent(e);
    }

}
