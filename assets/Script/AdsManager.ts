import Data, { KEY } from './Data';


const {ccclass, property} = cc._decorator;
const INTERESTIAL_AD_UNIT:string = "205082648150961_208651431127416"
const REWARD_AD_UNIT:string = "205082648150961_208651514460741"

class ADSError extends Error {
    code = 'ADS_NOT_LOADED'
}

@ccclass
export default class AdsManager {
    private preloadedInterstitial = null;
    private preloadedReward = null;
    private static instance: AdsManager;
    private isLoadedInsterestialAds: boolean = false
    private isLoadedRewardAds: boolean = false
    private lastShowTime:number = 0

    private adsRetryTime = 30000

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() { }

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): AdsManager {
        if (!AdsManager.instance) {
            AdsManager.instance = new AdsManager();
        }

        return AdsManager.instance;
    }
    private preloadInterestialAds(){
        if (!this.isLoadedInsterestialAds) {
            FBInstant.getInterstitialAdAsync(
            INTERESTIAL_AD_UNIT // Your Ad Placement Id
            ).then(interstitial =>{
                // Load the Ad asynchronously
                cc.log(this)
                this.preloadedInterstitial = interstitial;
                return this.preloadedInterstitial.loadAsync();
            }).then(() => {
                console.log('Interstitial preloaded');
                this.isLoadedInsterestialAds = true
            }).catch(err => {
                console.error('Interstitial failed to preload: ' + err.message);
                setTimeout(function () { this.handleAdsNoFill(this.preloadedInterstitial, 2); }.bind(this), this.adsRetryTime);
            });
        }
    }
    private preloadRewardVideoAds(){
        if (!this.isLoadedRewardAds) {
            FBInstant.getRewardedVideoAsync(
            REWARD_AD_UNIT // Your Ad Placement Id
            ).then(rewarded =>{
                // Load the Ad asynchronously
                this.preloadedReward = rewarded;
                return this.preloadedReward.loadAsync();
            }).then(() => {
                console.log('reward preloaded');
                this.isLoadedRewardAds = true
            }).catch(err => {
                console.error('reward failed to preload: ' + err.message);
                // setTimeout(function () { this.handleAdsNoFill(this.preloadedInterstitial, 2); }.bind(this), 10 * 1000);
            });
        }
    }
    /**
     * Finally, any singleton should define some business logic, which can be
     * executed on its instance.
     */
    public preload() {
        Data.getData(KEY.SETTING);
        this.preloadInterestialAds()
        this.preloadRewardVideoAds()
    }
    // Here is how the function to handle ADS_NO_FILL would look like
    handleAdsNoFill (adInstance, attemptNumber) {
        if (attemptNumber > 3) {
        // You can assume we will not have to serve in the current session, no need to try
        // to load another ad.
        return;
        } else {
        adInstance.loadAsync().then(() =>{
            // This should get called if we finally have ads to serve.
            console.log('Interstitial preloaded')
            this.isLoadedInsterestialAds = true
        }).catch(err => {
            console.error('Interstitial failed to preload: ' + err.message);
            // You can try to reload after 30 seconds
            setTimeout(() => {
            this.handleAdsNoFill(adInstance, attemptNumber+1);
            }, this.adsRetryTime);
        });
        }
    }
  
    public showInterestialAds(cb=null){
        var now = Date.now()
        if ((now - this.lastShowTime) < this.adsRetryTime ){
            cb && cb(Error("CAPPED_TIME"))
            return
        }
        if (this.preloadedInterstitial == null){
            cb && cb(Error("NULL inters"))
            return
        }
        cc.audioEngine.pauseMusic()
        this.preloadedInterstitial.showAsync()
        .then(() =>{
            // Perform post-ad success operation
            cc.audioEngine.resumeMusic()
            this.isLoadedInsterestialAds = false
            console.log('Interstitial ad finished successfully');        
            this.preloadInterestialAds()
            this.lastShowTime = Date.now()
            cb && cb(null)

        })
        .catch(e => {
            cc.audioEngine.resumeMusic()
            console.error(e.message);
            cb && cb(e)
        });


    }

    private reloadRewardedAds() {
        this.isLoadedRewardAds = false
        console.log('Rewarded ad finished successfully');
        this.preloadRewardVideoAds()
    }

    public showRewardedAds(cb=null){
        cc.audioEngine.pauseMusic()

        this.preloadedReward && this.preloadedReward.showAsync()
            .then(() =>{
                // Perform post-ad success operation
                this.reloadRewardedAds()
                cb && cb(null)
                cc.audioEngine.resumeMusic()
            })
            .catch(e => {
                cc.audioEngine.resumeMusic()
                console.error('ads err', e.message);
                this.reloadRewardedAds()
                cb && cb(e)
            });

        if (!this.preloadedReward) {
            // this.onAdsRewardFail();
            const e = new ADSError('ADS_NOT_LOADED')
            e.code = 'ADS_NOT_LOADED'
            cb && cb(e);
        }

    }

    onAdsRewardFail() {
        const ui = cc.find('Canvas/UI')
        const uiController = ui.getComponent('UIController')
        let msg = 'NO INTERNET CONNECTION'  // ADS_NOT_LOADED

        // if (e.code === 'USER_INPUT') {
        //     msg = 'PLEASE WAIT FOR ADS TO FILL!'
        // }
        
        uiController.showAlert(msg, 2.5)
    }
}
