# Escribir scripts

[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Respuestas de script 

El agente va a interpretar la ultima linea del script en busca de un string que represente un `state` o un objeto de resultado en `JSON`

El `state` puede representar cualquier estado o evento vinculado a la tarea o el monitor asociado a dicho script. Los eventos integrados por defecto son `success` y `failure`, para cuando el script se ejecutó correctamente o falló.

Por ejemplo, si tu script en bash se ejecutó correctamente, la última línea debería ser `echo "success"`.

> `normal` y `ok` son también estados `success` válidos.
>
> `fail` es tambien un estado `failure` válido.

## Ejemplos de código

Un chequeo simple con estados `success` y `failure`

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

# or you can keep doing more things, you can control the flow of your script and end it when anytime
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

Hay muchos scripts que se pueden usar como ejemplo, escritos en diferentes lenguajes. Pueds buscarlos [aquí](https://gist.github.com/theeye-io)

## Ejemplos de script de TheEye

Revisa los [Assets](/assets/scripts/) incluidos en la documentación para más detalles.
