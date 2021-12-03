# Introduction to TheEye

[![theeye.io](images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## What is TheEye?

**TheEye** works as an _automation platform_. Depending on your use case it can be both an _automation platform as a service_ or an _automation service platform_. You may use it as:

* A remote server management and a monitoring tool \(Devops\)
* A server provisioning tool
* A task manager \(with scheduler\)
* A Workflow creation tool \(IFTTT\)
* A technical knowledge base repository
* An integration and automation platform
* A Real time support tool

It allows you to **monitor** and manage **resources**, launch and **schedule** **tasks**, write and/or upload **scripts**, build **workflows** through a series of **task** results or even **trigger** specific **tasks** or **workflows** as a response to one of your **monitor events**. All this is done from the web interface or the mobile app.

The **bolded keywords** in the above paragraph are all core concepts of TheEye.

## Domain vocabulary

TheEye consists on the core _**orchestation**_ platform running in a SaaS infrastructure. The _**orchestrator**_ receives _**bots**_ and _**clients**_ connections.
It works as a finite-state machine to keeps track of _**monitors**_ and _**indicators**_ states, _**tasks**_ and _**workflows**_ execution results,
and trigger _**notifications**_ on _**events**_.
It helps maintains _**scripts**_ and _**files**_.

[Monitors](./core-concepts/monitors.md).

[Bots/Agents](./core-concepts/agent/).

[Tasks](./core-concepts/tasks/).

[Workflows](./core-concepts/tasks/workflows.md).


A _**client**_ is any means capable of connecting to the _**core platform**_ through a secure protocol and gain access with valid credentials. TheEye provides a web UI as it's main _**client**_, but alternative connection mechanisms can be implemented and any of them would fall under the _**client**_ category.

A _**host**_ is any instance, server or machine the _**user**_ wants to _**monitor**_ or control. The _**host**_ must have internet access, the _**agent**_ installed and configured and be able to reach the _**core platform**_.

A _**user**_ is any valid identification registered on the _**core platform**_. Active _**users**_ have a unique email address and are responsible for their own passwords to be strong and secure.

Once a _**user**_ registers, a unique key/secret pair is assigned to his/her account. This key/secret pair must be used to configure any _**agent**_ installed by the _**user**_ so the _**core platform**_ can secure the encrypted communication between the _**host**_, the _**client**_ and the _**core platform**_ itself.

_**Tasks**_ are, well, _**tasks**_. They are the means of the _**core platform**_ to instruct _**agents**_ to execute _**scripts**_ and routines. When a _**user**_ creates a _**task**_ the _**core platform**_ stores any _**scripts**_ and/or options for the _**task**_ and assigns it to the _**host**_. _**Tasks**_ can be launched, _**scheduled**_ for one time or periodic execution, or even be _**triggered**_ by some _**monitor event**_ or _**workflow**_.

The _**user**_ can upload or write _**scripts**_. _**Scripts**_ are stored on the _**core platform**_ and provided to the _**agent**_ when a _**task**_ needs to be executed.

A _**monitor event**_ is...

A _**trigger**_ is what happens when...

A _**workflow**_ consists in a...


