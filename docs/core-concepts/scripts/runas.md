# Scripts Run As... and permissions

[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Scripts runs by default in this way:

* on Linux: adding execution permission to the file and including the intepreter Hash in the first line.
* on Windows: setting the interpreter that should use the OS by the file extension.

Script RunAs allows to ejecute the script in a specific way, by using a different binary interpreter or in Linux using sudo. **Remember that** _**RunAs**_ **is part of the** _**Tasks'**_ **configuration, as** _**Tasks**_ **are responsible for Scripts' execution**. 

Please check the [Script Task Documentation](/core-concepts/scripts/) section for further details.

## Notation

The runas text could be any command line combination, using fixed variables, environment settings, command or anything that agent user\(by default theeye-a\) can do within the default shell \(usually bash or cmd\). We recommend to keep it simple and short. The only requirement is that the runas has to include the %script% KEYWORD. This KEYWORD indicates which part of the runas text will be replaced with the script path and its arguments.

## In Linux

### SUDO

To run the script using sudo, use one of the following runas syntax

1. Sending arguments to the script to execute
   -  Remember to add the " or the arguments won't be visible by the script

```bash
sudo -u user -c "%script%"
```

2. Run script without arguments

```bash
sudo -u user $(%script%)
```

### Custom binaries

Some times is required to run the script with a binary which is not registered in the global or user paths.

One case is to run a Nodejs script with a different interpreter version. To achive that include the full path to the interpreter in the `runas`

```bash
/usr/local/lib/nodejs/v4/bin/node %script%
```

## In Windows

The same aproach to execute custom scripts with unregistered interpreters apply both to Windows and Linux.

You will have to provide the absolute path to script interpreter.

### Understanding the Windows scenario ("Run as ..." and the interpreter)

NOTE: 

  - The language of the script must always be considered before loading the interpreter's pareameters.
  - Unlike linux, where the script and its interpreter are defined in its first line of code with the path and the interpreter (https://bash.cyberciti.biz/guide/Shebang). In Windows the inpreprete is a parameter inside the command executed in CMD.

**Scripts**

  - The interpreter is the "engine" that executes scripts.
  - Scripting languages in Windows:
    - Native options:
        - PowerShell
        - Windows Scripting Host
            - VBScript
            - JScript
        - Batch Files
    - Other options:
        - Javascript/NODE
        - Python
        - PHP
        - Perl
        - and more...

**Interpreter**

  - Windows interpreter (BAT/PS1)
    - It is installed by default on Windows 7 and Server 2008 R2 and later.
      - It can be downloaded for Windows XP SP3, Windows Server 2003 SP2, Windows Vista SP1 and Windows Server 2008 SP2 (you may need to uninstall older versions of PowerShell first).
  - Other options:
    - The correct interpreter must be installed for the scripting language. And both its location and environment variables are correctly set to call the interpreter.

#### Example calling running scripts on a Windows host

NOTE: if you forget to load the parameters of "Run as ..." in TheEye.
  - The script can not be executed with "Run as".
  - The deafult interpreter: CMD and Powershell
    - Only run scripts for the Windows interpreter

NOTE: To execute a powershell script you must add this line to the "RunAs" tasks' field.

![Run as default](../../images/scriptsRunAsDefault.png)

##### "Run as" or execute a script with another interpreter

Use the following line if you are using arguments in your script. Note that the file name of the ps1 script should not have spaces in it.

```powershell
powershell.exe -NonInteractive -ExecutionPolicy ByPass -File "%script%"
```
If you do not use arguments in the scripts, you can use the following line. Note that the file name of the ps1 script should not have spaces in it.

```powershell
powershell.exe -NonInteractive -ExecutionPolicy ByPass -File %script%
```

![Run as powershell](../../images/scriptsRunAsPowershell.png)

**Some examples executing script with other interpreters**

```python
python.exe "%script%"
```

```js
node "%script%"
```

```perl
perl "%script%"
```

#### Sudo note.

On Windows there are some alternatives to achieve the same result you can get using sudo. The native way is by using [runas](https://technet.microsoft.com/en-us/library/cc771525%28v=ws.10%29.aspx). The main important difference is that you should provide the user password at least once.

There are other alternative tools and configurations you will have to find out by yourself.
