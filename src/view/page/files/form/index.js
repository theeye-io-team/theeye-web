import AllLanguages from './all_lang'
import Nodejs from './node'
import * as TaskConstants from 'constants/task'

export default function (specs) {
  if (specs.language === TaskConstants.TYPE_NODEJS) {
    return new Nodejs(specs)
  } else {
    return new AllLanguages(specs)
  }
}
