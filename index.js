/* global $ */
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
            [,hr,min,ampm] = hr.match(re);
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
        this.min += minutes;
        while (this.min>=60) {
            this.hr += 1;
            this.min -= 60;
        }
        while(this.min<0) {
            this.hr -= 1;
            this.min += 60;
        }
    }
    copy() {
        return new Time(this.hr,this.min);
    }
}
class Block {//as represented on the calendar
    constructor(day,start,end,classdata) {
        //data is of type ClassData
        this.day = day;
        this.start = new Time(start);
        this.end = new Time(end);
        this.data = classdata;
    }
    duration() {
        return this.end.minutes - this.start.minutes;
    }
}
class ClassData {
    constructor(name,instructor,room) {
        this.name = name??"";
        this.instructor = instructor??"";
        this.room = room??"";
    }
}
class Event {//this is a class with multiple days, a row in the entry list
    constructor(timeslot,classdata) {
        this.blocks = [];
        let re = new RegExp(`^([${Object.keys(DayNames).join("")}]+)(.*)$`);
        let days = timeslot.match(re);
        let time = days?days[2]:"";
        days = days?days[1]:"";
        if (time.includes("-")) {
            for (let day of days) {
                this.blocks.push(new Block(day,time.split("-")[0],time.split("-")[1],classdata));
            }
        }
    }
    valid() {
        return (this.blocks.length>0);
    }
}
class TimeRange {
    //a collection of time ranges (in minutes) like [30-130, 250-280], etc
    //only deals with numbers of minutes as integers
    constructor() {
        this.ranges = [];
    }
    add(start,end) {
        //add a value to a range
        this.ranges.push([start,end]);
    }
    contains(time) {
        //is time included in this range?
        for (let range of this.ranges) {
            if (range[0]<= time && range[1] >= time) {return true;}
        }
        return false;
    }
}
function alphacmp(a,b) {
    if (a < b) {return -1;}
    if (a>b) {return 1;}
    return 0;
}
class Schedule {
    constructor(days,starttime,endtime) {
        //days should be a string like "MTWRF"
        //starttime and endtime should be strings
        this.$root = $("#schedule");
        this.$header = $("#schedule>#header");
        this.$body = $("#schedule>#body");
        this.start = new Time(starttime);
        this.end = new Time(endtime);
        this.days = days;
        this.column = {};
        for (let day of this.days) {
            this.column[day] = []; //list of Blocks
        }
    }
    addBlock(block){this.column[block.day].push(block);}
    addEvent(event) {for (let block of event.blocks) {this.addBlock(block);}}
    sortColumn(day) {
        this.column[day].sort((a,b) => {
            let dur = a.duration() - b.duration();
            if (dur) {return dur;}
            let st = a.start.minutes() - b.start.minutes();
            return st;
        });
    }
    getColumns(day) {
        //calculate the number of columns required to accommodate column[day]
        this.sortColumn(day);
        let columns = [new TimeRange()];
        for (let block of this.column[day]) {
            console.debug(block);
            let done = false;
            for (let i in columns) {
                let col = columns[i];
                if (!(col.contains(block.start) || col.contains(block.end))) {
                    col.add(block.start,block.end);
                    done=true;
                    break;
                    block.x = i;
                }
            }
            if(!done) {
                let col = new TimeRange();
                columns.push(col);
                col.add(block.start,block.end);
                block.x = columns.length - 1;
            }
        }
        return columns;
    }
    generate() {
        //        this.$header.append($("<div>"));
        let sm = this.start.minutes();
        let em = this.end.minutes();
        let $times = $("<div>").addClass("times").css({"grid-area": "2/1"}).appendTo(this.$root);
        let height = $times.height();
        let ppm = height/(em-sm);
        let display = this.start.copy();
        while (display.minutes() < em) {
            $("<div>").html(display.print()).css({top:(display.minutes()-sm)*ppm}).appendTo($times);
            display.add(30);
        }
        let $cols = [];
        for (let i in this.days) {
            i = Number(i);
            let day = this.days[i];
            let name = DayNames[day];
            $("<div>").html(name).css({"grid-area": `1/${i+2}`}).appendTo(this.$root);
            let $col = $("<div>").addClass("column").css({"grid-area": `2/${i+2}`}).appendTo(this.$root);
            let width = $col.width();
            let cols = this.getColumns(day);
            let subwidth = width/cols.length;
            console.debug(this.column[day]);
            for (let block of this.column[day]) {
                console.debug(block);
                $("<div>").addClass("block").html(`${block.start.print()}-${block.end.print()}`)
                    .css({top: (block.start.minutes()-sm)*ppm,
                          bottom: (block.end.minutes()-sm)*ppm,
                          left: block.x*subwidth,
                          width: subwidth,
                          position: "absolute"}).appendTo($col);
            }
                
        }
    }
}
let schedule;
function init() {
    schedule = new Schedule("MTWRF","8:00am","5:00pm");
    schedule.addEvent(new Event("MWF10:00am-10:50am",{name:"PHYS 101"}));
    schedule.addEvent(new Event("MW10:30am-11:50am",{name:"Another"}));
    console.debug(schedule.getColumns("M"));
    schedule.generate();
}
$(init);
