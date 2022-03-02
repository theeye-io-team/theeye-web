# Monitors

[![theeye.io](../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Monitor type: 

### Stats

Checks your Hosts' stats \(health\) and triggers alerts when thresholds are exceeded. You can set your own thresholds from the monitors panel.

![stats monitor](../images/monitor_stats.gif)

### Script

Create a script and use the output log to monitor a state when other monitor does not suit your needs. This is an example script to check if a bridge is running.

![script monitor](../images/monitor_script.gif)

### API/WEB check

Sends a request to and endpoint and checks for an expected answer. Custom payload and custom expected responses are allowed.

![request monitor](../images/web_api.gif)

### Process

Verifies that a process is running \(e.g. daemon\)

![process monitor](../images/monitor_process.gif)

### File

A File monitor will upload a file to a server and ensure that the file remains as created in the destination path you provided. Most common use is to push a configuration file. The file can be updated at any time directly from the monitor box.

![file monitor](../images/createMonitorFile.gif)

### Nested

A nested monitor is a special monitor that contains other monitors. This kind of monitor will notify when all the contained monitors needs attention. You can create a nested monitor from the dashboard, using the "+" button.

![nested monitor](../images/nestedmonitors.jpg)

Name your "nested Monitor" or copy an already created one. Add or remove the monitor you'd like to nest.

![nested monitor setup](../images/nestedmonitorssetup.jpg)

## List monitors via API

Check the [API Documentation](/en/integrations/api/list_monitors_via_api) for more details.
