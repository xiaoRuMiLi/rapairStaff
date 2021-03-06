//时间转换工具类



/**
 * 将某个时间戳转化成 指定格式时间
 * @param {date} time 时间  new Date().getTime()
 * @param {string} cFormat {y}-{m}-{d} {h}:{i}:{s} {w}
 */

function Jh_timeStampToTime(time, cFormat) {
    if (arguments.length === 0) {
        return null;
    }
    const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
    let date;
    if (typeof time === "object") {
        console.log();
    } else {
        if (("" + time).length === 10) time = parseInt(time) * 1000;
        date = new Date(time);
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        w: date.getDay(),
    };
    const time_str = format.replace(/{(y|m|d|h|i|s|w)+}/g, (result, key) => {
        let value = formatObj[key];
        if (key === "w") {
            return ["日", "一", "二", "三", "四", "五", "六"][value];
        }
        if (result.length > 0 && value < 10) {
            value = "0" + value;
        }
        return value || 0;
    });
    return time_str;
}

/**
 * 将某个时间转化成时间戳
 * 时间格式：2019-05-20 00:00:00 或 2019年5月1日 00:00:00
 * 返回值：1556640000000，13位时间戳
 */
function Jh_convertTimeStamp(time) {
    //用正则主要是把“2019-05-20 00:00:00”转换成“2019/05/20 00:00:00”兼容ios
    let newTime = time.replace(/-|\./g, "/");
    // console.log(newTime);
    // newTime = newTime.replace(/\./g, "-");
    newTime = newTime.replace(/年/g, "/");
    newTime = newTime.replace(/月/g, "/");
    newTime = newTime.replace(/日/g, "");
    if (newTime.length == 4) {
        newTime = newTime + "/01/01 00:00:00";
    }
    if (newTime.length == 7) {
        newTime = newTime + "/01 00:00:00";
    }
    if (newTime.length == 10) {
        newTime = newTime + " 00:00:00";
    }
    if (newTime.length == 16) {
        newTime = newTime + ":00";
    }
    return Date.parse(newTime);
}

// 时间戳转年月日
function Jh_timestampToYMD(unixtime, format) {
    var formateArr = ["Y", "M", "D", "h", "m", "s"];
    var returnArr = [];
    var dateTime = new Date(parseInt(unixtime));
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    var second = dateTime.getSeconds();
    returnArr.push(year);
    returnArr.push(month < 10 ? "0" + month : month);
    returnArr.push(day < 10 ? "0" + day : day);
    returnArr.push(hour < 10 ? "0" + hour : hour);
    returnArr.push(minute < 10 ? "0" + minute : minute);
    returnArr.push(second < 10 ? "0" + second : second);
    for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
}

//某个时间是否是今天 time格式：2020-07-19 20:33:00
function Jh_isToday(time) {
    let newTime = time.replace(/-/g, "");
    newTime = newTime.substring(0, 8);
    var currentTime = new Date().getTime();
    currentTime = Jh_timeStampToTime(currentTime, "{y}{m}{d}");
    return newTime == currentTime;
}

//判断当前时间是否在某个时间段内  time格式：2020-07-19 20:33:00
function Jh_isBetweenTimes(beginTime, endTime) {
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");
    beginTime = new Date(beginTime);
    endTime = new Date(endTime);
    let currentTime = new Date();
    if (beginTime <= currentTime && currentTime <= endTime) {
        return true;
    }
    return false;
}

//获取当前年月  time格式：2020-07
function Jh_getYearMonth() {
    let timestamp = Date.parse(new Date());
    return Jh_timeStampToTime(timestamp, "{y}-{m}");
}

//获取 指定年的上一年 time格式：2020 | 2020年
function Jh_getPrevYear(time) {
    let tempYear = time.substring(0, 4);
    tempYear = parseInt(tempYear);
    tempYear = tempYear - 1;
    let text = time.substring(4, 5);
    let prevTime = "";
    if (text == "年") {
        prevTime = tempYear + "年";
    } else {
        prevTime = tempYear + text;
    }
    return prevTime;
}

