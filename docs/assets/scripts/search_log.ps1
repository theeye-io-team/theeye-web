$file = $args[0]                                                                                                                                                             
$textPattern = $args[1]

if ($file -eq $null) {
  echo "missing path parameter"
  exit
}

if ($textPattern -eq $null) {
  echo "missing text pattern parameter"
  exit
}

try {

  $match = Select-String $file -Pattern $textPattern
  echo "Checking file: $file"
  echo "Text pattern: $textPattern"

  if ($match) {
    echo "`npattern found"
    echo "match: $match"
    echo "failure"

  } else {
    echo "pattern not found"
    echo "normal"
  }

} catch {
  echo "error opening file"
}
