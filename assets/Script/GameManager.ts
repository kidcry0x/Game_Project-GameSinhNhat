import UIController from "./UIController";
import BundleManager from "./BundleManager";
import Data from "./Data";
import { KEY } from "./Data";
import AdsManager from "./AdsManager";
import Loading from "./Loading";
import FBInstantManager from "./FBInstantManager";
import Pencils from "./Pencils";


const {ccclass, property} = cc._decorator;
const VERSION = '1.0.5'

export enum GROUP {
    DEFAULT,
    INSIDE,
    OUTSIDE,
    TOUCH
}

export const TOTAL_LEVEL = 10;

export enum SOUND {
    BG,
    CLICK,
    DRAW,
    CORRECT,
    CORRECT1,
    CORRECT2,
    WIN,
    FALSE
}

@ccclass
export default class GameManager extends cc.Component {

    @property({type: UIController})
    uiController: UIController = null;

    @property(cc.Prefab)
    setting: cc.Prefab = null;

    @property([cc.AudioClip])
    sounds: cc.AudioClip[] = [];

    @property(Loading)
    loading: Loading = null;

    @property(cc.Prefab)
    star: cc.Prefab = null;
    
    @property([cc.Prefab])
    guide: cc.Prefab[] = [];

    @property(cc.Prefab)
    item: cc.Prefab = null;

    private _current = {
        level: null,
        node: null
    };

    private _bundle;
    private dataSetting = null;
    private dataBag = null;
    private _block = false;
    private _loadLevel = null;
    private _itemPool = null;
    private _list = null;
    private _pencil = null;

    onLoad(): void {
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        this._bundle = BundleManager.getInstance();
        this.dataSetting = Data.getData(KEY.SETTING);
        this.dataBag = Data.getData(KEY.BAG);
        this._loadLevel = this.dataSetting.unlock + 3;
        console.log('GAME VERSION: ', VERSION)
        this.loading.node.active = false;
        this.loading.node.zIndex = cc.macro.MAX_ZINDEX;
    }

    onEnable(): void {
        this.node.on("onfinish", this.onFinish, this);

        // add user for sending message
        this.askSubcribeBot()
    }

    onFinish(): void {
        let data = this.dataSetting;

        if (data.unlock == 0) {
            let guide = this._current.node.getChildByName("Guide");
            guide && guide.destroy();
        }

        if (this._current.level == data.unlock + 1 && data.unlock + 1 < TOTAL_LEVEL) {
            ++this.dataSetting.unlock;
        }

        Data.saveData(KEY.SETTING, data);

        this.uiController.showEndGame(true);
        this.uiController.showInGame(false);
        this.uiController.showHome(false);
    }

    start(): void {

        this._itemPool = new cc.NodePool();
        for (let i = 0; i < TOTAL_LEVEL; ++i) {
            let item = cc.instantiate(this.item);
            this._itemPool.put(item);
        }

        let data = this.dataSetting;

        if (this.dataSetting.isMusic)
            this.playBG();

        if (data.unlock == 0) {
            this.showGuide(data);
            this.showHint();
            return;
        }
        else if (data.unlock == 1) {
            this.showGuide(data);
            return;
        }

        let level = data.unlock + 1 >= TOTAL_LEVEL ? TOTAL_LEVEL - 1 : data.unlock;

        this._bundle.getPrefabByName("Level" + (level + 1), null, (err, prefab) => {
            if (err) {
                console.error(err);
            }
            else {
                let level = cc.instantiate(prefab);
                this.node.addChild(level);
            }
        });

        this.uiController.showHome(true);
        this.uiController.showInGame(true);

    }

