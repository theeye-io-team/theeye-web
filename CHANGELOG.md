# CHANGELOG

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
