// import { TOTAL_LEVEL } from "./GameManager";

const {ccclass, property} = cc._decorator;
@ccclass
export default class BundleManager {

    private static _instance = null;
    private _bundle = null;
    private _prefabs = [];
    private _queue = [];

    public static getInstance(): BundleManager {
        if (BundleManager._instance)
            return BundleManager._instance;
        else {
            BundleManager._instance = new BundleManager();
            return BundleManager._instance;
        }
    }

    loadBundle(name: string, callback?: Function): void {
        cc.assetManager.loadBundle(name, (err, bundle) => {
            if (err) {
                console.error(err);
                return;
            }
            this._bundle = bundle;
            callback && callback(bundle);
        });
    }

    loadLevelSequence(levelStart: number, levelEnd: number, onProgress?: Function, onCompleted?: Function): void {
        if (this._bundle) {
            if (levelStart < levelEnd) {
                this._bundle.load("Level" + levelStart + "/" + "Level" + levelStart, cc.Prefab, (finish, total) => {
                    onProgress && onProgress(finish, total);
                }, (err, prefab) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (!this._prefabs.includes(prefab))
                        this._prefabs.push(prefab);
                    console.log("Add " + prefab.name);
                    this.loadLevelSequence(levelStart + 1, levelEnd, onProgress, onCompleted);
                })
            }
            else {
                onCompleted && onCompleted();
            }
        }
    }

    loadLevel(name: string, onProgress?: Function, onCompleted?: Function): void {
        if (this._prefabs.indexOf(name) != -1) {
            return;
        }
        if (this._bundle) {
            this._bundle.load(name + "/" + name, cc.Prefab,(finish, total) => {
                    onProgress && onProgress(finish, total);
                }, (err, prefab) => {
                    if (err) {
                        onCompleted && onCompleted(err, null);
                    }
                    else {
                        if (!this._prefabs.includes(prefab))
                            this._prefabs.push(prefab);
                        console.log("Push " + prefab.name);
                        onCompleted && onCompleted(null, prefab);
                    }
                }
            )
        }
        else {
            this._queue.push(name);
        }
    }

    setPrefab(arr): void {
        this._prefabs = arr;
    }

    getPrefabByIndex(index, cb): void {
        for (let p of this._prefabs)
        {
            if (p.name == "Level" + index)
                return cb && cb(null, p);
        }
        cc.error("Khong co prefab");
    }

    getPrefabByName(name:string, onProgress?: Function, onCompleted?: Function): void {
        for (let prefab of this._prefabs)
        {
            if (prefab.name == name) {
                onCompleted && onCompleted(null, prefab);
                return;
            }
        }

        this.loadLevel(name, onProgress, onCompleted);
    }
}