    onNextLevel(event): void {
        this.playSound(SOUND.CLICK, false);
        if (event.target.name == "Skip") {
            
            if (this.dataSetting.unlock < 2) {
                return;
            }

            AdsManager.getInstance().showRewardedAds(err => {
                if (this.dataSetting.isMusic)
                    cc.audioEngine.resumeMusic();
                    
                if (err) {
                    console.error(err);
                    if (err.code != "ADS_NOT_LOADED")
                        return;
                }
                else {
                    if (this.dataSetting.unlock > 1) {
                        let level1 = this.node.getChildByName("Level1");
                        level1 && level1.destroy();
                        let level2 = this.node.getChildByName("Level2");
                        level2 && level2.destroy();
                    }
                    
                    if (this.dataSetting.unlock < TOTAL_LEVEL - 1) {
                        this.nextLevel(event);
                    }
                }
            });
        }
        else {
            
            if (this.dataSetting.unlock < 2) {
                this._current.node.active = false;
                this.uiController.showEndGame(false);
                this.uiController.showInGame(true);
                this.uiController.showHome(true);
                this.showGuide(this.dataSetting);
                this._block = false;
                return;
            }
            
            //Destroy 2 level hướng dẫn
            if (this.dataSetting.unlock > 1) {
                let level1 = this.node.getChildByName("Level1");
                level1 && level1.destroy();
                let level2 = this.node.getChildByName("Level2");
                level2 && level2.destroy();
            }

            //Từ level 4 trở đi mới hiển thị quảng cáo
            if (this.dataSetting.unlock < 4) {
                AdsManager.getInstance().showInterestialAds(e => {
                    if (e) {
                        console.error(e.message);
                    }
                    this.nextLevel(event);
                });
            }
            else {
                this.nextLevel(event);
            }
        }
    }

    nextLevel(event): void {
        if (this._current.level == TOTAL_LEVEL) {
            return;
        }

        //Ẩn node hiện tại
        this._current.node.active = false;

        //Kiểm tra node đó đã tạo hay chưa, tạo rồi thì active
        let next = this.node.getChildByName("Level" + (this._current.level + 1));

        if (next) {
            this._block = false;
            next.active = true;
            this.uiController.showEndGame(false);
            this.uiController.showInGame(true);
            this.uiController.showHome(true);
            return;
        }

        //Kiểm tra level đã unlock hay chưa, chưa unlock thì +1 rồi unlock
        let level;
        if (this._current.level == this.dataSetting.unlock + 1) {
            level = ++this.dataSetting.unlock;
            ++level;
        }
        else {
            level = this._current.level + 1;
        }

        //Kiểm tra người chơi click Skip thì phải update lại level unlock
        if (event.target.name == "Skip") {
            Data.saveData(KEY.SETTING, this.dataSetting);
        }

        this._bundle.getPrefabByName("Level" + level, (finish, total) => {
                this.loading.node.active = true;
                this.loading.updateProgress(finish / total);
            }, (err, prefab) => {
                if (err) {
                    console.error(err);
                }
                else {
                    let level = cc.instantiate(prefab);
                    this.loading.node.active = false;
                    this.node.addChild(level);
                    this._block = false;
                    this.uiController.showEndGame(false);
                    this.uiController.showInGame(true);
                    this.uiController.showHome(true);
                    this.preloadLevel(this.dataSetting.unlock + 1);
                }
        });
    }

    preloadLevel(current: number): void {
        this._bundle.getPrefabByName("Level" + (current + 1));
    }

    onReplay(): void {
        this.playSound(SOUND.CLICK, false);
        AdsManager.getInstance().showInterestialAds(e => {
            this._current.node.getComponent("LevelController").reset();
            this._current.node.getComponent("LevelController")._hint = false;
            this.uiController.showEndGame(false);
            this.uiController.showInGame(true);
            this.uiController.showHome(true);
            this._block = false;
            this.showUIInGame(true);
        });
    }

    activeLevel(level): void {
        
        this.preloadLevel(level);

        let lv = "Level" + level;
        for (let l of this.node.children)
        {
            if (l.name == lv) {
                this._current.node.active = false;
                l.active = true;
                this.uiController.showEndGame(false);
                this.uiController.showHome(true);
                this.uiController.showInGame(true);
                return;
            }
        }

        this._bundle.getPrefabByName(lv, (finish, total) => {
                this.loading.node.active = true;
                this.loading.updateProgress(finish / total);
            },(err, prefab) => {
                if (err) {
                    console.error(err);
                }
                else {
                    this.loading.node.active = false;
                    this._current.node.active = false;
                    let level = cc.instantiate(prefab);
                    this.node.addChild(level);
                    this.uiController.showEndGame(false);
                    this.uiController.showHome(true);
                    this.uiController.showInGame(true);
                }
            }
        );
    }

