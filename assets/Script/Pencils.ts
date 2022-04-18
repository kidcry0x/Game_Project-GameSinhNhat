import Panel from "./Panel";
import Data, { KEY } from "./Data";
import { STATE } from "./ItemPencil";
import AdsManager from "./AdsManager";

const {ccclass, property} = cc._decorator;
const TOTAL_ITEM = 15;

@ccclass
export default class Pencils extends Panel {

    @property([cc.SpriteFrame])
    icon: cc.SpriteFrame[] = [];

    private _bag = null;

    onEnable(): void {
        super.onEnable();
        this._bag = this.getData(KEY.BAG);
        this.initItem();
    }

    onClickItem(event): void {
        let state = event.state;
        let index = event.idItem;
        let node = event.target;
        // true là đã mở khóa -> xử lý use/used
        // false là chưa mở khóa -> mở khóa
        if (this._bag.pencils[index]) {
            if (state == STATE.USE) {
                this.content.children[this._bag.pencil].getComponent("ItemPencil").setState(STATE.USE);
                node.getComponent("ItemPencil").setState(STATE.USED);
                this._bag.pencil = index;
            }
        }
        else {
            //Show quang cao
            AdsManager.getInstance().showRewardedAds(err => {
                //Bật lại nhạc nền dù người chơi có xem hết quảng cáo hay không
                if (this.gameManager.dataSetting.isMusic) {
                    cc.audioEngine.resumeMusic();
                }
                //Bỏ block để player có thể chọn lại cái bút đó
                event._this._block = false;
                
                if (err) {
                    console.error(err);
                    return;
                }
                node.getComponent("ItemPencil").setState(STATE.USE);
                this._bag.pencils[index] = true;
            });
        }
        this.gameManager.dataBag = this._bag;
        Data.saveData(KEY.BAG, this._bag);
    }

    initItem(): void {
        if (this.content.children.length == TOTAL_ITEM)
            return;
        for (let i = 0; i < TOTAL_ITEM; ++i)
        {
            let item = cc.instantiate(this.item);
            item.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.icon[i];
            item.getComponent("ItemPencil").setID(i);
            let state = this._bag.pencils[i] ? STATE.USE : STATE.FREE;
            if (this._bag.pencil == i) {
                state = STATE.USED;
            }
            item.getComponent("ItemPencil").setState(state);
            this.content.addChild(item);
        }
    }
}
