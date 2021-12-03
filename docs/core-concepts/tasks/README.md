# Tasks

[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

With TheEye we can create different types of Tasks.
A Task can also be considered as a template for a Job.

## Create and modify tasks

Creating a task is simple, from the dashboard, click in the "+" button to open the resources menu > click the "Task Button" (Play Icon) to create a new task.
Then select the task type you want to create. A task can be modified directly from the Dashboard.

![](../../images/newTaskDashboard.gif)

You can also create, edit and delete tasks from the Tasks Admin page.

## Types of Task

### Script

Script Tasks requires a BOT to run. This task defines the set of orders and actions that the Bot must do. Actions are described as basic scripts.

Click on "advanced options" for further features. 

![Script Task - advanced options](../../images/advancedoptionstask.jpg)

### Webhooks or HTTP Request

Check the [Webhooks](/core-concepts/webhooks/) for more details.

### Approval:

Approval tasks handle approval requests in workflows. As breakpoints do, an approval task will pause the workflow execution until it is approved or rejected. Many approvers can be selected, only one approval is needed to continue workflow actions.

### Input:

An input task is a special task commonly used to start workflows. When executed, the input parameters will be submitted directly to the next chained task in the workflow.

### Notification:

Check the [Task Notifications](/core-concepts/tasks/taskNotifications) for more details.

## Task Arguments.

To received input values into tasks it is required to define the Task Arguments.
It is important to define the arguments in the same order in which they will be used in the script.

| Type | UI Usage | Workflow Usage |
| ----- | ----- | ----- |
| Fixed | will not be visible to users into forms | this is a fixed value that will be always the same. cannot be rewrited or replaced |
| Text | a free text input | it is usefull to receive dynamic values from outputs to inputs |
| Options | create an options element | behave as Text Argument |
| Remote Options | create an options element using the response of a Remote API. It is posible to include the email of the user executing the task at the momento of the fetch. This will be achived including the keyword %THEEYE_USER_EMAIL% in the queystring of the url of remote api. Example url http://tracking-tool.domain.com/tickets?user=%THEEYE_USER_EMAIL% | behave as Text Argument |
| Date | create a Date Picker element | behave as Text Argument |
| Email | creates a text input that only accepts email strings | behaves as Text Argument |
| File | create a File Selection element | when it is used with Script Tasks the uploaded file will be downloaded and the argument will contain the local path to the file. |
| RegExp | creates a text input that only accepts regular expression and validate the format | behave as Text Argument |


## Task Scheduler.

You can use the task scheduler to create and manage tasks that TheEye will carry out automatically at the times you specify. 
Task Scheduler can be created using natural language or cron expressions. The main difference between them is that cron expressions is executed always at the exact same date and time. On the other hand, natural language could produce some time shift on successive executions.

Schedules can be created from the Dasboard as shown here below

![Dashboard - Task Menu](../../images/image-08.png)

Your new schedule will be shown when the task row is expanded:

![](../../images/schedule.gif)

## Export and Import Tasks

Inside TheEye community you will hear that other people had already solved or automated typical common problems using the platform. When this automation was performed by a task, you will be able to import the solution or on the other hand export and share the tasks you have created.

To export a task recipe, go to the task, click on the context menu, and then click on the "export recipe" icon as shown here:

![Dashboard - Task Export](../../images/exportecipe.gif)



## Integration through API

Check the [Integration through API documentation](/api/) for more details.

## Executing Tasks

Tasks can be executed using different methods.

* UI Play Button
* Integration API Call
* Workflows
* Triggers
* Webhooks
