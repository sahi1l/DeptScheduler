let DayNames = {
    "M": "Monday",
    "T": "Tuesday",
    "W": "Wednesday",
    "R": "Thursday",
    "F": "Friday",
    "S": "Saturday",
    "U": "Sunday"
};
class Time {
    constructor(hr,min) {
        this.hr = 0;
        this.min = 0;
        this.set(hr,min);
    }
    set(hr,min) {
        let re = new RegExp(/^([0-9]+):?([0-9][0-9])?([APap]?)/);
        if (/[^0-9]/.test(hr)) {
            let all,ampm;
            [all,hr,min,ampm] = hr.match(re);
            ampm = ampm?ampm.toLowerCase():"";
            if (ampm=="a") {
                hr = (hr%12);
            } else if (ampm=="p") {
                hr = (hr%12)+12;
            }
        }
        this.hr = Number(hr);
        this.min = Number(min);
    }
    print() {
        let hr = this.hr%12;
        let ampm = (this.hr < 12)?"am":"pm";
        if (this.hr == 0) {ampm="am";hr="12";}
        if (this.hr == 12) {ampm="pm";hr="12";}
        let min = ("00"+parseInt(this.min)).slice(-2);
        return `${hr}:${min}${ampm}`;
    }
    minutes() {
        return this.hr*60 + this.min;
    }
    add(minutes) {
        
    }
}
class Schedule {
    constructor(days,starttime,endtime) {
        //days should be a string like "MTWRF"
        //starttime and endtime should be strings 
        
    }
}
