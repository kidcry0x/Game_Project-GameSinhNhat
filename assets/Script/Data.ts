
const {ccclass, property} = cc._decorator;


const LOCAL_KEY = "troll_master_data";

export enum KEY {
    SETTING = "troller_master_data_setting",
    BAG = "troller_master_data_bag"
}

const dataSetting = {
    unlock: 0,
    isMusic: true,
    isSound: true,
    isVibrate: true
}

const dataBag = {
    pencil: 0,
    pencils: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
}

@ccclass
export default class Data {
    
    public static saveData(key: KEY, data): void {
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    public static getData(key: KEY): JSON {
        let data = null;
        switch(key)
        {
            case KEY.SETTING:
                data = JSON.parse(cc.sys.localStorage.getItem(key));
                return data ? data: dataSetting;

            case KEY.BAG:
                data = JSON.parse(cc.sys.localStorage.getItem(key));
                return data ? data: dataBag;
        }
    }

    public static removeData(key: KEY): void {
        cc.sys.localStorage.removeItem(key);
    }
}
