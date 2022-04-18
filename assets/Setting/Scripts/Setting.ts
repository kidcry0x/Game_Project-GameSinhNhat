import Panel from "../../Script/Panel";
import Button from "./Button";
import { KEY } from "../../Script/Data";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Setting extends Panel {

    @property(Button)
    music: Button = null;

    @property(Button)
    sound: Button = null;

    @property(Button)
    vibrate: Button = null;

    onEnable(): void {
        super.onEnable();
        this.node.on("change_setting", this.onChange, this);
        this.music.setState(this.dataSetting.isMusic);
        this.sound.setState(this.dataSetting.isSound);
        this.vibrate.setState(this.dataSetting.isVibrate);
    }

    onChange(event): void {
        switch (event.nameTarget)
        {
            case "music":
                this.dataSetting.isMusic = event.state;
                event.state ? this.gameManager.playBG() : cc.audioEngine.pauseMusic();
                break;
            case "sound":
                this.dataSetting.isSound = event.state;
                break;
            case "vibrate":
                this.dataSetting.isVibrate = event.state;
                break;
        }
        this.gameManager.dataSetting = this.dataSetting;
        this.saveData(KEY.SETTING, this.dataSetting);
    }
}
