import { SOUND } from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Item extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    gameManager = null;

    idItem = null;
    event = null;

    start(): void {
        this.event = new cc.Event.EventCustom("itemclick", true);
        this.gameManager = cc.find("Canvas/GameContainer").getComponent("GameManager");
    }

    setID(id: number): void {
        this.idItem = id;
    }

    getID(): number {
        return this.idItem;
    }

    onClick(e): void {
        this.target ? this.target.dispatchEvent(this.event) : this.node.dispatchEvent(this.event);
    }

    update(): void {
        if (this.node.y > -170 || this.node.y < -1600) {
            this.node.opacity = 0;
        }
        else {
            this.node.opacity = 255;
        }
    }
}
