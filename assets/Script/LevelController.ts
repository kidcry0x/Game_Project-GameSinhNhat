import Touch from "./Touch";
import {SOUND} from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelController extends cc.Component {

    @property({type: cc.Component.EventHandler})
    init: cc.Component.EventHandler[] = [];

    @property({type: cc.Component.EventHandler})
    complete: cc.Component.EventHandler[] = [];

    @property([sp.Skeleton])
    skeleton: sp.Skeleton[] = [];

    @property
    level = 0;

    @property(cc.Label)
    label: cc.Label = null;
    
    @property([cc.Node])
    inside: cc.Node[] = [];

    @property(cc.Node)
    block: cc.Node = null;

    @property(cc.Node)
    outside: cc.Node = null;

    @property(cc.Prefab)
    pen: cc.Prefab = null;

    private _valid = false;
    private _gameManager = null;
    private _circle = [];
    private _temp = [];

    private _hint = false;
    private _pen = null;

    onLoad(): void {
        this._gameManager = cc.find("Canvas/GameContainer").getComponent("GameManager");
        this.label.node.active = false;
    }
    onEnable(): void {
        this._gameManager._current = {
            level: this.level,
            node: this.node
        }
        this._gameManager.showUIInGame(true);
        this._gameManager.uiController.showEndGame(false);
        this._gameManager.setLevel(this.level);

        // this._hint = false;
        
        this.node.on("valid", this.onValid, this);
        this.node.on("draw_complete", this.onComplete.bind(this), this);
        this.node.on("draw_start", this.onStartDraw, this);

        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStartEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEndEvent, this);
        // this.reset();
        this.block.active = false;

        this._pen = this.node.getChildByName("Pen");
        if (!this._pen) {
            this._pen = cc.instantiate(this.pen);
            this.node.addChild(this._pen);
        }
        this._pen.active = false;
        this._pen.zIndex = cc.macro.MAX_ZINDEX;
    }

    start(): void {
        this._gameManager.preloadLevel(this.level);
    }
    
    touchStartEvent(e): void {
        this.node.getComponent("Mask").touchStartEvent(e);
    }
    
    touchMoveEvent(e): void {
        this.node.getComponent("Mask").touchMoveEvent(e);
    }

    touchEndEvent(e): void {
        this.node.getComponent("Mask").touchEndEvent(e);
    }

    onStartDraw(): void {
        // this._circle = [];
        this._temp = this.inside;
        if (this._pen) {
            this._pen.active = true;
        }
        else {
            this._pen.active = true;
        }
    }

    onValid(event): void {
        this._valid = event.valid;
    }

    onComplete(event): void {
        this._pen.active = false;
        if (this._hint) {
            this.inside.forEach(node => {
                node.opacity = 255;
            })
        }
        if (this._valid) {

            this.inside.forEach(node => {
                node.opacity = 0;
            });

            this.scheduleOnce(() => {
                this._gameManager.playSound(SOUND.WIN, false);
            }, 0.7);

            let component = this.complete[0]["_componentName"];
            let handler = this.complete[0].handler;
            let func = this.complete[0].target.getComponent(component)[handler];
            func(this.complete[0].target.getComponent(component));

            this._gameManager._block = true;
            this._circle.forEach(element => {
                element.opacity = 0;
            })

            this.block.active = true;
            this._gameManager.uiController.showUIInGame(false);

            this.showParticle();
        }
    }

    onFinish(e): void {
        e.node.getComponent("LevelController").block.active = true;
        let event = new cc.Event.EventCustom("onfinish", true);
        e.node.dispatchEvent(event);
    }

    reset(): void {
        this.inside.forEach(element => {
            element.opacity = 0;
        })
        this.block.active = false;
        this.node.getComponent("Mask").reset();
        let component = this.init[0]["_componentName"];
        let handler = this.init[0].handler;
        let func = this.init[0].target.getComponent(component)[handler];
        func(this.init[0].target.getComponent(component));
    }

    onHint(): void {
        this.inside.forEach(element => {
            element.opacity = 255;
        })
    }

    showParticle(): void {
        let particle = cc.instantiate(this._gameManager.star);
        let position = this.node.getComponent("Mask").ticketNode;
        particle.x = position.x;
        particle.y = position.y;
        particle.zIndex = cc.macro.MAX_ZINDEX;
        this.node.addChild(particle);
    }
}
