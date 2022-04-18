import {SOUND} from "./GameManager";

const { ccclass, property } = cc._decorator;
const CALC_RECT_WIDTH = 40;
const CLEAR_LINE_WIDTH = 85;

@ccclass
export default class Scratch_ticket extends cc.Component {
    @property(cc.Node)
    maskNode: cc.Node = null;

    @property(cc.Node)
    ticketNode: cc.Node = null;

    @property(sp.Skeleton)
    anim: sp.Skeleton = null;

    @property(cc.Sprite)
    pic: cc.Sprite = null;

    @property(cc.Node)
    block: cc.Node = null;

    @property(cc.Sprite)
    hand: cc.Sprite = null;

    private _gameManager = null;
    private _hint = false;
    calcDebugger: boolean = false;
    tempDrawPoints: cc.Vec2[] = [];
    polygonPointsList: { rect: cc.Rect; isHit: boolean }[] = [];

    onLoad() {
        this._gameManager = cc.find("Canvas/GameContainer").getComponent("GameManager");
        this.pic.node.active = true;
        this.hand.node.active = true;
        this.anim.setAnimation(0, "idle", true);
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStartEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEndEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEndEvent, this);
    }

    onEnable() {
        this.hand.node.active = true;
        this.block.active = false;
        this.pic.node.active = true;
        this.anim.setAnimation(0, "idle", true);
        this.reset();
    }

    onDisable(): void {
        this.beforeDestroy();
    }

    beforeDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchStartEvent, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEndEvent, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchEndEvent, this);
    }

    touchStartEvent(event) {
        let point = this.ticketNode.convertToNodeSpaceAR(event.getLocation());
        this.clearMask(point);
        this.pic.node.opacity = 255;
        cc.Tween.stopAllByTarget(this.pic.node)
        this._gameManager.playSound(SOUND.DRAW, true);
        let e = new cc.Event.EventCustom("draw_start", true);
        this.node.dispatchEvent(e);

        let pen = this.node.getChildByName("Pen");
        pen.position = this.node.convertToNodeSpaceAR(event.getLocation());
    }

    touchMoveEvent(event) {
        let point = this.ticketNode.convertToNodeSpaceAR(event.getLocation());
        this.clearMask(point);
        let pen = this.node.getChildByName("Pen");
        pen.position = this.node.convertToNodeSpaceAR(event.getLocation());

    }

    touchEndEvent() {
        this.tempDrawPoints = [];
        let event = new cc.Event.EventCustom("draw_complete", true);
        this.node.dispatchEvent(event);
        this.calcProgress();
        cc.audioEngine.stopAllEffects();
    }

    clearMask(pos) {
        let mask: any = this.maskNode.getComponent(cc.Mask);
        let stencil = mask._graphics;
        const len = this.tempDrawPoints.length;
        this.tempDrawPoints.push(pos);

        if (len <= 1) {

            stencil.circle(pos.x, pos.y, CLEAR_LINE_WIDTH / 2);
            stencil.fill();

        this.polygonPointsList.forEach((item) => {
            if (item.isHit) return;
            const xFlag = pos.x > item.rect.x && pos.x < item.rect.x + item.rect.width;
            const yFlag = pos.y > item.rect.y && pos.y < item.rect.y + item.rect.height;
            if (xFlag && yFlag) item.isHit = true;
        });
        } else {

            let prevPos = this.tempDrawPoints[len - 2];
            let curPos = this.tempDrawPoints[len - 1];

            stencil.moveTo(prevPos.x, prevPos.y);
            stencil.lineTo(curPos.x, curPos.y);
            stencil.lineWidth = CLEAR_LINE_WIDTH;
            stencil.lineCap = cc.Graphics.LineCap.ROUND;
            stencil.lineJoin = cc.Graphics.LineJoin.ROUND;
            stencil.strokeColor = cc.color(255, 255, 255, 255);
            stencil.stroke();

        this.polygonPointsList.forEach((item) => {
            item.isHit = item.isHit || cc.Intersection.lineRect(prevPos, curPos, item.rect);
        });
        }
    }

    calcProgress() {
        let hitItemCount = 0;
        let ctx = this.ticketNode.getComponent(cc.Graphics);
        this.polygonPointsList.forEach((item) => {
        if (!item.isHit) return;
        hitItemCount += 1;
    
        if (!this.calcDebugger) return;
        ctx.rect(item.rect.x, item.rect.y, item.rect.width, item.rect.height);
        ctx.fillColor = cc.color(216, 18, 18, 255);
        ctx.fill();
        });

        // console.log(this.polygonPointsList)
        // console.log(hitItemCount)

        if(this.polygonPointsList.length * 0.6 <= hitItemCount) {
            this.hand.node.active = false; 
            this.pic.node.active = false;
            this.onComplete();
            this.node.getComponent("LevelController").showParticle();
            // cc.tween(this.node).delay(0.001).call(() => {
            //     this._gameManager.playSound(SOUND.CORRECT1, false)
            // }).start()
        }
        else {
            // cc.tween(this.node).delay(0.001).call(() => {
            //     this._gameManager.playSound(SOUND.FALSE, false)
            // }).start()
            this.reset();
        }

    }

    onComplete() {

        this.block.active = true;
        this.anim.setAnimation(0, "finish", true)
        cc.tween(this.node).delay(2)
        .call(() => {
            this.onFinish();
        }).start()
        this._gameManager.uiController.showUIInGame(false);
    }

    onFinish(): void {
        this.node.getComponent("LevelController").block.active = true;
        let event = new cc.Event.EventCustom("onfinish", true);
        this.node.dispatchEvent(event);
    }

    reset() {
        cc.Tween.stopAllByTarget(this.pic.node)

        this.pic.node.opacity = 255;
        this.block.active = false;
        this.pic.node.active = true;
        this.hand.node.active = true;
        this.anim.setAnimation(0, "idle", true);
        let mask: any = this.maskNode.getComponent(cc.Mask);
        mask._graphics.clear();
    
        this.tempDrawPoints = [];
        this.polygonPointsList = [];

        this.ticketNode.getComponent(cc.Graphics).clear();
    
        for (let x = 0; x < this.ticketNode.width; x += CALC_RECT_WIDTH) {
            for (let y = 0; y < this.ticketNode.height; y += CALC_RECT_WIDTH) {
                this.polygonPointsList.push({
                rect: cc.rect(x - this.ticketNode.width / 2, y - this.ticketNode.height / 2, CALC_RECT_WIDTH, CALC_RECT_WIDTH),
                isHit: false
                });
            }
        }
    }

    onHint(): void {
        cc.tween(this.pic.node).repeatForever(
            cc.tween().to(0.7, {opacity: 100}, {easing: "sineInOut"})
            .to(0.7, {opacity: 255}, {easing: "sineInOut"})
        ).start()
    }

}
