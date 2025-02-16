const currentdate = new Date();
const currentDay = currentdate.getDate();
const currentHour = currentdate.getHours();
const one_day = 1000 * 60 * 60 * 24;  // One day Time in ms (milliseconds)
const plannerDate = currentHour > 17 ? new Date((new Date()).setHours(currentdate.getHours() + 7)) : currentdate; // if it is post 5pm then day planner will be for tommorow or else today
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
    "doneAt": "E",
    "optionDropDown": "F",
    "timeTaken": "G",
    "taskId": "H",
    "completedPercentage": "I"
  }
  let totalEvents = getTotalEvents(mainSheet, {eventColumnName, startingRowNumber}); 
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


//------------------------------Auto add event in event list------------------------------------------
  //Determine the Date for reading the calender
  let lastEventDate = new Date(new Date(plannerDate).setHours(plannerDate.getHours() - 24));

  //Read all events for that day
  const eventsForInsert = readEventsForTheDay(lastEventDate, calenderApp); 

  //Add the events in event list of the excel sheet
  updateEventListForTheDay(mainSheet, {eventsForInsert, lastEventDate, startingRowNumber, totalEvents, eventColumnName, dailyPlannerEventData});

//--------------------------end------------------------------------------------------------




//--------------------------------------------------Main Starts-------------------------------------------------------------------

  totalEvents = getTotalEvents(mainSheet, {eventColumnName, startingRowNumber}); 


  createTaskData(mainSheet, {totalTasks, startingRowNumber, taskListColumnName}, taskIdToDetail);
  
 //Filling the unique events data ex: bath-> completedDates : [14,16]
  eventListProcessing(mainSheet, {totalEvents, startingRowNumber, eventColumnName}, uniqueEvents, taskIdToDetail);

 
 //Sorting the completedDates of each event in desending order so the recent date will in arr[0]
  sortingDatesDes(uniqueEvents);


  updateTaskListData(mainSheet, {taskIdToDetail, taskListColumnName});


  taskListProcessing(mainSheet, {totalTasks, startingRowNumber, taskListColumnName}, tomorrowsEvents);


 //Making the day planner
  prepareTomorrowEventsForNormalEvent(uniqueEvents, tomorrowsEvents);
 

 //Clear the daily planner list in excel and calender if any older data is present for new data inserstion
  clearDailyPlanner(plannerDataSheet, calenderApp, {dailyPlannerMaxRows, startingRowNumber, dailyPlannerColumnName })

 
  //Put the daily planner data from tomorrow events to excel
  createDailyPlanner(mainSheet, plannerDataSheet, calenderApp, {dailyPlannerColumnName, startingRowNumber, tomorrowsEvents, dailyPlannerEventData, taskListColumnName, taskIdToDetail });

}



//--------------------------------------------------Main Ends-------------------------------------------------------------------


//Helper functions for event adder-----------------------
  const readEventsForTheDay = (date, calenderApp)=> {
    const allEvents = calenderApp.getEventsForDay(date);

    let finalEvents = []

    allEvents.forEach(event => {

      const description = event.getDescription();
      let descriptionElements = description.split('\n');
      descriptionElements = descriptionElements.filter(element => element.length > 0);

      console.log(descriptionElements)

      finalEvents.push({
        "id": descriptionElements[0].split(":")[1].trim(),
        "isCompleted": descriptionElements[1].split(":")[1].trim(),
        "description": descriptionElements[2].split(":")[1].trim(),
        "doneAt": descriptionElements[3].split(":")[1].trim(),
        "timeTaken": descriptionElements[4].split(":")[1].trim()
      });
      console.log(finalEvents)
    });

    return finalEvents;
  }

  const updateEventListForTheDay = (mainSheet, otherData) => {
    //Find empty Row in event list

    //Loop through the eventsForInsert array
    for(let index = 0; index < otherData.eventsForInsert.length; index++) {
      let currentRow = otherData.startingRowNumber + 1 + otherData.totalEvents + index;
      let event = otherData.eventsForInsert[index];

      if(event && event.isCompleted) {
        //Find the object in the dailyPlannerEventData obj with event id as key
          let eventRefData = otherData.dailyPlannerEventData[event.id];

        if(eventRefData) {
          //Check if in the event obj description is empty
          // If empty then with with description columnRow name from the values go to the excel and get the description and update in the event des
          if(!event.description.length) 
            event["description"] = mainSheet.getRange(eventRefData.description).getValue();
          
          //Get the column names and insert the date des, category and other data 
          for(let j = 0; j < eventRefData.eventsConsumed.length; j++) {
            //Update date column
            mainSheet.getRange(otherData.eventColumnName["date"] + currentRow).setValue(otherData.lastEventDate);
            //Update Des column
            mainSheet.getRange(otherData.eventColumnName["description"] + currentRow).setValue(event.description);
            //Update category col
            mainSheet.getRange(otherData.eventColumnName["optionDropDown"] + currentRow).setValue(eventRefData.eventsConsumed[j]);

            mainSheet.getRange(otherData.eventColumnName["doneAt"] + currentRow).setValue(event.doneAt);
            mainSheet.getRange(otherData.eventColumnName["timeTaken"] + currentRow).setValue(event.timeTaken);


            currentRow = currentRow + 1;
          }
        }
      }
    }   
  }




