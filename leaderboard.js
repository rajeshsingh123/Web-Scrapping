const request=require("request");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
//const fs = require("fs");
const xlsx = require("json-as-xlsx")

const link="https://www.espncricinfo.com/series/ipl-2021-1249214/match-results";

request(link,cb)
let counter=0;
const fs=require("fs");

let leaderboard = [];

function cb(error,response,html){
    if(error){  
        console.error('error:', error); // Print the error if one occurred
          }else{  
      const dom=new JSDOM(html);
      const document=dom.window.document;
      let allscorecardstag=document.querySelectorAll('.ds-grow.ds-px-4.ds-border-r.ds-border-line-default-translucent>a');
      //console.log(allscorecardstag.length);
      for (let i = 0; i < 60; i++) {
       // let anchorTagAll = allScorecardTags[i].querySelectorAll("a");
        let link = allscorecardstag[i].href;
       let completeLink = "https://www.espncricinfo.com" + link;
     // console.log(completeLink);

        request(completeLink, cb2);
        counter++;
         // console.log(link);   
    }
        }
}

function cb2(error,response,html){
    if(error){  
        console.error('error:', error); // Print the error if one occurred
          }else{  
            const dom=new JSDOM(html);
            const document=dom.window.document;
            let batsmenRow = document.querySelectorAll(".ds-w-full.ds-table.ds-table-md.ds-table-auto.ci-scorecard-table tbody tr");

            for (let i = 0; i < batsmenRow.length; i++) {
                let cells = batsmenRow[i].querySelectorAll("td");
                if (cells.length == 8) {
                    let name = cells[0].textContent;
                    let runs = cells[2].textContent;
                    let balls = cells[3].textContent;
                    let fours = cells[5].textContent;
                    let sixes = cells[6].textContent;
                  //  console.log("Name : ",name,"Runs : ",runs,"Balls : ",balls,"Fours : ",fours,"Sixes : ",sixes);
                    processPlayer(name, runs, balls, fours, sixes);
                }
            }
            counter--;
            if (counter == 0) {
             //   console.log(leaderboard);
                       let data = JSON.stringify(leaderboard);
            fs.writeFileSync('BatsmenStats.json', data);
            let dataExcel = [
                {
                    sheet: "Ipl Stats",
                    columns: [
                        { label: "Name", value: "Name" }, // Top level data
                        { label: "Innings", value: "Innings" },
                        { label: "Runs", value: "Runs" }, // Custom format
                        { label: "Balls", value: "Balls" }, // Run functions
                        { label: "Fours", value: "Fours" },
                        { label: "Sixes", value: "Sixes" },
                    ],
                    content: leaderboard
                    //[{Name:"Rahul",Innings:16,Runs:422,Balls......}]
                },
            ]

            let settings = {
                fileName: "BatsmenDetail", // Name of the resulting spreadsheet
                extraLength: 3, // A bigger number means that columns will be wider
                writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
            }
            xlsx(dataExcel, settings) // Will download the excel file
       

            }
     }
}


function processPlayer(name, runs, balls, fours, sixes) {
    runs = Number(runs);
    balls = Number(balls);
    fours = Number(fours);
    sixes = Number(sixes);
    for (let i = 0; i < leaderboard.length; i++) {
        let playerObj = leaderboard[i];
        if (playerObj.Name == name) {
            //will do some work here
            playerObj.Runs += runs;
            playerObj.Innings += 1;
            playerObj.Balls += balls;
            playerObj.Fours += fours;
            playerObj.Sixes += sixes;
            return;
        }
    }
    // code coming here means we did not find our player inside leaderboard
    let obj = {
        Name: name,
        Innings: 1,
        Runs: runs,
        Balls: balls,
        Fours: fours,
        Sixes: sixes
    }
    leaderboard.push(obj);
}
