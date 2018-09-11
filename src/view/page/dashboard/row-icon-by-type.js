
const NO_TYPE_ICON_COLOR = '5bc4e8'

module.exports = (type) => {
  var iconClass = 'circle fa'
  var bgcolor

  if (/^groupby-/.test(type) === true) {
    const parts = type.split('-')
    if (parts[1]==='hostname') {
      iconClass += ` theeye-robot-solid`
      //bgcolor = str2rgb(parts[2])
      bgcolor = NO_TYPE_ICON_COLOR
    }
    else if (parts[1]==='failure_severity') {
      iconClass += ` fa-fire severity-${parts[2].toLowerCase()}`
    }
    else if (parts[1]==='type') {
      iconClass += ` ${getIconByType(parts[2])} ${parts[2]}-color`
    }
    else { // use value first letter as icon
      let first = parts[2].replace(/[^A-Za-z0-9]/g, ' ').trim()[0].toLowerCase()
      iconClass += ` fa-letter fa-letter-${first}`
      //bgcolor = str2rgb(parts[2])
      bgcolor = NO_TYPE_ICON_COLOR
    }
  } else {
    iconClass += ` ${getIconByType(type)} ${type}-color`
  }

  return {
    className: iconClass,
    style: {
      backgroundColor: `#${bgcolor}`
    }
  }
}

//const genericTypes = ['scraper','script','host','process','file']
const iconByType = {
  //nested: 'fa-cubes',
  nested: 'fa-bullseye',
  scraper: 'fa-cloud',
  script: 'fa-code',
  host: 'theeye-robot-solid',
  process: 'fa-cog',
  file: 'fa-file-o',
  dstat: 'fa-bar-chart',
  psaux: 'fa-cogs'
}

const getIconByType = (type) => {
  const hit = iconByType[type]
  if (!hit) {
    return 'fa-circle'
  } else {
    return hit
  }
}
