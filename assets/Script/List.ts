import Panel from "../Script/Panel";
import { KEY } from "../Script/Data";
import { TOTAL_LEVEL } from "../Script/GameManager";
import Data from "../Script/Data";
import { STATE } from "./Click";

const {ccclass, property} = cc._decorator;

@ccclass
export default class List extends Panel {

    @property([cc.SpriteAtlas])
    icon: cc.SpriteAtlas[] = [];
    private _size = null;
    private _data = null;
    private _current = null;
    private _view = null;

    onLoad(): void {
        super.onLoad();
        this.topButton.y = 1200;
        this.container.y = -2000;
        this.initList();
    }

    onEnable(): void {
        super.onEnable();
        if (this.gameManager._current.level) {
            this._data = Data.getData(KEY.SETTING);
            this.node.on("onclick", this.onClick, this);
            cc.tween(this.topButton).delay(0.3).to(0.5, {y: 850}, {easing: "cubicIn"}).start();
            this.setState();
            this._view = this.container.getChildByName("view");
            this.scrollToCurrent();
        }
        else {
            this.node.active = false;
        }
    }

    onClick(event): void {
        if (event.level != this._current.node.name) {
            this.gameManager.activeLevel(event.level);
            //Off node hiện tại
            this._current.setState(STATE.UNLOCK);
            //Gán node mới
            this._current = event.target.getComponent("Click");
            // Active node mới
            this._current.setState(STATE.CURRENT);
        }
        this.onClose();
    }

    initList(): void {
        this.content.removeAllChildren(true);
        let pool = this.gameManager._itemPool;
        for (let i = 0; i < TOTAL_LEVEL; ++i)
        {
            let item = null;
            if (pool.size() > 0) {
                item = pool.get();
            }
            else {
                item = cc.instantiate(this.item);
            }
            item.name = (i + 1).toString();
            this.content.addChild(item);
        }
    }

    onClickSetting(event): void {
        this.gameManager.onClickSetting(event);
    }

    setState(): void {
        let atlas = null;
        for (let i = 0; i < this._data.unlock + 1; ++i)
        {
            let item = this.content.children[i];
            item.getChildByName("number").active = false;
            let script = item.getComponent("Click");
            script._clicked = false;
            script.setState(STATE.UNLOCK);
            if (i < 6) {
                atlas = this.icon[0];
            }
            else if (i <= 10 ) {
                atlas = this.icon[1];
            }
            let arr = [11];
            if (arr.includes(i)) {
                item.getChildByName("content").scale = 0.4;
            }
            else {
                item.getChildByName("content").scale = 0.3; 
            }
            item.getChildByName("content").active = true;
            item.getChildByName("content").getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(i + 1);
        }
        this._current = this.content.children[this.gameManager._current.level - 1].getComponent("Click");
        this._current._clicked = false;
        this._current.setState(STATE.CURRENT);
        for (let i = this._data.unlock + 1; i < TOTAL_LEVEL; ++i)
        {
            let item = this.content.children[i];
            item.getChildByName("number").active = true;
            item.getChildByName("number").getComponent(cc.Label).string = i + 1;
            item.getChildByName("content").active = false;
            let script = item.getComponent("Click");
            script._clicked = true;
            script.setState(STATE.LOCK);
        }
    }

    onClose(): void {
        cc.tween(this.topButton).to(0.5, {y: 1200}, {easing: "backIn"}).start();
        cc.tween(this.container).to(0.5, {y: -2000}, {easing: "backIn"})
            .call(() => {
                this.node.active = false;
            }).start();
    }

    scrollToCurrent(): void {
        let index = this.content.children.indexOf(this._current.node);
        let length = this.content.children.length;
        let percent = 1 - index / length;
        this.container.getComponent(cc.ScrollView).scrollToPercentVertical(percent + 1 / (TOTAL_LEVEL / 5), 0.5);
        console.log(percent);
    }
}