    onClickList(): void {
        this.playSound(SOUND.CLICK, false);
        if (this.dataSetting.unlock < 2) {
            return;
        }

        if (this._list) {
            this._list.active = true;
            this._list.zIndex = cc.macro.MAX_ZINDEX;
            return;
        }
        let percent = 0;
        this.loading.node.active = true;
        cc.resources.preload("List/Level",
            cc.Prefab,
            (finish, total) => {
                if (percent <= finish / total)
                    percent = finish / total;
                this.loading.updateProgress(percent);
            },
            (err) => {

            if (!err)
            console.time("x");
            cc.resources.load("List/Level", (err, prefab) => {
                if (!err) {
                    console.timeEnd("x");
                    this._list = cc.instantiate(prefab);
                    this._list.zIndex = cc.macro.MAX_ZINDEX;
                    cc.find("Canvas").addChild(this._list);
                    this.loading.node.active = false;
                }
            })
        })

    }

    onShowHint(event): void {
        this.playSound(SOUND.CLICK, false);
        if (this.dataSetting.unlock < 1) {
            return;
        }
        else if (this.dataSetting.unlock == 1) {
            if (!this._block) {
                this.showHint(event);
                let guide = this._current.node.getChildByName("Guide")
                guide && guide.destroy();
            }
            return;
        }
        AdsManager.getInstance().showRewardedAds(err => {
            if (err) {
                console.error(err);
                if (err.code != "ADS_NOT_LOADED")
                    return;
            }
            if (this.dataSetting.isMusic)
                    cc.audioEngine.resumeMusic();

            if (!this._block) {
                this.showHint(event);
            }
        });
    }

    showHint(event?: cc.Event): void {
        event && (event.target.opacity = 200);
        // this._current.node.getComponent("Mask").onHint();
        // this._current.node.getComponent("Mask")._hint = true;
    }

    onClickPencil(): void {
        this.playSound(SOUND.CLICK, false);
        if (this._pencil) {
            this._pencil.active = true;
            this._pencil.zIndex = cc.macro.MAX_ZINDEX;
            return;
        }
        let percent = 0;
        this.loading.node.active = true;
        cc.resources.preload("Pencils/Pencils",
            cc.Prefab,
            (finish, total) => {
                if (percent < finish / total)
                    percent = finish / total;
                this.loading.updateProgress(percent);
            },
            (err) => {
                if (!err) {
                    cc.resources.load("Pencils/Pencils", cc.Prefab, (err ,prefab) => {
                        if (!err) {
                            this._pencil = cc.instantiate(prefab);
                            this._pencil.zIndex = cc.macro.MAX_ZINDEX;
                            cc.find("Canvas").addChild(this._pencil);
                            this.loading.node.active = false;
                        }
                    })
                }
            })
    }

    onClickSetting(): void {
        this.playSound(SOUND.CLICK, false);
        let setting = cc.find("Canvas/Setting");
        if (setting) {
            setting.active = true;
        }
        else {
            setting = cc.instantiate(this.setting);
            cc.find("Canvas").addChild(setting);
        }
        cc.find("Canvas/Level").getComponent("List").onClose();
    }

    playBG(): void {
        cc.audioEngine.playMusic(this.sounds[SOUND.BG], true);
    }

    playSound(sound: SOUND, loop: boolean = null): number {
        if (this.dataSetting.isSound)
            return cc.audioEngine.playEffect(this.sounds[sound], loop);
        return -1;
    }

    showUIInGame(isShow: Boolean): void {
        this.uiController.showUIInGame(isShow);
    }

    setLevel(level: number): void {
        this.uiController.setLevel(level);
    }

    showGuide(data: Data): void {
        let node;
        switch (data["unlock"])
        {
            case 0:
                node = cc.instantiate(this.guide[0]);
                this.node.addChild(node);
                break;

            case 1:
                node = cc.instantiate(this.guide[1]);
                this.node.addChild(node);
                break;
        }
    }
    
    onShare(e=null) {
        FBInstantManager.getInstance().shareGame()
    }

    onInvite(e=null) {
        FBInstantManager.getInstance().invitePlay({
            level: this.dataSetting.unlock || 1,
            playerId: '',
        });
    }

    askCreateShortcut() {
        FBInstantManager.getInstance().getPlayerData((err, data) => {
            if (err) return console.log('--- fb instant get data err', err)

            if (data && !data.hadCreatedShortcut && data.visited && data.visited > 1) {
                FBInstantManager.getInstance().createShortcut((result) => {
                    if (result) {
                        data.hadCreatedShortcut = true
                        FBInstantManager.getInstance().setPlayerData(data, (err) => {
                            err && console.log('--- fb instant set data err', err)
                        })
                    }
                })
            }
        })
    }

    askSubcribeBot() {
        FBInstantManager.getInstance().subcribeBot((result) => {
            // save on user data
        })
    }
}
