$path = $args[0]
$minutesRange = $args[1]
$textPattern = $args[2]
$matchFound = $false
$matchedLines = New-Object System.Collections.ArrayList

if ($path -eq $null) {
  echo "missing path"
  exit
}

if ($minutesRange -eq $null) {
  echo "missing minutes"
  exit
}

if ($textPattern -eq $null) {
  echo "missing text pattern"
  exit
}

if ((Get-Item $path 2> $null) -is [system.io.fileinfo]) {
  $files = $path

} else {
  $dateString = (Get-Date).ToString("yyyy-MM-dd")
  $files = $path + "." + $dateString + ".log"
}

try {

  echo "1Checking file: $files"
  echo "1Text pattern: $textPattern"
  $matches = Select-String $files -Pattern $textPattern
  echo "2Checking file: $files"
  echo "2Text pattern: $textPattern"

  if ($matches) {
        
    $matches.Line | ForEach-Object {
      
      if($_ | Select-String -Pattern "^[\d]*-[\d]* [\d]*:[\d]*:[\d]*") {

          $date = $_ | Select-String -Pattern `
          "^[\d]*-[\d]* [\d]*:[\d]*:[\d]*" `
          | % { $_.Matches } | % { $_.Value }
      
          #date format example: 13-06 10:33:13
          $eventDate = [DateTime]::parseexact($date,"dd-MM HH:mm:ss",$null)
          $checkDate = (Get-Date).AddMinutes(-$minutesRange)
      
          if ($eventDate -gt $checkDate) {
            $matchFound = $true
            $matchedLines.Add($_)
          }

      }
                        
    }

  } else {
    
    echo "no matches found"
    echo "normal"
  }

} catch {
  echo "`n$_.Exception"
  echo "failure"
  exit
}

if($matchFound) {
 
  echo "`nmatch found"
  $matchedLines | ForEach-Object { echo $_ }
  echo "`nfailure"

} else {

  echo "`nno match found"
  echo "normal"

}
