# Trabajando con Scripts

[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Crear un Script

Los Scripts pueden ser escritos desde el editor online o subidos en la ventana _Files & Scripts_. El editor online puede reconocer el lenguaje del archivo usando su nombre y extensión \(Ej: `runme.sh`\). Se reconocen los archivos de Bash, Python, Perl, Node y Bat, pero scripts de cualquier otro lenguaje pueden ejecutarse, siempre cuando el agente tenga instalado el interpreter necesario.

TheEye se encargará de la ejecución del script usando tareas. Revisa la [documentación de tareas](../tasks/#crear-una-tarea-de-script).

También se puede usar un script para crear un _Monitor_. Revisa la [documentación de monitores](../monitors.md#monitor-tipo-script).

### Escribir Scripts

TheEye usará el output de los scripts para determinar si el script se ejecutó correctamente. La ultima linea de tus strings va a ser analizada para encontrar un string que represente un estado \(`state`\) o un objeto de resultado `JSON`. Indicar el estado de ejecución es obligatorio al escribir scripts.

El `state` puede ser cualquier estado o evento vinculado a la tarea o el monitor del script.

Los eventos incluidos por defecto son `success` \(el script se ejecutó correctamente\) y `failure` \(el script se ejecutó con errores\)

Si el script se ejecutó correctamente, debe escribir "`success`" en la ultima linea de output

### Pasar argumentos en un Workflow

Al trabajar con Workflows, hay varias maneras de pasar argumentos [desde un monitor hacia una tarea](#monitor-a-tarea), y [de tarea en tarea](#tarea-a-tarea).

#### Monitor a tarea

En este caso, el script debe imprimir una string de formato JSON con 2 propiedades: `state` y `data`. 

`state` debe contener el estado de ejecición del script. Proveer el estado es obligatorio, y ante la falta del mismo se asume el estado `failure`.

`data` debe contener los argumentos con los que se debe ejecutar la siguiente tarea del Workflow. Hay 2 opciones para proveer estos argumentos:

* Un _array_ con los argumentos que necesita la tarea siguiente en el Workflow. Dichos argumentos se envian por orden de índice.

```bash
# El resto del script.

if [ true ]; then
  echo { \"state\":\"success\", \"data\": [ \"val1\", \"val2\" ] }
else
  echo { \"state\":\"failure\", \"data\": [ \"val1\", \"val2\" ] }
fi
```

* Un _objeto_ con los argumentos que necesita la tarea siguiente en el Workflow, acompañados del nombre de cada argumento. Dichos argumentos se envian según el nombre, independientemente del orden.


```bash
# El resto del script.

if [ true ]; then
  echo { \"state\":\"success\", \"data\":{ \"val1\":$varTwo, \"val2\":$varUno }  }
else
  echo { \"state\":\"failure\" }
fi

```

#### Tarea a tarea

Este caso es similar al anterior, excepto que el estado no es obligatorio y puede ignorarse, y por ende el output es mas simple. En una tarea, el output es siempre `success` a menos que se especifique lo contrario. El output debe contener los argumentos con los que se debe ejecutar la siguiente tarea del Workflow. Hay 2 opciones para proveer estos argumentos:

* Un _array_ con los argumentos que necesita la tarea siguiente en el Workflow. Dichos argumentos se envian por orden de índice.

```bash
  echo [\"arg1\",\"arg2\",\"arg3\"]
```

* Un _objeto_ con los argumentos que necesita la tarea siguiente en el Workflow, acompañados del nombre de cada argumento. Dichos argumentos se envian según el nombre, independientemente del orden.

```
  echo { \"val1\": $varTwo, \"val2\": $varUno }

```

#### Limitaciones

De momento, la unica limitación detectada es el tamaño de la string del output. Dependiendo del sistema operativo del agente, el buffer del output varía. Tenga en cuenta que si el string excede el buffer del output, algunos caracteres pueden perderse y causar un error de JSON, lo que producirá un estado `failure`. Este error se puede detectar analizando el output del monitor o la tarea.

#### Ejemplo

Este es un chequeo simple con estados `success` y `failure`

```bash
# El script hace los chequeos necesarios y
# guarda los resultados en la variable $check
# 
# ...

# Al final del script mostramos los resultados

if [ $check == true ]; then
  echo "success"
  exit
else
  echo "failure"
  exit
fi

# O puedes continuar con otras instrucciones
# Puedes controlar el flow de tu script y terminarlo en cualquier momento 
echo "success"
```

Si necesitas reportar información extra a la API, tendrás que imprimir la información al `stdout` en formato JSON

```bash
varUno="value1"
varDos="value2"

# Esto imprime una string JSON válida que será analizada por el agente TheEye.
# Escribir una string JSON manualmente no es lindo, lo sabemos. 
# Estamos trabajando para mejorar esto en el futuro. 

if [ true ]; then
  echo { \"state\":\"success\", \"data\":{ \"val1\":$varUno, \"val2\":$varDos } }
else
  echo { \"state\":\"failure\", \"data\":{ \"val1\":$varUno, \"val2\":$varDos } }
fi
```

El output JSON debe tener la propiedad `state` con el estado de la ejecución de tu script, y la propiedad `data` con información extra necesaria. TheEye mostrará el valor de `data` en log de ejecución.

Si necesitas validar el output JSON de tus scripts, puedes usar un script sencillo de NodeJS. Considere el siguiente ejemplo:

El script `test.sh` contiene lo siguiente

```bash
#!/bin/bash

state='normal'
POOL='pool'
members=1

# this is valid json when send to stdout
echo { \"state\" : \"$state\" , \"data\" : { \"members\" : $members } }
# this will echo { "state": "normal" , "data" : { "members": 1 } }
```

El script `test.js` revisa si el stdout de `test.sh` contiene una string JSON válidaff

```javascript
// test.js
var exec = require('child_process').exec;

exec('./test.sh', function(err, stdout, stderr){
    // Si el string de stdout se puede analizar correctamente, el script imprime el contenido de data
    var obj = JSON.parse(stdout);

    console.log( obj.data );
    // Esto imprime { "members": 1 }
});
```