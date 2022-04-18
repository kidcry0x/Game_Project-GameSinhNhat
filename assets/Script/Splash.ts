import BundleManager from "./BundleManager";
import Data from "./Data";
import { KEY } from "./Data";
import Loading from "./Loading";
import { TOTAL_LEVEL } from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Splash extends cc.Component {
    
    @property(Loading)
    loading: Loading = null;

    private _data = null;
    private _percent = 0;

    onLoad(): void {
        this._data = Data.getData(KEY.SETTING);
        let level = this._data.unlock + 1;
        console.time("preloadScene");
        cc.director.preloadScene("Game",
        (finish, total) => {
            if (this._percent <= finish / total)
                this._percent = finish / total;
            this.loading.updateProgress(this._percent);

        },
        (err) => {
            console.timeEnd("preloadScene");
            if (err) {
                cc.error("Preload scene that bai");
            }
            console.time("loadScene");
            cc.director.loadScene("Game", () => {
                console.timeEnd("loadScene");
            });
        });
        console.time("bundle");
        BundleManager.getInstance().loadBundle("resources", () => {
            BundleManager.getInstance().loadLevelSequence(
                level,
                (level + 2) > TOTAL_LEVEL ? level + (TOTAL_LEVEL - level) : level + 2,
                null,
                () => {
                    console.timeEnd("bundle");
                }
            );
        });
    }
}
