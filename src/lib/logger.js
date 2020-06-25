import debug from 'debug'

export default function Logger (name) {
  let self = {}
  let dlog   = debug('theeye:log:' + name)
  let derror = debug('theeye:error:' + name)
  let ddata  = debug('theeye:data:' + name)
  let ddebug = debug('theeye:debug:' + name)
  let dwarn  = debug('theeye:warn:' + name)

  self.log = function flog(){
    dlog.apply(self, arguments);
  };

  self.error = function ferror(){
    derror.apply(self, arguments);
  };

  self.warn = function fwarn(){
    dwarn.apply(self, arguments);
  };

  self.data = function fdata(){
    ddata.apply(self, arguments);
  };

  self.debug = function fdebug(){
    ddebug.apply(self, arguments);
  };

  return self
}
