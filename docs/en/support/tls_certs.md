# Errores de certificados.


## Enumeracion de errores comunes.

* self signed certificate.

## Obtener informacion.

### 1. resolucion de nombres DNS

```
nslookup theeye.io
nslookup app.theeye.io
nslookup supervisor.theeye.io
```
### 2. obtencion de certificados

```
echo quit | openssl s_client -showcerts -servername theeye.io -connect theeye.io:443 > cacert.pem
```

Windows: Instalar openssl
http://slproweb.com/products/Win32OpenSSL.html

### 3. curl

```
curl --cacert cacert.pem https://supervisor.theeye.io/api/status 
```

### 4. Traceroute

```

traceroute supervisor.theeye.io

```



## Referencias utiles

[checking a remote certificate chain with openssl](https://langui.sh/2009/03/14/checking-a-remote-certificate-chain-with-openssl/)


[autoridad certificante](https://www.ssl.com/es/preguntas-frecuentes/%C2%BFQu%C3%A9-es-una-autoridad-de-certificaci%C3%B3n%3F/)


