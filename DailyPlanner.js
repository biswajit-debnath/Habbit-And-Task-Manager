const currentdate = new Date();
const currentDay = currentdate.getDate();
const currentHour = currentdate.getHours();
const one_day = 1000 * 60 * 60 * 24;  // One day Time in ms (milliseconds)
const plannerDate = currentHour > 17 ? new Date(currentdate.setHours(currentdate.getHours() + 7)) : currentdate; // if it is post 5pm then day planner will be for tommorow or else today
const plannerDay = plannerDate.getDate();


function DailyPlanner() {
    let mainSheet = SpreadsheetApp.getActive().getSheetByName("Daily Planner Test");
    const plannerDataSheet = SpreadsheetApp.getActive().getSheetByName("Day Planner");
    const calenderApp = CalendarApp.getDefaultCalendar();
    let startingRowNumber = 10;
  
    //Event list constants///////////////////////////////////////////////////////////////////////////////////
    const eventColumnName = {
      "date": "A",
      "description": "B",
      "optionDropDown": "F",
      "timeTaken": "G",
      "taskId": "H",
      "completedPercentage": "I"
    }
    let totalEvents = mainSheet.getRange(eventColumnName.optionDropDown + startingRowNumber).getValue();
    let uniqueEvents = {
      "bath": {
        "interval": 2,
        "completedDates": new Set()
      },
      "shampoo": {
        "interval": 4,
        "completedDates": new Set(),
        
      },
      "excercise": {
        "interval": 2,
        "completedDates": new Set()
      },
  
      "antidshampoo": {
        "interval": 30,
        "completedDates": new Set()
      }
    };
  
    //Task list contants/////////////////////////////////////////////////////////////////////////////////////
    const taskListColumnName = {
      "id" : "AG",
      "date": "AH",
      "description": "AI",
      "toBeDoneAt": "AN",
      "toBeDoneBy": "AO",
      "startsAt": "AP",
      "donotDoAt": "AQ",
      "isCompleted": "AR",
      "completedPercentage": "AS",
      "notNeeded": "AT",
      "actualTimeTaken": "AU"
    }
    let totalTasks = mainSheet.getRange(taskListColumnName.id + (startingRowNumber-1)).getValue();
    const taskIdToDetail = {}
    
    //Daily planner contants///////////////////////////////////////////////////////////////////////////////////
    const dailyPlannerColumnName = {
      "type": "A",
      "description": "B",
      "duration": "E",
      "calenderEventId":"F"
    }
    const dailyPlannerMaxRows= 15;

    Logger.log(totalEvents);

  //Daily planner event constanst//////////////////////////////////////////////////////////////////////////////
  let dailyPlannerEventData = {
    "normalBath" : { description: "X11", timeNeeded: "Y11", type: "Z11", toDoAt: "AA11", eventsConsumed: ["Bath"]},
    "onlyShampoo" : {description: "X12", timeNeeded: "Y12", type: "Z12", toDoAt: "AA12", eventsConsumed: ["Shampoo"]},
    "bathWithShampoo" : {description: "X13", timeNeeded: "Y13", type: "Z13", toDoAt: "AA13", eventsConsumed: ["Bath", "Shampoo"]},
    "bathWithAntiDShampoo" : {description: "X14", timeNeeded: "Y14", type: "Z14", toDoAt: "AA14", eventsConsumed: ["Bath", "Shampoo", "AntiDShampoo"]},
    "excercise" : {description: "X15", timeNeeded: "Y15", type: "Z15", toDoAt: "AA15", eventsConsumed: ["Excercise"]},
    "taskDoneAt_PastDeadline" : {description: "X16", timeNeeded: "Y16", type: "Z16"},
    "taskDoneAt_OnDeadline" : {description: "X17", timeNeeded: "Y17", type: "Z17"},
    "taskDoneBy_FutureDeadline" : {description: "X18", timeNeeded: "Y18", type: "Z18"},
    "taskDoneBy_OnDeadline" : {description: "X19", timeNeeded: "Y19", type: "Z19"},
    "taskDoneBy_PastDeadline" : {description: "X20", timeNeeded: "Y20", type: "Z20"}
  };
  let tomorrowsEvents = [];









  //--------------------------------------------------Main Starts-------------------------------------------------------------------

  //--------------------------------------------------Main Ends-------------------------------------------------------------------

}

//Helper functions for event adder-----------------------




//Helper ends-------------------------------------------------