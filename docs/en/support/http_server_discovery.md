
Los siguientes pasos permiten descubrir si se tiene acceso a la API de TheEye

1. Crear una tarea en TheEye tipo CMD, Bash o Javascript
2. Buscar en la seccion de configuraciones las credenciales 
3. Copiar uno de los siguientes ejemplos en el script y ejecutar la tarea de TheEye

## Ejemplos de los scripts:

### Usando BASH

#### Método HTTP y URL:

```bash
curl -i -X GET http://theeye:60080/status
```

### Usando CMD

#### Método HTTP y URL:

```
curl http://theeye:60080/status
```

### Usando NodeJs

#### Script para validar si hay acceso a la API de TheEye

```javascript
const http = require('https')
const token = process.env.ACCESS_TOKEN

if (!token) {
  throw new Error('ACCESS_TOKEN required')
}

const main = async () => {
  try {
    const wf = JSON.parse(process.env.THEEYE_JOB_WORKFLOW)
    const customerName = JSON.parse(process.env.THEEYE_ORGANIZATION_NAME) // this is JSON string

    console.log(wf)
    let response = await fetch(customerName, { workflow_job_id: wf.job_id, _type: 'ApprovalJob' })
    if (response.statusCode !== 200) {
      let err = new Error('api response error')
      err.rawBody = response.rawBody
      err.statusCode = response.statusCode
      throw err
    }
    let body = JSON.parse(response.rawBody)
    console.log(body[0].result.user.email)
  } catch (err) {
    console.error(err)
  }
}

const fetch = (customer, where) => {
  let queryCustomer = encodeURIComponent(customer)

  let qs = `access_token=${token}`
  for (let prop in where) {
    let qsWhereValue = encodeURIComponent(where[prop])
    qs += `&where[${prop}]=${qsWhereValue}`
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'theeye',
      port: 443,
      path: `/${queryCustomer}/job?${qs}`,
      method: 'GET'
    }
    
    console.log('request', options)
    console.log('waiting server response')
    const req = http.request(options, res => {
      let str = ''

      res.on('data', d => {
        console.log('progress: downloaded ' + str.length + ' bytes')
        if (d) { str += d; }
      })

      res.on('end', () => {
        console.log('progress: download completed')
        res.rawBody = str
        return resolve(res)
      })
    })

    req.on('error', error => { return reject(error) })
    req.end()
  })
}

main ()
```


## HTTP VS HTTPS


En node se debe elegir entre usar http o https según la api a consultar.

* Para HTTPS se suele utilizar el puerto 443.   

* Para HTTP se suele utilizar el puerto 80.


Por lo general cuando el protocol es HTTPS intervienen componentes adicionales que se encuentran antes del servicio que estamos intentando consultar.

* Un dominio (fqdn) - DNS   

* Un cerficado SSL válido    

* Un sevidor Proxy como Apache o NGINX     

Por lo tanto no se esta accediendo directamente al servicio.
Se se utilizar la direccin IP del servidor, debe ser la del Proxy.

Al utilizar protocolo HTTP la dirección IP y el PUERTO suelen ser diferentes. Cada componente puede estar escuchando en un puerto diferente y distribuido en diferentes instancias, por lo tanto utilizar diferentes direcciones ip.


#### Respuesta correcta de la API

Si la solicitud se completa de forma correcta, el servidor muestra un código de estado HTTP 200 OK y la respuesta en formato JSON.

```json
{
  "message": "Hi, I am ok. Thanks for asking"
}
```

## Receta del script en NodeJS

```json
{
    "task": {
        "enable": true,
        "type": "script",
        "public": false,
        "tags": [],
        "grace_time": 0,
        "task_arguments": [],
        "output_parameters": [],
        "register_body": false,
        "execution_count": 9,
        "multitasking": true,
        "user_inputs": false,
        "user_inputs_members": [],
        "show_result": false,
        "script_arguments": [],
        "_type": "ScriptTask",
        "creation_date": "2020-06-08T20:41:02.735Z",
        "last_update": "2020-07-01T19:38:53.795Z",
        "name": "NodeJS Supervisor cUrl",
        "description": "",
        "timeout": 600000,
        "script_runas": "\"C:\\Program Files\\nodejs\\node.exe\" %script%",
        "template": null,
        "template_id": null,
        "source_model_id": "5edea25ec0498d0e40d2a53b",
        "env": {},
        "script_id": "5edea256c0498d7354d2a53a"
    },
    "file": {
        "filename": "nodejs_curl.js",
        "keyname": "nodejs_curl.js[ts:1593631054634]",
        "size": 951,
        "description": "",
        "md5": "3f759835a0a97997139d852b43d0c1ad",
        "public": false,
        "tags": [],
        "source_model_id": "5edea256c0498d7354d2a53a",
        "data": "IyEvdXNyL2xvY2FsL2Jpbi9ub2RlCgpjb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpCgpjb25zdCBtYWluID0gYXN5bmMgKCkgPT4gewoJdHJ5IHsKICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGN1cmwoKQogICAgY29uc29sZS5sb2cocmVzcG9uc2UucmF3Qm9keSkKICB9IGNhdGNoIChlcnIpIHsKICAgIGNvbnNvbGUuZXJyb3IoZXJyKQogIH0KfQoKLyoqCiAqIE5vZGVKcyBDVVJMIHRvIFN1cGVydmlzb3IKICovCmNvbnN0IGN1cmwgPSBhc3luYyAoKSA9PiB7CiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsKICAgIGNvbnN0IG9wdGlvbnMgPSB7CiAgICAgIGhvc3RuYW1lOiAnMTAuMi40LjI0OScsCiAgICAgIHBvcnQ6IDYwMDgwLAogICAgICBwYXRoOiBgL3N0YXR1c2AsCiAgICAgIG1ldGhvZDogJ0dFVCcKICAgIH0KICAgIAogICAgY29uc29sZS5sb2coJ3JlcXVlc3QnLCBvcHRpb25zKQogICAgY29uc29sZS5sb2coJ3dhaXRpbmcgc2VydmVyIHJlc3BvbnNlJykKICAgIGNvbnN0IHJlcSA9IGh0dHAucmVxdWVzdChvcHRpb25zLCByZXMgPT4gewogICAgICBsZXQgc3RyID0gJycKCiAgICAgIHJlcy5vbignZGF0YScsIGQgPT4gewogICAgICAgIGNvbnNvbGUubG9nKCdwcm9ncmVzczogZG93bmxvYWRlZCAnICsgc3RyLmxlbmd0aCArICcgYnl0ZXMnKQogICAgICAgIGlmIChkKSB7IHN0ciArPSBkOyB9CiAgICAgIH0pCgogICAgICByZXMub24oJ2VuZCcsICgpID0+IHsKICAgICAgICBjb25zb2xlLmxvZygncHJvZ3Jlc3M6IGRvd25sb2FkIGNvbXBsZXRlZCcpCiAgICAgICAgcmVzLnJhd0JvZHkgPSBzdHIKICAgICAgICByZXR1cm4gcmVzb2x2ZShyZXMpCiAgICAgIH0pCiAgICB9KQoKICAgIHJlcS5vbignZXJyb3InLCBlcnJvciA9PiB7IHJldHVybiByZWplY3QoZXJyb3IpIH0pCiAgICByZXEuZW5kKCkKICB9KQp9CgptYWluICgp"
    }
}
```
