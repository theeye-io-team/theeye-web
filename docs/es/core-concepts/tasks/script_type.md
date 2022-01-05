# Tarea de script

[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Opciones

Las opciones para tareas de Script son las siguientes:

- **Name:** Nombre de la tarea
- **Bots:** El Bot que ejecutará la tarea
- **Scripts:** El script de la tarea
- **Tags:** Etiquetas para facilitar la busqueda de tasks (opcional)
- **Run As:** El comando que ejecuta la tarea. [Más información](../scripts/runas.md)
- **Task Arguments:** Los parámetros que el script puede referenciar (opcional). [Más información](#Argumentos)
- **Advanced options** _(Click para desplegar)_
  - **Copy Task:** Puedes elegir una tarea y clonar sus opciones (opcional)
  - **Description:** Breve descripción de la tarea (opcional)
  - **ACL's:** Asignar permisos de ACL a otros usuarios (opcional). [Más información](../iam/user-management.md)
  - **Triggered by:** Eventos que dispararán la tarea automáticamente (opcional). [Más información](/es/core-concepts/tasks/triggers.md)
  - **Trigger on-hold time:** Tiempo desde uno de los eventos definidos anteriormente hasta el disparo de la tarea (opcional)
  - **Excecution timeout:** Cuánto esperar la respuesta del servidor antes de cancelar ejecución (opcional)
  - **Multitasking:** Permite a los Bots ejecutar multiples Jobs de esta tarea en paralelo
  - **Is cancellable:** Puede o no la tarea ser cancelada
  - **Require user interaction:** Solicitar confirmación antes de ejecutarse
  - **Specific users interaction:** Solicitar confirmación de ciertos usuarios en particular (opcional)
  - **Result popup:** Mostrar el resultado del job en una ventana al terminar
  - **Environment Variables:** Variables de entorno para la tarea (opcional)
  - **Arguments Type (experimental):** El formato JSON para los argumentos
  - **Allows to change the behaviour of running jobs:** Permite que se modifiquen los parametros de un job en ejecución programáticamente

## Componentes

Al trabajar con Workflows, puedes usar los componentes en el resultado de la tarea para modificar el comportamiento de la siguiente tarea:

### Modificar un argumento de selección de opciones: `input_options`

El componente `input_options` permite modificar las opciones disponibles en el argumento de opciones de la tarea siguiente.

Revise este ejemplo:

#### Task A

Task A es la tarea que modificará el argumento de opciones de Task B. Su output debe ser el siguiente:

```javascript
// Este snippet va dentro del boilerplate de NodeJS...
const main = async () => {
  const options = [
    { id: '1', label: 'Agustin' },
    { id: '2', label: 'Facundo' },
    { id: '3', label: 'Tomas' },
    { id: '4', label: 'Santiago' }
  ]
  const components = {
    input_options: [{ order: 0, options }]
  }
  return { data: [], components }
}
//...
```

#### Task B

Task B es una tarea con un argumento de opciones en primera posición (argumento #0), el cual Task A va a modificar. Puede reproducirlo de la siguiente manera:

1. Agregue un argumento **Option Selection** en la misma posición que definió la propiedad **order** en el componente `input_options` del output de Task A
2. Al final del formulario, despliegue las opciones avanzadas cliqueando en **Advanced Options**
3. La opción **Require user interaction** (solicitar interacción de usuario) debe estar activada  

### Modificar un argumento de opciones remotas: `input_remote_options`

El componente `input_remote_options` permite modificar los parametros del argumento de opciones remotas en la siguiente tarea

Los parámetros disponibles en el componente son los siguientes:

* `endpointUrl`: La URL de la API que enviará las opciones del argumento
* `idAttribute`: La propiedad de las opciones que se usará como ID
* `textAttribute`: La propiedad de las opciones que se mostrará en el selector de opciones

Puede pasarle todos los parámetros, o solo los que necesita sobreescribir.

Revise este ejemplo:

#### task A

Task A es la tarea que modificará el argumento de opciones remotas de Task B. Su output debe ser el siguiente:

```javascript
// Este snippet va dentro del boilerplate de NodeJS...
const main = async () => {
  const endpointUrl = 'https://raw.githubusercontent.com/theeye-io/theeye-docs/master/docs/assets/remote_example.json'
  const idAttribute = 'id'
  const textAttribute = 'username'
  const components = {
    "input_remote_options": [
      {
        "order": 0,
        "endpointUrl": endpointUrl,
        "idAttribute": idAttribute,
        "textAttribute": textAttribute
      }
    ]
  }
  return { data: [], components }
}
//...
```

#### task B

Task B es una tarea con un argumento de opciones remotas en primera posición (argumento #0), el cual Task A va a modificar. Puede reproducirlo de la siguiente manera:

1. Agregue un argumento **Remote Options** en la misma posición que definió la propiedad **order** en el componente `input_remote_options` del output de Task A
2. Al final del formulario, despliegue las opciones avanzadas cliqueando en **Advanced Options**
3. La opción **Require user interaction** (solicitar interacción de usuario) debe estar activada  

### Mostrar un mensaje emergente: `popup`

El componente `popup` muestra un mensaje emergente en la interfaz de la app al finalizar la ejecución de la tarea.

Cuando un usuario ejecuta una tarea en la WebApp y su sesión sigue activa, ese usuario recibirá un mensaje emergente. El mensaje puede ser cualquier string definida en el script.

De momento hay 2 tipos de mensaje emergente:

* Un mensaje de texto simple
* Una lista

El mensaje emergente también convertirá URLs en links para mayor comodidad.

Para emitir un mensaje simple, el código debe verse similar a este: 

```javascript
// Este snippet va dentro del boilerplate de NodeJS...
const main = async () => {
  const message = "Mensaje con un link clickeable: https://documentation.theeye.io"

  const components = {
    "popup": message
  }
  return { data: [], components }
}
//...
```

Para mostrar una lista, el atributo `popup` debe contener un array

```javascript
// Este snippet va dentro del boilerplate de NodeJS...
const main = async () => {
  const lista =  [
    "Item 1",
    "Item 2",
    "info@theeye.io",
    "https://documentation.theeye.io"
  ]
      
  const components = {
    "popup": lista
  }
  return { data: [], components }
}
//...
```

Código de ejemplo

```javascript

#!/usr/bin/node

try {
  const name = process.argv[2]
  const components = {
    "popup": "Hola " + name + ", visita nuestra documentación para más información! https://documentation.theeye.io"
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

Puede descargar la receta de esta tarea desde el siguiente link

[Popup Recipe](https://github.com/theeye-io/recipes/blob/master/task/script/Show_Popup_Message.json)

#### Habilitar mensajes emergentes

Para habilitar los mensajes emergentes para una tarea
1. Diríjase al menú de la tarea y edítela, o cree una tarea nueva
2. Al final del formulario, despliegue las opciones avanzadas cliqueando en **Advanced Options**
3. La opción **Result Popup** debe estar activada

### Aprovadores dinámicos

<!-- TODO: Revisar esto -->

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

## Información de Runtime

<!-- TODO: Agregar más info -->

Durante runtime, se puede consultar información del job que se está ejecutando mediante variables de entorno.

Toda la información está guardada en strings o estructuras JSON.

Todas las variables de entorno del runtime de TheEye empiezan con el prefijo `THEEYE_`.

### `THEEYE_JOB` (objeto)

Contiene la información del job que se está ejecutando.

| Nombre  | Tipo   | Descripción                                                               |
| ------- | ------ | ------------------------------------------------------------------------- |
| id      | string | El ID del job. Se puede usar para consultar a la API                      |
| task_id | string | El ID de la task que generó el job. Se puede usar para consultar a la API |

### `THEEYE_JOB_USER` (objeto)

Este es el usuario que ejecutó la task y creó el job. Esta variable va a contener distintos parámetros dependiendo de cómo se haya ejecutado

* **Ejecución automática:** El usuario va a ser siempre un bot interno.
* **Botón Play:** El usuario va a ser quien que haya ejecutado la tarea desde la interfaz web.
* **Llamada a la API:** Las llamadas a la API pueden hacerse con *Integration Keys* (el usuario sería un bot) o con *Access Tokens* (el usuario sería humano).

| Nombre | Tipo   | Descripción       |
| ------ | ------ | ----------------- |
| id     | string | ID del usuario    |
| email  | string | Email del usuario |

### `THEEYE_JOB_WORKFLOW` (objeto)

Cuando las tareas son parte de un Workflow, esta variable contendrá información del mismo.

| Nombre  | Tipo   | Descripción                       |
| ------- | ------ | --------------------------------- |
| id      | string | Schema ID del workflow            |
| job_id  | string | La instancia de ejecución del job |

### `THEEYE_API_URL` (string)

La URL de la API por defecto

### `THEEYE_ORGANIZATION_NAME` (string)

El nombre de la organización dueña del script que se está ejecutando

### Ejemplos

####  Conseguir información del usuario mediante un script de Windows (BAT)

Este script te muestra cómo conseguir el ID del usuario y su email. Puede usarse el mismo método para las variables `THEEYE_JOB` and `THEEYE_JOB_WORKFLOW`.

[Descargar Receta](https://raw.githubusercontent.com/theeye-io/theeye-docs/master/docs/assets/recipes/check_theeye_env_vars.json)
