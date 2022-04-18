const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.SpriteAtlas)
    pencils: cc.SpriteAtlas = null;

    private _gameManager = null;

    onLoad(): void {
        this._gameManager = cc.find("Canvas/GameContainer").getComponent("GameManager");
    }
    onEnable(): void {
        this.node.angle = 0;
        cc.tween(this.node).repeatForever(
                cc.tween().by(0.3, {angle: -5}).by(0.3, {angle: 5})
            ).start();
        let index = this._gameManager.dataBag.pencil;
        this.node.getComponent(cc.Sprite).spriteFrame = this.pencils.getSpriteFrame((index + 1));
        this.node.scale = 0.7;
    }

    onDisable(): void {
        cc.Tween.stopAllByTarget(this.node);
    }
}