//Helper ends-------------------------------------------------





//Helper functions for main-------------------------------------------------------------------------------------------------------------

//Task detail data insertion ex: {taskId : {rowNumber: taskRowNumber in excel}} in taskIdToDetail variable
const createTaskData = (mainSheet, otherData, taskIdToDetail) => {
  for(let index = 0; index < otherData.totalTasks; index++) {
      let currentRow = otherData.startingRowNumber + 1 + index;

      let taskId = mainSheet.getRange(otherData.taskListColumnName.id + currentRow).getValue();

      taskIdToDetail[taskId]= {
        "rowNumber": currentRow,
        "timeTaken": 0,
        "completedPercentage":0
      }
  }
}


//Reading the event list and for normal event pushing the dates in completedDated of respective events for processing
// For tasks fill the task detail data
const eventListProcessing = (mainSheet, otherData, uniqueEvents, taskIdToDetail) => {

  for(let index = 0; index < otherData.totalEvents; index++) {
      let currentRow = otherData.startingRowNumber + 1 + index;

      let selectedOption = mainSheet.getRange(otherData.eventColumnName.optionDropDown + currentRow).getValue()?.toLowerCase();
      let dateVal = new Date(mainSheet.getRange(otherData.eventColumnName.date + currentRow).getValue());

      if(selectedOption == "task") {
        let id = mainSheet.getRange(otherData.eventColumnName.taskId + currentRow).getValue();
        let timeTaken = mainSheet.getRange(otherData.eventColumnName.timeTaken + currentRow).getValue();
        let completedPercentage = mainSheet.getRange(otherData.eventColumnName.completedPercentage + currentRow).getValue();

        if(taskIdToDetail[id]) {
          taskIdToDetail[id] = {
            ...taskIdToDetail[id], 
            timeTaken: taskIdToDetail[id].timeTaken + timeTaken, 
            completedPercentage: taskIdToDetail[id].completedPercentage + completedPercentage
          }
        }
      } else {
        uniqueEvents[selectedOption] && uniqueEvents[selectedOption].completedDates.add(dateVal.getTime())
      }
  }
}

//For normal events sorting the completedDates for the respective events in descending order
const sortingDatesDes = (uniqueEvents)=> {
  Object.keys(uniqueEvents).forEach(event => {
    uniqueEvents[event].completedDates = Array.from(uniqueEvents[event].completedDates)
    uniqueEvents[event].completedDates = uniqueEvents[event].completedDates.sort(function(a, b){return b-a});
  })
}

//Update the task list for time and percentage from event list data
const updateTaskListData = (mainSheet, otherData) => {
  Object.keys(otherData.taskIdToDetail).forEach(taskId => {
    let taskDetail = otherData.taskIdToDetail[taskId];
    mainSheet.getRange(otherData.taskListColumnName.actualTimeTaken + taskDetail.rowNumber).setValue(taskDetail.timeTaken ? parseFloat(taskDetail.timeTaken/60).toFixed(2) : 0);
    mainSheet.getRange(otherData.taskListColumnName.completedPercentage + taskDetail.rowNumber).setValue(taskDetail.completedPercentage);
    
    mainSheet.getRange(otherData.taskListColumnName.isCompleted + taskDetail.rowNumber).setValue(!!(taskDetail?.completedPercentage == 100));
    
  })
}

