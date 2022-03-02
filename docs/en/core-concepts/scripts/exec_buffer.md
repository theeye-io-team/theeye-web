
el exec tiene un max buffer seteado.
  eso es la cantidad máxima de datos enviados por el subproceso a stdout o stderr (console.log seriá en este caso) que puede handlear el exec .
en criollo, si haces un solo console.log gigante que supere ese max buffer, el exec de node le envía la señal SIGTERM , eso genera el kill 
  este buffer es lo que se usaría para hacer el stream de datos live que ustedes quieren , desde el agente hacía la UI para ver como va progresando la ejecución
