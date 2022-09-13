# export sources

cp -r /app/dist/. /output

sed -i 's|<\!--\[if true\]><script src\="\/config\.js"><\/script><\!\[endif\]-->|<script src="/config.js"></script>|' /output/index.html

cp /app/misc/quickstart/local.js /output/config.js