//Read the task list and prepare tomorrow events of tasks
const taskListProcessing = (mainSheet, otherData, tomorrowsEvents) => {
  for(let index = 0; index < otherData.totalTasks; index++) {
      let currentRow = otherData.startingRowNumber + 1 + index;

      const isCompleted = mainSheet.getRange(otherData.taskListColumnName.isCompleted + currentRow).getValue();
      const isNotNeeded = mainSheet.getRange(otherData.taskListColumnName.notNeeded + currentRow).getValue();
      const taskId = mainSheet.getRange(otherData.taskListColumnName.id + currentRow).getValue();
      

      if(!isCompleted && !isNotNeeded) {
        let toBeDoneAt = mainSheet.getRange(otherData.taskListColumnName.toBeDoneAt + currentRow).getValue();
        toBeDoneAt = toBeDoneAt ? new Date(toBeDoneAt) : '';
        if(toBeDoneAt) {
          if(toBeDoneAt.toDateString() == plannerDate.toDateString()){
            tomorrowsEvents.push({dailyPlannerEvent: "taskDoneAt_OnDeadline", taskId, type: "task"});
          } else if(toBeDoneAt.getTime() < plannerDate.getTime()) {
            tomorrowsEvents.push({dailyPlannerEvent: "taskDoneAt_PastDeadline", taskId, type: "task"});
          } 
        }else {
          let startsAt = mainSheet.getRange(otherData.taskListColumnName.startsAt + currentRow).getValue();
          startsAt = startsAt ? new Date(startsAt) : ''
          if(!startsAt || startsAt.getTime() < plannerDate.getTime() || plannerDate.toDateString == startsAt.toDateString()) {
            let donotDoAt = mainSheet.getRange(otherData.taskListColumnName.donotDoAt + currentRow).getValue();
            if(typeof donotDoAt == "object")
              donotDoAt = [donotDoAt.toDateString()];
            else 
              donotDoAt = donotDoAt.split(",");
            let isPlannerDateIsADonotDoAtDate = false;
            donotDoAt.forEach(donotDoDate => {
              if(new Date(donotDoDate).toDateString() == plannerDate.toDateString()) {
                isPlannerDateIsADonotDoAtDate = true;
              }
            })
            if(!donotDoAt[0] || !isPlannerDateIsADonotDoAtDate){
              const toBeDoneBy = new Date(mainSheet.getRange(otherData.taskListColumnName.toBeDoneBy + currentRow).getValue());
              if(toBeDoneBy.getTime() > plannerDate.getTime()) {
                tomorrowsEvents.push({dailyPlannerEvent: "taskDoneBy_FutureDeadline", taskId, type: "task"})
              } else if(toBeDoneBy.toDateString() == plannerDate.toDateString()){
                tomorrowsEvents.push({dailyPlannerEvent: "taskDoneBy_OnDeadline", taskId, type: "task"})
              } else {
                tomorrowsEvents.push({dailyPlannerEvent: "taskDoneBy_PastDeadline", taskId, type: "task"})
              }
            }
          }
        } 

      }

  }
}

