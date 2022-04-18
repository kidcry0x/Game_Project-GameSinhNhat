const {ccclass, property} = cc._decorator;

@ccclass
export default class Hand extends cc.Component {

    @property
    level: number = 0;

    onEnable(): void {
        this.node.zIndex = cc.macro.MAX_ZINDEX;
        this.node.opacity = 0;
        switch(this.level)
        {
            case 1:
                this.guideLevel1();
                break;
            case 2:
                this.guideLevel2();
                break;
        }
    }

    guideLevel1(): void {
        this.node.position = cc.v3(-7.565, 128.526);
        cc.tween(this.node).repeatForever(

                cc.tween().parallel(
                    cc.tween().to(0.5, {opacity: 255}),
                    cc.tween().to(0.5, {position: cc.v2(209.486, 101.395)}, {easing: "sineInOut"})
                )
                .delay(0.3)
                .to(0.5, {position: cc.v2(-7.565, 47.132)}, {easing: "sineInOut"})
                .delay(0.3)
                .to(0.5, {position: cc.v2(189.891, 20.001)}, {easing: "sineInOut"})
                .delay(0.3)
                .to(0.5, {position: cc.v2(22.581, -31.247)}, {easing: "sineInOut"})
                .parallel(
                        cc.tween().to(0.7, {opacity: 0}),
                        cc.tween().to(0.7, {scale: 1.2})
                )
                .to(0.5, {position: cc.v2(-7.565, 128)}, {easing: "sineInOut"})
                .delay(0.5)

            ).start();
    }

    guideLevel2(): void {
        this.node.position = cc.v3(250, -780);
        this.node.angle = 50;
        this.node.opacity = 255;
        cc.tween(this.node).repeatForever(
            cc.tween().to(0.5, {position: cc.v3(135, -685)}, {easing: "sineInOut"}).to(0.5, {position: cc.v3(250, -780)}, {easing: "sineInOut"})
        ).start();
    }
}
