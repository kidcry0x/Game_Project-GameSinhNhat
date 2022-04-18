const {ccclass, property} = cc._decorator;

enum ACTION {
    NONE,
    ACTIVE,
    ANIMATION,
}
@ccclass
export default class ActionController extends cc.Component {

    @property({type: cc.Enum(ACTION)})
    action: ACTION = ACTION.NONE;

    @property({type: sp.Skeleton, visible() {return this.action == ACTION.ANIMATION}})
    target: sp.Skeleton = null;

    @property({type: cc.Node, visible() {return this.action == ACTION.ACTIVE}})
    nameNode: cc.Node = null;

    @property({visible() {return this.action == ACTION.ACTIVE}})
    active: boolean = true;

    @property({visible() {return this.action == ACTION.ANIMATION}})
    nameAnim: string = "";

    @property({visible() {return this.action == ACTION.ANIMATION}})
    trackIndex = 0;

    @property({visible() {return this.action == ACTION.ANIMATION}})
    timeScale = 1;

    @property({visible() {return this.action == ACTION.ANIMATION}})
    loop = true;

    @property({visible() {return this.action == ACTION.ACTIVE || this.action == ACTION.NONE}})
    delay: number = 0;

    @property({type: [cc.Component.EventHandler]})
    callback: cc.Component.EventHandler[] = [];

    onAction(t): void {
        switch (t.action)
        {
            case ACTION.NONE:
                t.scheduleOnce(() => {
                    if (t.callback.length > 0) {
                        t.runCallback(t);
                    }
                }, t.delay);
                break;
            case ACTION.ACTIVE:
                t.scheduleOnce(() => {
                    t.nameNode.active = t.active;
                    if (t.callback.length > 0) {
                        t.runCallback(t);
                    }
                }, t.delay);
                break;
            case ACTION.ANIMATION:
                t.target.timeScale = t.timeScale;
                t.target.setAnimation(t.trackIndex, t.nameAnim, t.loop);
                if (t.callback.length > 0) {
                    t.target.setCompleteListener(track => {
                        if (track.animation.name == t.nameAnim) {
                            t.target.setCompleteListener(null);
                            t.runCallback(t);
                        }
                    })
                }
                break;
        }
    }

    runCallback(t): void {
        let length = t.callback.length;
        for (let i = 0; i < length; ++i)
        {
            let component = t.callback[i]._componentName;
            let handler = t.callback[i].handler;
            let func = t.callback[i].target.getComponent(component)[handler];
            func(t.callback[i].target.getComponent(component));
        }
    }
}