//Is current event has to appear in the day planner
const prepareTomorrowEventsForNormalEvent = (uniqueEvents, tomorrowsEvents) => {
  Object.keys(uniqueEvents).forEach(event => {
    const lastEventCompletedDay = uniqueEvents[event].completedDates[0];
    let dayElapsed = (plannerDate.getTime()) - (lastEventCompletedDay ? lastEventCompletedDay : 0);
    dayElapsed = Math.round(dayElapsed / one_day).toFixed(0); 
  
    if(parseInt(dayElapsed) >= uniqueEvents[event].interval) {
      switch(event){
          case "bath": {
            const onlyShampooElementIndex = tomorrowsEvents.findIndex(e=> e.dailyPlannerEvent == "onlyShampoo");
            if(onlyShampooElementIndex != -1) {
              tomorrowsEvents.splice(onlyShampooElementIndex, 1);
              tomorrowsEvents.push({dailyPlannerEvent: "bathWithShampoo", type: "normalEvent"});
            } else
              tomorrowsEvents.push({dailyPlannerEvent: "normalBath", type: "normalEvent"});
            break;
          }
          case "shampoo": {
            const normalBathElementIndex = tomorrowsEvents.findIndex(e=> e.dailyPlannerEvent == "normalBath");
            if(normalBathElementIndex != -1) {
              tomorrowsEvents.splice(normalBathElementIndex, 1);
              tomorrowsEvents.push({dailyPlannerEvent: "bathWithShampoo", type: "normalEvent"});
            } else
              tomorrowsEvents.push({dailyPlannerEvent: "onlyShampoo", type: "normalEvent"});
            break;
          }
          case "antidshampoo": {
            const bathWithShampooElementIndex = tomorrowsEvents.findIndex(e=> e.dailyPlannerEvent == "bathWithShampoo");
            if(bathWithShampooElementIndex != -1) {
              tomorrowsEvents.splice(bathWithShampooElementIndex, 1);
              tomorrowsEvents.push({dailyPlannerEvent: "bathWithAntiDShampoo", type: "normalEvent"});
            }
            break;
          }
          case "excercise": {
          }

          default: {
            tomorrowsEvents.push({dailyPlannerEvent: event, type: "normalEvent"});
            break;
          }
      }
    }
  });
}

//Clear the daily planner list
const clearDailyPlanner = (plannerDataSheet, calenderApp, otherData) => {

  for(let index = 0; index<otherData.dailyPlannerMaxRows; index++) {
    const currentRow = otherData.startingRowNumber + 1 + index;
    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.type + currentRow).setValue("");
    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.description + currentRow).setValue("");
    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.duration + currentRow).setValue("");

    const calenderEventId = plannerDataSheet.getRange(otherData.dailyPlannerColumnName.calenderEventId + currentRow).getValue();
    if(calenderEventId){
      const calenderEvent = calenderApp.getEventById(calenderEventId);
      const eventDate = new Date(calenderEvent.getStartTime());
      //Delete from calender only if events exist for the plannerDate
      if(calenderEvent && (eventDate.toDateString() == plannerDate.toDateString())) {
        try{
          calenderEvent.deleteEvent();
        } catch(error) {
          if(!error.message.includes("it has already been deleted")){
            throw error;
          }
        }
      }
    }
    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.calenderEventId + currentRow).setValue("");

  }
}


