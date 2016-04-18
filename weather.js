//.......1.........2.........3.........4.........5.........6.........7.........8.........9.........0
var KJ=require('knjsdom');
var DB=require('knmongo');

var L={
  num: function(dt){
    var i, x, out=""; for(i=0; i<dt.length; i++){x=dt.charAt(i); if(isFinite(x)){out+=x;}}
    return out;
  },
//  
  rain: function(vl){
    if(vl==" "){return "";}
    if(vl<10){return "255,0,0";}
    if(vl<20){return "255,10,10";}
    if(vl<30){return "255,30,30";}
    if(vl<40){return "255,255,0";}
    if(vl<60){return "0,255,0";}
    if(vl<70){return "0,255,255";}
    if(vl<80){return "100,50,255";}
    if(vl<90){return "50,10,255";}
    return "0,0,255";
  },
//  
  wear: function(vl){
    if(vl>=90){return "255,0,0";}
    if(vl>=80){return "255,10,10";}
    if(vl>=70){return "255,30,30";}
    if(vl>=60){return "255,255,0";}
    if(vl>=50){return "0,255,0";}
    if(vl>=40){return "0,255,255";}
    if(vl>=30){return "100,50,255";}
    if(vl>=20){return "50,10,255";}
    return "0,0,255";
  }
};

DB.MAIN(function(){
  var i, j; var ws="192.168.1.124";
  DB.open();

  var b=true;
  while(b){
    var d=new Date(); var h=d.getHours(); var t, t1, t2, t3;
    t1=""; t2=""; t3="";
    var $;

//降雨確率
    if(h<7 || h>22){
      t="0,0,0";
    }else{
      $=KJ.getDom('http://www.tenki.jp/forecast/6/31/6310.html');
      switch(true){
       case
        h<9: t1=L.num($(".rainProbability").eq(0).find("td").eq(1).html()); t=L.rain(t1);
        break;
       case
        h<12: t1=L.num($(".rainProbability").eq(0).find("td").eq(2).html()); t=L.rain(t1);
        break;
       case h<16:
        t1=L.num($(".rainProbability").eq(0).find("td").eq(3).html()); t=L.rain(t1);
        break;
       default:
        t1=L.num($(".rainProbability").eq(1).find("td").eq(1).html()); t=L.rain(t1);
      }
    }
    $=null;
    KJ.getDom('http://'+ws+'/rgb/1/'+t+'/');

    var rc=DB.read("status", {key: "RAINPART"}, ["value", "last", "ws"]);
    if(!rc){DB.REC[0]={}}
    DB.REC[0].key="RAINPART";
    DB.REC[0].value=t1;
    DB.REC[0].ws="";
    DB.REC[0].last=DB.date("YMDHIS");
    if(rc){DB.rewrite();}else{DB.insert();}

    if(global.gc){global.gc();}

//服装指数  
    if(h<7 || h>22){
      t="0,0,0";
    }else{
      $=KJ.getDom('http://www.tenki.jp/indexes/dress/6/31/6310.html');
      if(h<12){
        t2=L.num($("#exponentLargeLeft").find("dd").find("dl").find("dd").html());
        t=L.wear(t2);
      }else{
        t2=L.num($("#exponentLargeRight").find("dd").find("dl").find("dd").html());
        t=L.wear(t2);
      }
    }
    $=null;
    KJ.getDom('http://'+ws+'/rgb/2/'+t+'/');

    var rc=DB.read("status", {key: "WEARMETER"}, ["value", "last", "ws"]);
    if(!rc){DB.REC[0]={}}
    DB.REC[0].key="WEARMETER";
    DB.REC[0].value=t2;
    DB.REC[0].ws="";
    DB.REC[0].last=DB.date("YMDHIS");
    if(rc){DB.rewrite();}else{DB.insert();}

    if(global.gc){global.gc();}
  
//警報
    $=KJ.getDom('http://www.tenki.jp/bousai/warn/6/31/2820600.html');
    var x=$(".map_warn_point_recent_entry").find("span").eq(0).html();
    if(x.indexOf("警報")>=0){t3="on";}else{t3="off";}
    $=null;
    KJ.getDom('http://'+ws+'/'+t3+'/0/');

    var rc=DB.read("status", {key: "ALARM"}, ["value", "last", "ws"]);
    if(!rc){DB.REC[0]={}}
    DB.REC[0].key="ALARM";
    DB.REC[0].value=t3;
    DB.REC[0].ws="";
    DB.REC[0].last=DB.date("YMDHIS");
    if(rc){DB.rewrite();}else{DB.insert();}

　　if(global.gc){global.gc();}
//ログ
    console.log(DB.date("y/M/D H:I:S ")+"降雨確率:"+t1+" 服装指数:"+t2+" 警報:"+t3);

//    KJ.sleep(900000);
    b=false;

  }
  DB.close();

  L=null; $=null;
  if(global.gc){global.gc();}
});

