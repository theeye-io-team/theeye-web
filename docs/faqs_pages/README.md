# TheEye FAQ

[![theeye.io](../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

This page provides help with the most common questions about TheEye.

You can also search all TheEye's help pages using the search box to the right, or browse the Nav menu or the Help directory.

# FAQs from ours users about:

## Cloud providers

### AWS

#### Count restarts in ECS/Fargate:

*Consult with the support team, for a recipe and updated script.*

The metric exposed by ECS / Fargate do not currently have a restart count.
ECS only sends to cloudwatch the use of cpu, mem of each cluster / service. On the other side of the ECS api, these data can be extracted from each cluster / service, for example:

 
```json
{
  "status": "ACTIVE",
  "statistics": [],
  "tags": [],
  "clusterName": "jenkins-slave-comafi",
  "registeredContainerInstancesCount": 1,
  "pendingTasksCount": 1,
  "runningTasksCount": 0,
  "activeServicesCount": 0,
  "clusterArn": "arn:aws:ecs:us-east-1:104455529394:cluster/jenkins-slave-comafi"
}
```

You can also check all the information of deployments, containers, events, etc.

##### Monitor ejemplo: "ECS clusters status monitor"

*Consult with the support team, for a recipe and updated script.*

This monitor helps you find fast, for example: when a cluster did not correctly complete a deployment and was stuck trying to start a new container.

The monitor goes through all the clusters are fargate or ecs, you can add a filter to show only fargate.

You could also make another monitor to alert when the use of cpu / mem of a cluster exceeds a certain limit.

## Resources

### Monitors

#### Monitor sending duplicate alerts

*We have an alert (Status Monitor) that is triggered 3 times in a minute if it is set to check availability every 30 sec.*

This may occur because the monitor was running for a longer time than the monitor's check frequency (in this case 30s)
               
If it is required to run a monitor with frequency of 30s. It is recommended to add a timeout < to 30s, to ensure that it finishes its execution before it enters queue the next check.
For example, for this you can add to the command curl: -m 10 (wait for 10s).
In this way they should avoid those cases of repetition of alerts.

#### Load balancers: tomcat

A monitor that alerts when some tomcat of the pools: HBI, HBE are failing.


### Scripts

#### I changed the script of a monitor / task and it was modified in all those that referred to that script.

If you change a script and several have associated that script, you change it for everyone.
If you want to make a "fork" then you create a new one
Follow the logic of changes in one place.
then you can have 20 monitors or tasks that only differ from the arguments and use the same script, that way you keep a single script


