# CHANGELOG

### force build 1

### 0.8.2 - 2017-02-28

* c9772fa replace uid/gid  > user/group
* 184794f set uploaded file to source. do not convert json to object
* a60dfa7 fix task/monitor clone. fix searchbox
* 8726c97 customer selection
* ddf64a2 task and monitor actions with error validation
* 6d641ed Monitors server submit error validation
* 833cf37 show hide file access setup
* 22803c1 Title help texts


### v0.8.1 - 2017-02-24

* Merged in development (pull request #9)

	Development

> Title help texts

> show hide file access setup

> Monitors server submit error validation

> task and monitor actions with error validation

> customer selection

> fix task/monitor clone. fix searchbox

> set uploaded file to source. do not convert json to object

* Title help texts

* build process to handle css concat and min

* file icon

* reduce font size for stat graph

* auto adjust stat bars on resize and re-render

* prod build, focus on dashboard, files mods for windows

* Add chat - slack integration

* resize bar and adjust width

* fix syntax to work with the minify

* generate a hash for the day

* stats progress-bar style

* webhook page remove confirmation

* organize icons

* add missing help icons . use help component everywhere

* every page title with help icon. help icon opacity

* aligned all mass-action icons and page titles


### v0.8.0 - 2017-02-13

> change scrollbar size     

> change dashboard icons    

> new reactive stats page          

>> updated to new style/css.     

>> add socket update to load average and last update.       

>> resource state is not updated via socket yet.       

>> page is now reactive, was migrated to backbone view       

>> added routing, controller, view components       

>> psaux module was re-used       

>> hoststats part is in progress       

> file monitor form        

> file selector component       

> file form component        

> customers config validation in customers page       

> set correct status on socket response       

> validate error and host on dstat socket subscription        

> reestructure js application code      

> added grunt task to rename js bundle in production env         

> validate failure state and icon determination in dashboards     

> name is name , description is description       

> add help icon in forms inputs        

> fix group in new dashboard      


### v0.7.0 - 2016-12-04

> improve proxy /api/ endpoint       

> added resources and task folding (hide/show) in dashboard page       

> agent binary path and named via configuration file 

> improve site style

> added new landing page with calculator

> removed run external logic

> mass selector on webhooks

> improve scripts upload feature (remove dropzone)

> cleanup scheduler and task controllers      

> improve navigability

> some improvements in customer and credentials

>> remove proxy methods to the api in customer page             

>> added login user in top right corner          

>> added input to display and set customers configuration (json-only)           

>> added link to display webhooks workflow from webhook page         

>> remove unused fetchs from events/dashboard page       

>> in dashboard page, if it is a viewer hide tasks part, only display          

>> monitors        

>> fix and improve css          

> allow to edit customer and users extra data

> new dashboard with backbone , group by tags and filtering. (missing tasks execution)    

> added acl's selection 

> allow to hide tasks and show stats from kibana

> allow to edit customers configuration (elasticsearch and kibana panel)

> added feature to clone and copy monitors (directly from rows and within forms)

> easter eggs - ToastyAlert & MarioWalk     


### 0.6.3 - 2016-10-18

> workflow page         

> added workflow link into task and monitors , in events page        

> schedule page            

> fixed minors bugs and styles      

> improved main welcome documentation (how to create monitors and tasks)         

> added footer with Copyright       

> added powershell syntax and extensions to combo      

> remove ugly code and console.logs      


### 0.6.2 - 2016-10-13

> change modals behaviour            

> remove public check from task and script form            

> fix task form script arguments selection             

> theeye-client build-in         

> remove port validation           

> tmp workflow controller/view/js source            

> password reset        

> acl improve legibility          

> fix when agent user is not present                   

### 0.6.1 - 2016-10-07

> set is_regexp and raw_search (pattern replacement) for the search .   

### 0.6.0 - 2016-10-06

> create proxy api controler - redirect authenticated requests to the supervisor     

> minor fix when agent user does not exists      

> hide admin menu to user credential      

> improve acl's legibility      

> added webhook page     

> remove unused scripts and extra requires      

> added webhook UI functions CRUD      

> added cookies lib     

> improved script edit/create change handler. Added class to edit/create script button. Fixed some tweaky values on css



### 0.5.2 - 2016-09-26

> moved several js files to grunt build directory. files are added automatically to the site and production bundle      

> remove manual inclusion of js from ejs views     

> ScraperForm view migrated to Backbone.View (allow .extend)       

> TaskScraperForm created to include inputs that allow Event- *>* -Task mecanism     

> emprolijed profile section, added copy-to-clipboard functionality to tokens, div classes, etc

> css hiccups fix, including:

  - container-fluid for profile page container
  - container padding-top failing its job
  - footer's z-index for always on top
  - info-container min-height lowered to 20px
  - tooltip placement for settings manager (nav menu)

> corrected behaviour of modal over modal on task scheduler

> removed some styling on `<input>`

> added script types support: batchfile, python and php

> added filename preview

> changed how script filenames are submitted

### 0.4.3 - 2016-09-13

> show user agent credentials for current customer logged in user      

> fixed host dstat page . added js validation and show resource status       

> used fetch from theeye-client instead of custom resource fetch method      

> added query via querystring       

### 0.4.2 - 2016-09-10

> set default looptime in monitor when not selected        

> allow to change dstat description       

> hide psaux edit button, did nothing      

### 0.4.1 - 2016-09-09

> show scraper task result as json .       

> fix and organize code to display tasks result . unify the code     

> fix styles and wrong use of HTML properties in elements     

### 0.4.0 - 2016-09-08

> added web scraper form the posibility to submit custom request and respose parameters       

> put resouce methods into a namespace       

> put resource extract form data in global namespace       

> added loop duration interval to dstat monitor        

> added tooltips with help in scraper form          

> added cancel schedule functionality        

> restored edit monitors button functionality (pre search)        

> refactored btn-default / btn-primary styling on all main screens        

> added some styles for calendar view       

> double modal on schedule delete has some funny behaviour       

> needs client update, will crash backend on any schedule delete interaction       

> added script_uploaded listener to catch the script modal save operation on admin/monitor layout      

> added handlebars for javascript client side template     

> added grunt handlebars compile task       

> scraper-monitor is no longer handled the same way as the rest of the monitors          

> added scraper handler and form renderer client side          

> remove jst template compiler (not being used)        

> added scraper template       

> monitor template scraper use scraper-template      

> added handlebars, underscore and backbone        

> created assets/js/app directory for new structured code      

> removed scraper.config.request_options & response_options      

> move jquery to assets and include automatically in build process     

> add assets/js/app/**/*.js to build process       

> organize js client dependencies       

> added underscore , move lodash _. to lodash. with no conflict         

> added web scraper on template & web scraper task creation and execution        

### 0.3.2 - 2016-08-22

> moved scheduled method from PalancaController to TasksController         

> added getSchedule to TasksController and refactored assets/js/application/tasks.js and routes properly       

> moved schedule form buttons on top of calendar      

> package updated with `theeye-client v0.9.3`     


### 0.3.1 - 2016-08-22

> added tags in task and monitor creation and edition     

> added missing task script run as in task creation      

> update theeye-client usaga and calls. remove proxy methods for resource/monitor and task       

> update some texts


### 0.3.0 - 2016-08-19

> change texts       

> add script run as in task and script-monitor      

> remove some complex validation and delegate to the api. the web is a proxy to the api    

> correct some inputs with initial data     

> remove unused files     

> now the source support node.v4 , change version 0.12 to version 4

> improve user registration, invitation and local passports initialization & creation     

> improve user invitation to customers     

> correct theeye-client validations to don't break the web when fails    

> remove unused initial scripts (run.sh & run.debug.sh)      

> add user creation validations , improve validations       

> add theeye passport to the profile page     

> remove ninja code and wrong responces         

> improve identation    

> fix sockets initialization     

### 0.2.0 - 2016-08-03

> rename environment variabe required to set socket connection uri.

> socket debug mode on when `NODE_ENV != production`

### 0.1.0 - 2016-07-29

> added CHANGELOG.md

> use direct hostname to connect sockets instead of LB. HA ready

> socket.io & sails.io.js separated in two files.

> sails.io.js return a function to initialize.

> sails.io configuration can be set from outside the library now (including connection url)

> remove deprecated old files

> packages version fixed to the last & current being used.

> minor bug fixing.
