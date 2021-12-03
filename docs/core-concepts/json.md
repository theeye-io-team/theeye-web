
# Why JSON?

[![theeye.io](../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

**JSON**. Do you know what it is? Are you familiarized with JSON? If you are not, <a target="_blank" href="https://www.google.com/search?q=json">please check some of this links</a>

******

TheEye expected JSON as output of tasks scripts. At this moment, JSON is the only supported format as input of our API.
Also we use JSON to encode every environment variables, even strings, that will be available within scripts.

We use JSON to keep every output and environment variable consistent between each other and with the same encoding.
This will make it easy to parse and transfer data, and eventually automate the extraction and storage of the data.

The exception is when passing values from one task to another. In this case we try to convert values from JSON to string before using them as arguments.

Every string, in JSON format, is surrounded by doble quotes.
So when a var is only a string, you will have to decode it first or, in other words, remove doble quotes.

After doing that, you will get the real value and will be ready to use.

## JSON language support and processors

Almost every modern programming language has tools to encode/decode JSON and convert it into usable structures by the language.

 | Language        | Tool                      | Sample and Links |
 | -----           | ----                      | ---- |
 | Unix bash/shell | jq                        | <a target="_blank" href="https://stedolan.github.io/jq/">JQ Github</a> |
 | Windows cmd/bat | powershell                | <a target="_blank" href="https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/convertfrom-json?view=powershell-6">Microsoft Docs</a> |
 | Javascript      | JSON.encode/JSON.decode   | <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON">Mozilla Docs</a> |
 | PHP             | json_encode / json_decode | <a target="_blank" href="https://www.php.net/manual/en/ref.json.php">PHP.net Manual</a> |
 | Python          | json lib                  | <a target="_blank" href="https://docs.python.org/3/library/json.html">Python Docs</a> |

## Reserved characters. Escape/Unescape

Some characters are reserved in JSON and must be properly escaped to be used in strings.
Unproperly escaped strings could prevent the data to be correctly parsed generating errors.

### List of special characters in JSON

| Character                 | Escape sequence                | 
| -----                     | -----                          | 
| Backspace (ascii code 08) | \b                             | 
| Form feed (ascii code 0C) | \f                             | 
| New line                  | \n                             | 
| Carriage return           | \r                             | 
| Tab                       | \t                             | 
| Unicode hex               | \u followed by four-hex-digits | 
| Double quote              | \"                             | 
| Backslash character       | \\                             | 
| Slash character           | \/                             | 

![JSON](../images/SHLOB.gif)
