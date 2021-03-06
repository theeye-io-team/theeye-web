
if [ -z ${1+x} ]; then echo "customer name required"; exit; fi

customer_name="${1}"

if [[ ! -f "./src/config/${customer_name}.js" ]]; then echo "customer configuration file [${customer_name}] does not exists"; exit; fi

export NODE_ENV=${customer_name}
export ANALYTICS_DISABLED="true"
export RECAPTCHA_DISABLED="true"
export APP_VERSION=`git describe`

rm -rf dist/bundles/

npm run build-prod

cp -r dist web
tar -czf "${customer_name}_web_${APP_VERSION}.tgz" ./web
