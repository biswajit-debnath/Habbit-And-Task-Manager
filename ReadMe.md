# Daily Planner 📅

Welcome to the **Daily Planner** project! This project helps you manage your daily tasks and events efficiently using Google Sheets and Google Calendar. 

## Table of Contents
- Features
- Setup
- Usage
- Code Overview
- Contributing
- License

## Features ✨
- **Automated Event Management**: Automatically reads events from Google Calendar and updates the event list in Google Sheets.
- **Task Management**: Manages tasks with details like description, deadlines, and completion status.
- **Daily Planner Creation**: Generates a daily planner with tasks and events, and updates Google Calendar.
- **Customizable Intervals**: Supports unique events with customizable intervals (e.g., bath, shampoo, exercise).

## Setup 🛠️
1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/daily-planner.git
    cd daily-planner
    ```

2. **Create a Google Sheet along that create a apps script project**:
    - Create a new Google Sheet named `Daily Planner`.
    - Create a new Google Apps Script project within the Google Sheet.
    - Copy the contents of the [`DailyPlanner.js`](DailyPlanner.js ) file into the Apps Script editor.
    - Save the script and set up the necessary triggers.
   

3. **Google API Setup**:
    - Enable the Google Sheets and Google Calendar APIs.
    - Obtain the necessary credentials and save them in your project directory.

4. **Configure the project**:
    Update the necessary configuration in the [`DailyPlanner.js`](DailyPlanner.js ) file, such as sheet names and calendar settings.

## Usage 🚀
1. **Run the Daily Planner**:
    Open the Daily Planner Google Sheet and click the execute button on the sheet. This will trigger the script to read events, process tasks, and generate the daily planner.

2. **Check Google Sheets**:
    Check your Google Sheet to see the updated event and task lists.

3. **Check Google Calendar**:
    Open your Google Calendar to see the scheduled events for the day.

## Code Overview 🧩
### Main Function
The main function is [`DailyPlanner`](DailyPlanner.js ) which orchestrates the entire process:
- Reads events from Google Calendar.
- Updates the event list in Google Sheets.
- Processes tasks and unique events.
- Generates the daily planner and updates Google Calendar.

### Helper Functions
- **[`readEventsForTheDay`](DailyPlanner.js )**: Reads events from Google Calendar for a specific day.
- **[`updateEventListForTheDay`](DailyPlanner.js )**: Updates the event list in Google Sheets.
- **[`createTaskData`](DailyPlanner.js )**: Creates task data from the task list.
- **[`eventListProcessing`](DailyPlanner.js )**: Processes the event list and updates unique events.
- **[`sortingDatesDes`](DailyPlanner.js )**: Sorts completed dates for unique events in descending order.
- **[`updateTaskListData`](DailyPlanner.js )**: Updates the task list with time and completion percentage.
- **[`taskListProcessing`](DailyPlanner.js )**: Processes the task list and prepares tomorrow's events.
- **[`prepareTomorrowEventsForNormalEvent`](DailyPlanner.js )**: Prepares tomorrow's events for normal events.
- **[`clearDailyPlanner`](DailyPlanner.js )**: Clears the daily planner list in Google Sheets and Calendar.
- **[`createDailyPlanner`](DailyPlanner.js )**: Creates the daily planner and updates Google Sheets and Calendar.
- **[`createDailyPlannerInCalender`](DailyPlanner.js )**: Adds planner events to Google Calendar.

### Basic Helpers
- **[`getTotalEvents`](DailyPlanner.js )**: Gets the total number of events.
- **[`addMinAndHourToDate`](DailyPlanner.js )**: Adds minutes and hours to a date.

## Contributing 🤝
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License 📄
This project is licensed under the MIT License. See the LICENSE file for details.

---

Thank you for using **Daily Planner**! We hope it helps you stay organized and productive. 😊