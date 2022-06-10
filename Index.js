import fetch from 'node-fetch';
import fs from 'fs';
import http from 'http';
import url from 'url';
import moment from 'moment-timezone';
// let notifycationIsReset = true;
let notifycationHours = [21,0,3,6,9,12,15];
function newDateOfChina(){
    return new Date(moment(new Date()).tz("Asia/Shanghai").format()) 
    
}
function readDataJson(){
    return new Promise(resolve=>{
    let res = fs.createReadStream("./data.json",{encoding:"utf-8"});
    let data = "";
    res.on("data",chunk=>data+=chunk);
    res.on("end",()=>{
           // console.log
    data = JSON.parse(data);
    // const result = ;
    resolve( data);
        
    })
 
    })
  
    // return result.join("    \n");
}
function writeDataJson(data){
    let towritedata = JSON.stringify(data);
    let res = fs.createWriteStream("./data.json",{encoding:"utf-8"});
    res.write(towritedata);
    res.end();
}
async function sendNotification(readedData){
    // Array
     const result = await fetch( `http://api.sms.cn/sms/?ac=send &uid=anhiao&pwd=1966453034fc27f5cebe7b0260028def&template=559464&mobile=18134403146&content={"count":"${readedData.length}","content":"${readedData.join("    \n")}"}`,{
        method:"GET"
    });
    console.log(await result.text())
}
setInterval(async()=>{
    let nowDate = newDateOfChina();
    let notifycationHoursFirst = notifycationHours[0];
    if( notifycationHoursFirst === (nowDate.getHours())){
        console.log(nowDate.toLocaleString() + "   notifycation sending")
        notifycationHours.splice(0, 1);
        notifycationHours.push(notifycationHoursFirst);
        console.log(notifycationHours)
        const readedDataJson = await readDataJson(); 
        if(readedDataJson['tasks'].length !== 0) return sendNotification(
           readedDataJson['tasks'].map((v,k)=>`${k+1}.${v}`)
            );
    }
},12345)

let server = http.createServer(async function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  var q = url.parse(req.url, true).query;
  var txt = q.todo ;
  let method = q.method;
  let id = q.id;
//   console.log(txt.length);
  if(txt) {
   let readedDataJson = (await readDataJson());
   readedDataJson['tasks'].push(txt);
   writeDataJson(readedDataJson);
   return res.end(`${txt} added !`);   
  }
  if(q.method === "getList"){
      let readedDataJson = (await readDataJson());
      return res.end(`${readedDataJson['tasks'].map((v,k)=>`${k+1}.${v}`)}`)
  }
  if(q.method === "didit"){
      let readedDataJson = (await readDataJson());
    //   readDataJson['tasks'].some((v,k)=>{
    //       if(++k === id){
    //           // 找到了id然后删除
    //           return
    //       }
    //   })
    readedDataJson['tasks'].splice(id-1,1);
    writeDataJson( readedDataJson);
    return res.end(`${id} You did it !`)
  }
  
  

}).listen(3333,()=>{
    console.log("start listening")
}); //服务器对象监听端口8080
// let res = fs.createReadStream("./data.json",{
//     encoding:"utf-8"
// });
// res.on("data",(data)=>{console.log(data)})
// (async ()=>{
    
//     const result = await fetch( `http://api.sms.cn/sms/?ac=send &uid=anhiao&pwd=1966453034fc27f5cebe7b0260028def&template=559464&mobile=18134403146&content={"count":"2","content":"1.now提现\n2.完成家务"}`,{
//         method:"GET"
//     });
//     console.log(await result.text())
// })