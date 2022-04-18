import EffectManager from "./EffectManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    endGame: cc.Node = null;

    @property(cc.Node)
    inGame: cc.Node = null;

    @property(cc.Node)
    home: cc.Node = null;

    @property(cc.Node)
    pencil: cc.Node = null;

    onEnable(): void {
        this.inGame.getChildByName("Hint").y = -1200;
        this.home.y = 300;
        this.endGame.getChildByName("Replay").x = -800;
        this.pencil.x = 800;
        this.pencil.opacity = 0;
        this.endGame.children.forEach(children => {
            children.opacity = 0;
        });
        this.endGame.getChildByName("Next").y = -1200;
        this.endGame.getChildByName("Share").y = -1200;
        this.endGame.getChildByName("Invite").y = -1200;
    }

    start(): void {
        this.endGame.active  = true;
        EffectManager.scaleForever(this.inGame.getChildByName("Hint"), 0.95, 1.05, 0.5);
        // EffectManager.effectSkew(this.pencil, 5, 0.5);
        cc.tween(this.pencil).repeatForever(
            cc.tween().to(0.5, {scale: 0.5}, {easing: "quadIn"})
                .to(0.5, {scale: 0.6}, {easing: "quadOut"})
                .delay(0.1)
                .to(0.07, {angle: 8})
                .to(0.14, {angle: -8}, {easing: "quadInOut"})
                .to(0.1, {angle: 6}, {easing: "quadInOut"})
                .to(0.06, {angle: 0})
        ).start();
        this.scheduleOnce(() => {
            this.pencil.x = this.node.width / 2 - 100;
            this.pencil.opacity = 255;
        }, 0.1);
        cc.tween(this.pencil).to(0, {x: this.node.width / 2 - 100}).to(0.2, {opacity: 255}).start();;
    }

    showEndGame(isShow: Boolean): void {
        let time = 0.5;
        let replay = this.endGame.getChildByName("Replay");
        let next = this.endGame.getChildByName("Next");
        const share = this.endGame.getChildByName("Share")
        const invite = this.endGame.getChildByName("Invite")
        let x = - (this.node.width / 2) + 150;
        cc.Tween.stopAllByTarget(replay);
        cc.Tween.stopAllByTarget(next);
        if (isShow) {
            cc.tween(replay).parallel(
                cc.tween().to(time, {opacity: 255}),
                cc.tween().to(time, {x: x}, {easing: "cubicOut"})
            ).start();
            cc.tween(next).parallel(
                cc.tween().to(time, {opacity: 255}),
                cc.tween().to(time, {y: -645}, {easing: "cubicOut"})
            ).start();
            cc.tween(share).parallel(
                cc.tween().to(time, {opacity: 255}),
                cc.tween().to(time, {y: -645}, {easing: "cubicOut"})
            ).start();
            cc.tween(invite).parallel(
                cc.tween().to(time, {opacity: 255}),
                cc.tween().to(time, {y: -645}, {easing: "cubicOut"})
            ).start();
        }
        else {
            cc.tween(replay).parallel(
                cc.tween().to(0.1, {opacity: 0}),
                cc.tween().to(0.1, {x: -800})
            ).start();
            cc.tween(next).parallel(
                cc.tween().to(0.1, {opacity: 0}),
                cc.tween().to(0.1, {y: -1200})
            ).start();
            cc.tween(share).parallel(
                cc.tween().to(0.1, {opacity: 0}),
                cc.tween().to(0.1, {y: -1200})
            ).start();
            cc.tween(invite).parallel(
                cc.tween().to(0.1, {opacity: 0}),
                cc.tween().to(0.1, {y: -1200})
            ).start();
        }
    }

    showInGame(show: boolean): void {
        this.inGame.active = show;
    }

    showHome(show: boolean): void {
        this.home.active = show;
    }

    showUIInGame(isShow: Boolean): void {
        let time = 0.5;
        let x = (this.node.width / 2) - 100;
        let y =  - (this.node.height / 2) + 215;
        let hint = this.inGame.getChildByName("Hint");
        if (isShow) {
            hint.opacity = 255;
            cc.tween(this.home).parallel(
                    cc.tween().to(time, {opacity: 255}),
                    cc.tween().to(time, {y: 0}, {easing: "cubicOut"})
                ).start();
            cc.tween(hint).to(time, {y: -630}, {easing: "cubicOut"}).start();
            cc.tween(this.pencil).to(0, {x: x}).to(0.2, {opacity: 255}).start();
        }
        else {
            cc.tween(this.home).parallel(
                cc.tween().to(time, {opacity: 0}),
                cc.tween().to(time, {y: 300}, {easing: "cubicOut"})
            ).start();
            cc.tween(hint).to(time, {y: -1200}, {easing: "cubicOut"}).start();
            cc.tween(this.pencil).to(time, {x: 800}).start();
        }
    }

    setLevel(level: number): void {
        this.home.getChildByName("Text").getComponent(cc.Label).string = "LEVEL " + level;
    }
    
}
