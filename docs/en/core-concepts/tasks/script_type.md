[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

# Script Task

---

## Components

When working with workflows, you can use the components object on a task result to override the behavior of the next task:

### Modify an Option selection argument: input_option

You can use the input_option component from a task to modify the available options on an option selection argument of the next task.
Let's check this example:

#### task A
Task A is the task that will modify the arguments of the next task. It's script output should be as follows:

```javascript

// place this piece of code within the NodeJS Boilerplate
const main = async () => {
  const options = [
    { id: '1', label: 'Agustin' },
    { id: '2', label: 'Facundo' },
    { id: '3', label: 'Tomas' },
    { id: '4', label: 'Santiago' }
  ]
  const components = {
    input_options: [{ order: 1, options }]
  }
  return { data: [], components }
}

//...
```

#### task B
Task B is the task that will have its arguments modified.
To enable this on task B:

1. Add an **Option Selection** argument on the same position as the **Order** property set on Task A output.

2. Open the task edition/creation form

3. Go to the bottom and click **Advanced Options**

4. The **Require user interaction** option must be checked   

---

### Modify an Remote Options argument: input_remote_option

You can use the input_remote_option component from a task to modify the params of the Remote options argument if the next task.
You can pass all this params or just the one you need to everride. The available params to modify are:

* endpointUrl: The endpoint from where the components gets the array of options
* idAttribute: The options property used as ID.
* textAttribute: The options property to show on the select input.

Let's check this example:

#### task A

Task A is the task that will modify the remote options argument of the next task. It's script output should be as follows:

```javascript

#!/usr/bin/node

try {
  const endpointUrl = 'https://github.com/theeye-io/theeye-docs/blob/master/docs/assets/remote_example.json'
  const idAttribute = 'id'
  const textAttribute = 'username'
  const components = {
    "input_remote_options": [
      {
        "order": 1,
        "endpointUrl": endpointUrl,
        "idAttribute": idAttribute,
        "textAttribute": textAttribute
      }
    ]
  }
  console.log(JSON.stringify({
    state: 'success',
    data: [],
    components: components
  }))
} catch (e) {
  console.error(e)
  console.error('failure')
  process.exit(2)
}

```

#### task B

Task B is the task that will have its arguments modified.
To enable this on task B:

1. Add an **Remote Options** argument on the same position as the **Order** property set on Task A output.

2. Open the task edition/creation form

3. Go to the bottom and click **Advanced Options**

4. The **Require user interaction** option must be checked    

---

### Popup Message

The Web Popup Message allows to display a friendly message to the users when a task completes the execution.

When a user executes a task using the Web Application and he awaits for the task result, that user alone will receive a one-time message in the Web Application using a separted popup message box.

The message can be any string defined within the script. At this moment there are two flovours to choose:

* A plain text message

* A simple list of items

The Popup Message will also interprete web links and will make them clickeable.


To emit a plain text message using the popup message box, the task output should be defined as follow

```json

  {
    "state": "success",
    "data": [],
    "components": {
      "popup": "Message with a clickable link: https://documentation.theeye.io"
    }
  }

```

To display a list, the value for popup property should be changed to an array

```json

  {
    "state": "success",
    "data": [],
    "components": {
      "popup": [
        "Item 1",
        "Item 2",
        "info@theeye.io",
        "https://documentation.theeye.io"
      ]
    }
  }

```

Sample code

```javascript

#!/usr/bin/node

try {
  const name = process.argv[2]
  const components = {
    "popup": "Hi " + name + ", visit our documentation for more information! https://documentation.theeye.io"
  }
  console.log(JSON.stringify({
    state: 'success',
    data: [],
    components: components
  }))
} catch (e) {
  console.error(e)
  console.error('failure')
  process.exit(2)
}

```

You can download the recipe from this link.

[Popup Recipe](https://github.com/theeye-io/recipes/blob/master/task/script/Show_Popup_Message.json)


#### Enable Popup

To enable this feature

1. Open the task edition/creation form

2. Go to the bottom and click **Advanced Options**

3. The **Result Popup** option must be checked

---

### Dynamic Approvers


```json

  {
    "state": "success",
    "data": [],
    "next": {
      "approval": {
        "approvers": [ "theeye.user@theeye.io" ]
      }
    }
  }

```

---


## Runtime Information

During runtime, you can access basic information of the job being executed via environment variables.

The information is storead as JSON Strings or as JSON encoded Key-Value structures. [Read more](https://documentation.theeye.io/theeye-supervisor/#/en/runtime-info)
