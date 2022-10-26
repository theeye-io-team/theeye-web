# Configuración de la interfaz Web

[![theeye.io](../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Parametros de configuracion de la UI.

En el siguiente link se puede visualizar el archivo de configuración base con todos los parametros existentes y sus valores por defecto.

[src/config/default.js](https://github.com/theeye-io-team/theeye-web/blob/master/src/config/default.js)

A continuación se detalla el funcionamiento de cada uno


 | key                                        | default                              | description                                 | 
 | -----                                      | -----                                | -----                                       | 
 | env                                        | default                            | production , development or a custom value | 
 | app_url                                    | http://localhost:6080              | This is the webserver base url. the gateway has included a webserver to serve the web ui  | 
 | socket_url                                 | http://localhost:6080              | socket server url. this is equal to the app_url or gateway url | 
 | api_url                                    | http://localhost:6080/api          | gateway api url | 
 | api_v3_url                                 | http://localhost:6080/api          | gateway api url | 
 | supervisor_api_url                         | http://127.0.0.1:60080             | supervisor api url | 
 | supervisor_api_version                     | ~2                                 |                                             | 
 | docs                                       | https://documentation.theeye.io    |                                             | 
 | request_timeout                            | 30000                                |                                             | 
 | landing_page_url                           | https://theeye.io                  |                                             | 
 | files.max_upload_size                      | 5120                                 | maximum allowed upload size                 | 
 | session.refresh_interval                   | 1000 * 60 * 30                       | refresh interval in milliseconds            | 
 | dashboard.upandrunningSign                 | true                                 | enable/disable monitors up and running sign | 
 | components.dynamic_form.remote.query_limit | 10                                   |                                             | 
 | components.login.registration.enabled      | true                                 |                                             | 
 | components.login.password_reset.enabled    | true                                 |                                             | 
 | components.login.domain.enabled            | false                                |                                             | 
 | components.login.enterprise.enabled        | false                                |                                             | 
 | components.login.google.enabled            | false                                |                                             | 
 | components.grecaptcha.sitekey              |                                      |                                             | 
 | components.marketplace.enabled             | true                                 |                                             | 
 | components.marketplace.url                 | http://localhost:60080/marketplace |                                             | 
