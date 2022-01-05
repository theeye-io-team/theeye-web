# Eventos

[![theeye.io](../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

Los eventos y acciones que los usuarios y recursos realizan están siendo constántemente despachados y notificados. La información generada puede pedirse en tiempo real y guardarse para análisis y rastreo en el futuro.

## Estrctura

Cada evento puede identificarse por alguno de estos atributos:

- Topic
- Date and time
- Hostname
- Organization (Customer)
- Operation (e.g. CRUD)
- Index (event type description)

Data is consistenly organized in different indexes (tasks, monitors, hosts, file and agent).

### Types

##### CRUD Events

Every time a CRUD action is performed (POST, PUT, DELETE) an event is emitted as follow:

The topic matches the API-crud format, where API is the model name. An "operation" key is added to the event data.

For example, you'll find a _monitor_ operation as a monitor-crud topic.

##### Non-CRUD Events

This is the list of fixed Non-CRUD events implemented so far:

- **agent-version**: every time the agent version is updated.
- **host-stats**: every time host-status is updated
- **monitor-execution**: every time the agent sends an update for a monitor execution
- **monitor-state**: every time a monitor status changes (failure, recovery, stop, change-file)
- **triggered-webhook**: every time a webhook is played
- **task-execution**: every time a task is played
- **task-result**: every time a task excution ends

### Topics

```json
{
   "monitor":{
      "crud":"monitor-crud",
      "execution":"monitor-execution",
      "state":"monitor-state"
   },
   "script":{
      "crud":"script-crud"
   },
   "agent":{
      "version":"agent-version"
   },
   "file":{
      "crud":"file-crud"
   },
   "hostgroup":{
      "crud":"provisioning-crud"
   },
   "host":{
      "integrations":{
         "crud":"host-integrations-crud"
      },
      "crud":"host-crud",
      "state":"host-state",
      "processes":"host-processes",
      "stats":"host-stats",
      "registered":"host-registered"
   },
   "task":{
      "crud":"task-crud",
      "execution":"task-execution",
      "sent":"task-sent",
      "result":"task-result",
      "cancelation":"task-cancelation",
      "terminate":"task-terminate"
   },
   "workflow":{
      "execution":"workflow-execution"
   },
   "job":{
      "crud":"job-crud"
   },
   "webhook":{
      "crud":"webhook-crud",
      "triggered":"webhook-triggered"
   },
   "scheduler":{
      "crud":"scheduler-crud"
   }
}
```
