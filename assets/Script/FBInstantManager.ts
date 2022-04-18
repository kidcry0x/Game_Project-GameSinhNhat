const {ccclass, property} = cc._decorator;

const LEADERBOARD_NAME = 'HighScore.'
const DATA_KEY = 'userData'

@ccclass
export default class FBInstantManager {
    private static instance: FBInstantManager;

    private shareImg
    private playerId = ''

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
    public static getInstance(): FBInstantManager {
        if (!FBInstantManager.instance) {
            FBInstantManager.instance = new FBInstantManager();
        }

        return FBInstantManager.instance;
    }

    public getPlayerId() {
        if (!this.playerId) {
            try {
                this.playerId = FBInstant.player.getID()
            } catch (err) {
                this.playerId = 'localId'
            }
        }

        if (this.playerId) return this.playerId
    }

    private getShareImg(cb) {
        if (this.shareImg) {
            return cb(this.shareImg)
        }

        cc.resources.load('Base64/ShareImg', (err, file) => {
            this.shareImg = file.text
            cb(this.shareImg)
        })
    }

    public shareGame() {
        this.getShareImg((img) => {
            const sharePlayerID = FBInstant.player.getID()

            FBInstant.shareAsync({
                intent: 'REQUEST',
                image: img,
                text: "Let's play Trollmaster!",
                data: { sharePlayerID },
            })
        })
    }

    public invitePlay(customData={level: 1, playerId: ''}) {
        const postInvite = (leaderboardName) => {
            FBInstant.getLeaderboardAsync(
                leaderboardName
            ).then((leaderboard) => {
                return leaderboard.setScoreAsync(customData.level, '')
            }).then(() => {
                FBInstant.updateAsync({
                    action: 'LEADERBOARD',
                    name: leaderboardName,
                    text: `${FBInstant.player.getName()} had passed level ${customData.level} invite you to play Trollmasster`,
                }).then(() => {
                    cc.log('send invite - update leaderboard')
                }).catch((err) => {
                    console.log('errr', err)
                })

            }).catch((err) => {
                console.log('err', err)
            })
        }

        let contextFunc = FBInstant.context.chooseAsync
        const param = []

        if (customData.playerId) {
            contextFunc = FBInstant.context.createAsync
            param.push(customData.playerId)
        }

        contextFunc(...param).then(() => {
            const leaderboardName = LEADERBOARD_NAME + FBInstant.context.getID()
            postInvite(leaderboardName)
        }).catch((err=null) => {
            console.log('fail?', err)
        })
    }

    public getConnectedPlayers(cb) {
        try {
            FBInstant.player.getConnectedPlayersAsync().then(players => {
                const data = players.map(p => {
                    return {
                        id: p.getID(),
                        name: p.getName(),
                        photo: p.getPhoto()
                    }
                })

                cb(data)
            }).catch(err => {
                console.log('get list fail', err)
            })
        } catch (err) {
            cc.log('error:', err)
        }
    }

    public setPlayerData(data, cb) {
        try {
            if (!FBInstant) return cb(null)
        } catch (err) {
            return cb(null)
        }

        const saveData = {}
        saveData[DATA_KEY] = data

        FBInstant.player.setDataAsync(saveData).then(() => {
            cb(null)
        }).catch((err) => {
            cb(err)
        });
    }

    public getPlayerData(cb) {
        try {
            if (!FBInstant) return cb(null, null)
        } catch (err) {
            return cb(null, null)
        }

        FBInstant.player.getDataAsync([DATA_KEY]).then((data) => {
            cb(null, data[DATA_KEY])
        }).catch((err) => {
            cb(err, null)
        });
    }

    public createShortcut(cb) {
        try {
            FBInstant.canCreateShortcutAsync().then((result) => {
                if (result) {
                    FBInstant.createShortcutAsync()
                        .then(() => {
                            console.log('--- create shortcut success')
                            cb(true)
                        })
                        .catch(function() {
                            console.log('--- create shortcut fail')
                            cb(false)
                        });
                }
                cb(false)
            })
        } catch (exc) {
            console.error(exc)
            cb(false)
        }
    }

    public getLocale() {
        return FBInstant.getLocale()
    }

    public setSessionData(data) {
        FBInstant.setSessionData(data);
    }

    public subcribeBot(cb) {
        try {
            FBInstant.player.canSubscribeBotAsync().then((result) => {
                if (result) {
                    FBInstant.player.subscribeBotAsync().then(() => {
                        console.log('--- subcribe bot success')
                        cb(true)
                    }).catch(function (e) {
                        console.log('--- subcribe bot fail', e)
                        cb(false)
                    });
                }
                cb(false)
            })
        } catch (exc) {
            console.log(exc)
            cb(false)
        }
    }
}
