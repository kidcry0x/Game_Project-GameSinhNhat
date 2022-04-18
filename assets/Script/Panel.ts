import Data from "../Script/Data";
import { KEY } from "../Script/Data";
import { SOUND } from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Panel extends cc.Component {

    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Node)
    topButton: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    item: cc.Prefab = null;

    dataSetting = null;
    dataBag = null;
    size = null;
    gameManager = null;

    onLoad(): void {
        this.gameManager = cc.find("Canvas/GameContainer").getComponent("GameManager");
    }

    onEnable(): void {
        this.addEventListener();
        this.dataSetting = Data.getData(KEY.SETTING);
        this.onOpen();
    }

    onDisable(): void {
        this.removeEventListener();
    }
    addEventListener(): void {
        this.node.on("itemclick", this.onClickItem, this);
    }

    removeEventListener(): void {
        this.node.off("itemclick", this.onClickItem, this);
    }

    onClickItem(event): void {
    }

    getData(key: KEY): void {
        switch(key)
        {
            case KEY.SETTING:
                return this.dataSetting ? this.dataSetting : Data.getData(KEY.SETTING);
            case KEY.BAG:
                return this.dataBag ? this.dataBag : Data.getData(KEY.BAG);
        }
    }
    
    saveData(key: KEY, data): void {
        Data.saveData(key, data);
    }

    onClose(): void {
        this.gameManager.playSound(SOUND.CLICK, false);
        cc.tween(this.topButton).to(0.5, {y: 1200}, {easing: "backIn"}).start();
        cc.tween(this.container).to(0.5, {y: -2000}, {easing: "backIn"})
            .call(() => {
                this.node.active = false;
            }).start();
    }

    onOpen(): void {
        this.topButton.y = 1200;
        this.container.y = -2000;
        cc.tween(this.container).to(0.5, {y: 0}, {easing: "cubicIn"}).start();
        cc.tween(this.topButton).delay(0.3).to(0.5, {y: 850}, {easing: "cubicIn"}).start();
    }

    update(dt): void {
        this.size = cc.view.getCanvasSize();
        if (this.size.width == 375 && this.size.height == 812) {
            this.topButton.scale = 0.9;
            this.container.scale = 0.9;
        }
        else {
            this.topButton.scale = 1;
            this.container.scale = 1;
        }
    }
}
