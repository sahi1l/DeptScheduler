/*global $ */
/*
Press shift-return to add a new row 
Press return to generate a schedule


OK, here's the rub: a table doesn't really cut it here because I might have overlap. I suppose I could add multiple columns per day that are collapsible?  Or maybe one column per instructor would be easiest.
*/

function AddInput() {
    console.log("AddInput");
    $("#input>tbody").append(
	'<TR><TD class="name"><INPUT><TD class="slot"><INPUT><TD class="code"><INPUT>');
    $("#input td>input").on("keyup",keyup);
}
function InitSchedule(){
    $("#calendar").html();
    var header='<div class="thead"><div id="corner"></div>';
    for(var day of "MTWRF"){
	header+='<div>'+day+'</div>';
    }
    header+='</div>';
    $("#calendar").append(header);
    for (var hour of [8,9,10,11,12,13,14,15,16,17,18,19]){
	var dhour=hour;
	if(hour>12){dhour=dhour-12;}
	for (var min of [0,1]){
	    var timeid=hour+"_"+min
	    var 
	    min=["00","30"][min];
	    var time=dhour+":"+min;
	    var row="<div class='tr' id='"+timeid+"'><div class='th'>"+time+"</div>";
	    for (var day of ["M","T","W","R","F"]){
		row+="<div class='"+day+"'></div>";
	    }
	    $("#calendar").append(row+"</div>");
	}
    }
}
//========================================================================
function ExplodeTime(time){
    //time looks like MWF10-10:30
    time=time.replaceAll(" ","");
    var days=time.match(/^[A-Z]+/)[0];
    time=time.substr(days.length);
    time=time.split("-");
    var start=NormalizeTime(time[0]);
    var end=NormalizeTime(time[1]);
    var result=[];
    var hour=start[0];
    var minute=start[1];
    var count=0; //debug
    while((hour!=end[0] || minute!=end[1]) && coount<100){
	count++;
	for (var day of days){
	    result.push(day+hour+"_"+minute);
	}
	minute=1-minute;
	if(minute==0){hour+=1;}
    }
    return result;
}
function Overlap(list){
    var slots={};
    var overlaps={};
    for (var time of list) {
	var explode=ExplodeTime(time);
	for (var slot of explode){
	    if (slots[slot]){
		slots[slot]+=1;
		overlaps[slot]=slots[slot];
	    } else {
		slots[slot]=1;
	    }
	}
    }
    return overlaps;
    //for department schedules, I will need to convert this to "find the max value of overlaps for each day of the week"
    //for student scheduling, we want overlaps to be empty
}
//======================================================================
function NormalizeTime(time){
    //no am/pm, we will assume instead
    time=time.replaceAll(/[AaPp][Mm]/g,"").split(":");
    var hour=time[0];
    let minute=0;
    if(time.length>1){
	minute=parseInt(time[1]);
	if(minute==0){
	    minute=0; //minute="00"
	} else if(minute==30){
	    minute=1; //minute="30"
	} else if(minute<30){
	    minute=1; //minute="30";
	} else {
	    minute=0; //minute="00";
	    hour=parseInt(hour)+1;
//	    if(hour>12){hour=1;}
	}
    }
    hour=parseInt(hour);
    if(hour<8){hour+=12;}
    return [hour,minute];
}
function ToTime(list){
    var hour=list[0];
    let minute;
    if(hour>12){hour=hour-12};
    if(list[1]==0){minute=":00"} else {minute=":30"};
    return ""+hour+minute;
}
function MakeSchedule(){
    $("#calendar .tr>div:not('.th')").html("");
    //the next three gets rid of boundaries
    $("#calendar .top").removeClass("top");
    $("#calendar .middle").removeClass("middle");
    $("#input>tbody>tr").each(function(x,y){
	var row=$(y).find("input");
	var name=row[0].value;
	console.log(name);
	//name doesn't need any cropping
	var time=row[1].value;
	//eliminate all spaces inside
	time=time.replaceAll(" ","");
	//take any prefix letters and store as days
	days=time.match(/^[A-Z]+/)[0];
	time=time.substr(days.length);
	//split the rest on a "-"
	time=time.split('-');
	var start=NormalizeTime(time[0]);
	var end=NormalizeTime(time[1]);

	var code=row[2].value;
	//This should be correlated with a color, or maybe a specific class? Right now, just print it underneath
	var hour=start[0];
	var min=start[1];
	var count=0;
	var firstQ=true;
	var classblock=undefined;
	console.log(start,end);
	while((hour!=end[0] || min!=end[1]) && count<20){
	    count++; //debug, though it might be useful to figure out when to use bottom or some such
	    for(var day of days){
		var entry=$("#calendar #"+hour+"_"+min+" ."+day)
		if(firstQ){
		    classblock=$("<div>");
		    classblock.html(name+"<BR>"+code);
		    classblock.addClass("top");
		    $(entry).html("").append(classblock);
		    $(entry).html("<div>"+name+"<BR>"+code+"</div>")
		    $(entry).addClass("top")
		} else {
		    $(entry).addClass("middle")
		}
	    }
	    firstQ=false;
	    console.log(hour,min,row)
	    min=1-min
	    if(min==0){hour+=1}
	}	   
    })
			     
}
function keyup(event){
    if(event.keyCode==13){ 
	if(event.shiftKey){//shift-return
	    AddInput();
	    $($("#input>tbody tr:last-child input:first-child")[0]).focus()
	} else {//return
	    MakeSchedule()
	}
    }
}
function inputinit(){
    InitSchedule()
    $("#input td>input").on("keyup",keyup)
}
$(inputinit)
