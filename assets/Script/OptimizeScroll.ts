const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    view: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    update(dt): void {
        var viewRect = cc.rect(- this.view.width / 2, - this.content.y - this.view.height / 2, this.view.width, this.view.height);
    　　for (let i = 0; i < this.content.children.length; i++) {
    　　　　const node = this.content.children[i];
    　　　　if (viewRect.intersects(node.getBoundingBox())) {
    　　　　　　node.opacity = 255;
    　　　　}
    　　　　else {
    　　　　　　node.opacity = 0;
    　　　　}
    　　}
    }
}