//Put daily planner value
const createDailyPlanner= (mainSheet, plannerDataSheet, calenderApp, otherData) => {

  let tasksAlreadyAddedInCalender = {};
  let normalEventAlreadyAddedInCalender = 0;

  //Setting the daily planner header
  plannerDataSheet.getRange(otherData.dailyPlannerColumnName.description + otherData.startingRowNumber).setValue("Day Planner Of: " + plannerDay);
  otherData.tomorrowsEvents.forEach((event, i) => {
    let templateString = mainSheet.getRange(otherData.dailyPlannerEventData[event.dailyPlannerEvent].description).getValue();
    const fontColor = mainSheet.getRange(otherData.dailyPlannerEventData[event.dailyPlannerEvent].description).getFontColor();
    const timeNeeded = mainSheet.getRange(otherData.dailyPlannerEventData[event.dailyPlannerEvent].timeNeeded).getValue();
    const type = mainSheet.getRange(otherData.dailyPlannerEventData[event.dailyPlannerEvent].type).getValue();

    const dailyPlannerCurrentRow = otherData.startingRowNumber + 1 + i;

    let calenderEvent = null;
    if(event.type == "task") {
      const taskRowNumber = otherData.taskIdToDetail[event.taskId].rowNumber;
      let taskDescription = mainSheet.getRange(otherData.taskListColumnName["description"] + taskRowNumber).getValue();
      let toBeDoneAt = mainSheet.getRange(otherData.taskListColumnName["toBeDoneAt"] + taskRowNumber).getValue();
      let toBeDoneBy = mainSheet.getRange(otherData.taskListColumnName["toBeDoneBy"] + taskRowNumber).getValue();
      let completedPercentage = mainSheet.getRange(otherData.taskListColumnName["completedPercentage"] + taskRowNumber).getValue();

      let deadline = ["taskDoneAt_PastDeadline", "taskDoneAt_OnDeadline"].includes(event.dailyPlannerEvent) ? new Date(toBeDoneAt) : new Date(toBeDoneBy);
      let dayElapsed = (plannerDate.getTime()) - (deadline ? deadline.getTime() : 0);
      dayElapsed = Math.abs(Math.round(dayElapsed / one_day).toFixed(0));

      templateString = templateString.replace("$", dayElapsed);
      templateString = templateString.replace("#", +completedPercentage)

      templateString = `[${event.taskId}] ${taskDescription}. 
      ${templateString}`

      calenderEvent = createDailyPlannerInCalender(calenderApp, {templateString, type: event.type, tasksAlreadyAddedInCalender});
      tasksAlreadyAddedInCalender[event.taskId] = 1;
    } else {
      let toDoAt = mainSheet.getRange(otherData.dailyPlannerEventData[event.dailyPlannerEvent].toDoAt).getValue();
      toDoAt = toDoAt ? new Date(toDoAt) : addMinAndHourToDate(new Date(new Date().toDateString() + "," + "17:00:00"), 30*(normalEventAlreadyAddedInCalender+1));
      calenderEvent = createDailyPlannerInCalender(calenderApp, {templateString, toDoAt, type: event.type, id: event.dailyPlannerEvent});
      ++normalEventAlreadyAddedInCalender;
    }

    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.type + dailyPlannerCurrentRow).setValue(type);
    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.description + dailyPlannerCurrentRow).setValue(templateString).setFontColor(fontColor);
    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.duration + dailyPlannerCurrentRow).setValue(timeNeeded);
    plannerDataSheet.getRange(otherData.dailyPlannerColumnName.calenderEventId + dailyPlannerCurrentRow).setValue(calenderEvent.getId());
  })
}





//Add the planner events in google calender
const createDailyPlannerInCalender = (calenderApp, otherData) => {

  let calenderEvent = null;
  if(otherData.type == "task") {
    
    //Time calculation
    let startTimeForTask = new Date(plannerDate.toDateString() + "," + "11:00:00");
    let currentTaskStartTime = addMinAndHourToDate(startTimeForTask, 0, Object.keys(otherData.tasksAlreadyAddedInCalender).length);
    let endTime = addMinAndHourToDate(currentTaskStartTime, 0, 1);

//******************************Add id, idDone, when, timeTaken, description columns in the event in calender */
    calenderEvent = calenderApp.createEvent(
      otherData.templateString,
      currentTaskStartTime,
      endTime
    );

  } else {
    
    let startTime = new Date(plannerDate.toDateString() + "," + otherData.toDoAt.getHours() + ":" + otherData.toDoAt.getMinutes() + ":00");
    let endTime = addMinAndHourToDate(startTime, 30);

    calenderEvent = calenderApp.createEvent(
      otherData.templateString,
      startTime,
      endTime, 
      {
        description: `Id: ${otherData.id}`+ '\n\n' +
        
                      'Is it done (Yes/No):' + '\n\n' +

                      'Description:' + '\n\n' +

                      'When done (2pm):' + '\n\n' +

                      'Time taken (10):'
      }
    );
    
  }

  //Guest
  calenderEvent.addGuest("biswajit.important@gmail.com");
  calenderEvent.setGuestsCanModify(true);
  return calenderEvent;
}


//Helper function ends-------------------------------------------------------------------------------------------------------------





//Basic Helpers ---------------------------------------------------------------------
const getTotalEvents = (mainSheet, otherData) => {
  return mainSheet.getRange(otherData.eventColumnName.optionDropDown + otherData.startingRowNumber).getValue();
}

const addMinAndHourToDate = (dateTime, minutesToAdd = 0, hoursToAdd = 0,) => {
  let newDate = new Date(dateTime.getTime());
  minutesToAdd && newDate.setMinutes(newDate.getMinutes() + minutesToAdd);
  hoursToAdd && newDate.setHours(newDate.getHours() + hoursToAdd);
  return new Date(newDate)
}

//Basic Helpers ends---------------------------------------------------------------------


