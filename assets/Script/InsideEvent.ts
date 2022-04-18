

const {ccclass, property} = cc._decorator;

@ccclass
export default class InsideEvent extends cc.Component {

    onCollisionEnter(other, self): void {
        this.node.opacity = 0;
    }
}