//获取 指定年的下一年 time格式：2020 | 2020年
function Jh_getNextYear(time) {
    let tempYear = time.substring(0, 4);
    tempYear = parseInt(tempYear);
    tempYear = tempYear + 1;
    let text = time.substring(4, 5);
    let nextTime = "";
    if (text == "年") {
        nextTime = tempYear + "年";
    } else {
        nextTime = tempYear + text;
    }
    return nextTime;
}

//获取 指定年月的上一年月 time格式：2020-07 | 2020年07月
function Jh_getPrevYearMonth(time) {
    let tempYear = time.substring(0, 4);
    let tempMonth = time.substring(5, 7);
    tempYear = parseInt(tempYear);
    tempMonth = parseInt(tempMonth);
    tempMonth = tempMonth - 1;
    if (tempMonth == 0) {
        tempYear = tempYear - 1;
        tempMonth = 12;
    }
    if (tempMonth < 10) {
        tempMonth = "0" + tempMonth;
    }
    let text = time.substring(4, 5);
    let prevTime = "";
    if (text == "年") {
        prevTime = tempYear + "年" + tempMonth + "月";
    } else {
        prevTime = tempYear + text + tempMonth;
    }
    return prevTime;
}

// 获取 指定年月的下一年月 time格式：2020-07 | 2020年07月
function Jh_getNextYearMonth(time) {
    let tempYear = time.substring(0, 4);
    let tempMonth = time.substring(5, 7);
    tempYear = parseInt(tempYear);
    tempMonth = parseInt(tempMonth);
    tempMonth = tempMonth + 1;
    if (tempMonth == 13) {
        tempYear = tempYear + 1;
        tempMonth = 1;
    }
    if (tempMonth < 10) {
        tempMonth = "0" + tempMonth;
    }
    let text = time.substring(4, 5);
    let nextTime = "";
    if (text == "年") {
        nextTime = tempYear + "年" + tempMonth + "月";
    } else {
        nextTime = tempYear + text + tempMonth;
    }
    return nextTime;
}

/**
 * @param time Date/String/Number
 * @description getEndTime('2021-02-12')
 * @returns '距离2021年2月12日还有118天0小时30分12秒'
 */
function getEndTime(time) {
    var year = new Date(time).getFullYear();
    var month = new Date(time).getMonth() + 1;
    var date = new Date(time).getDate();
    var now = new Date();
    var endDate = new Date(new Date(time).toLocaleDateString());
    var leftTime = endDate.getTime() - now.getTime();
    var leftsecond = parseInt(leftTime / 1000);
    var day = Math.floor(leftsecond / (60 * 60 * 24));
    var hour = Math.floor((leftsecond - day * 24 * 60 * 60) / 3600);
    var minute = Math.floor((leftsecond - day * 24 * 60 * 60 - hour * 3600) / 60);
    var second = Math.floor(leftsecond - day * 60 * 60 * 24 - hour * 60 * 60 - minute * 60);
    return `距离${year}年${month}月${date}日还有${day}天${hour}小时${minute}分${second}秒`;
}
export default {
    Jh_timeStampToTime,
    Jh_convertTimeStamp,
    Jh_timestampToYMD,
    Jh_isToday,
    Jh_isBetweenTimes,
    Jh_getYearMonth,
    Jh_getPrevYear,
    Jh_getNextYear,
    Jh_getPrevYearMonth,
    Jh_getNextYearMonth,
    getEndTime,
};

/*
  使用方法：

  const TimeUtils = require('@utils/timeUtils');
  const TimeUtils = require('../../utils/timeUtils.js');

  //时间戳转指定格式时间
  TimeUtils.Jh_timeStampToTime(1554803832, '{y}年{m}月{d}日 {h}:{i}:{s} 星期{w}')                     1487065320000
  TimeUtils.Jh_timeStampToTime(new Date().getTime(), '{y}年{m}月{d}日 {h}:{i}:{s} 星期{w}')

  */
