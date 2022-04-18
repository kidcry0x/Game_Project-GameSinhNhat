const {ccclass, property} = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.Label)
    percent: cc.Label = null;

    @property(cc.ProgressBar)
    loading: cc.ProgressBar = null;

    onEnable(): void {
        this.reset();
    }

    reset(): void {
        this.percent.string = "0 %";
        this.loading.progress = 0;
    }

    updateProgress(percent: number): void {
        this.loading.progress = percent;
        this.percent.string = Math.floor(this.loading.progress * 100) + " %";
    }

    close(): void {
        this.node.active = false;
    }
}
