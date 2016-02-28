var supervisor = sails.config.supervisor ;

var uris = {
    jobs : function jobsUri(user)
    {
        /** 

           http://%supervisor%/%customer%/%hostname%/%resource%?query_string 

         **/
        var parts = [
            supervisor.url ,
            user.customers[0] ,
            ':hostname:',
            supervisor.palancas.resource
        ];

        return parts.join('/');
    }
};

module.exports = uris ;
