import App from 'ampersand-app'
import * as MonitorConstants from 'constants/monitor'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import TextareaView from 'components/input-view/textarea'
import CheckboxView from 'components/checkbox-view'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import LooptimeSelectView from 'view/looptime-select'
import FilesSelectionView from 'view/file-select'
import SeveritySelectView from 'view/severity-select'
import InputView from 'components/input-view'
import AdvancedToggle from 'view/advanced-toggle'
import FormButtons from 'view/buttons'
import CopyMonitorSelect from '../../copy-monitor-select'
import MonitorFormView from '../../monitor-form'

import PathInput from './path-input'

export default MonitorFormView.extend({
  initialize (options) {
    let resource = this.model
    let monitor = resource.monitor

    const isNewMonitor = Boolean(resource.isNew())

    let hostsSelection = new SelectView({
      // FIXME: You can choose multiple Monitors. Choosing a Windows Monitor and
      // a Linux or Mac OS Monitor will not work, as both filesystems are widely
      // different. This could be fixed by filtering the Monitor list by OS after
      // the first one is selected
      label: 'Bots *',
      name: (isNewMonitor ? 'hosts' : 'host_id'),
      multiple: isNewMonitor,
      tags: isNewMonitor,
      options: App.state.hosts,
      value: monitor.host_id,
      required: true,
      unselectedText: 'File Host',
      idAttribute: 'id',
      textAttribute: 'hostname',
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    let fileSelection = new FilesSelectionView({
      label: 'File *',
      value: monitor.file,
      required: true
    })

    const pathInput = new PathInput(preparePath(monitor))

    pathInput.render()
    this.registerSubview(pathInput)

    this.listenTo(hostsSelection, 'change:value', () => {
      let host
      if (hostsSelection.value.length > 1) {
        host = App.state.hosts.get(hostsSelection.value[0])
      } else host = App.state.hosts.get(hostsSelection.value)
      if (host) pathInput.OS = host.os_name
    })

    let dirname = new InputView({
      label: 'Dirname',
      name: 'dirname',
      placeholder: '',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: monitor.dirname,
      visible: false,
      disabled: true
    })

    let basename = new InputView({
      label: 'Basename',
      name: 'basename',
      placeholder: '',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: monitor.basename,
      visible: false,
      disabled: true
    })

    fileSelection.on('change', () => {
      if (fileSelection.selected()) {
        if (!pathInput.is_manual_path) {
          basename.setValue(fileSelection.selected().filename)
        }
      }
    })

    const updateNames = () => {
      if (pathInput.is_manual_path===true) {
        this._fieldViews['basename'].visible = true
        this._fieldViews['dirname'].visible = true

        if (pathInput.path) {
          let parts = cleanDirname(pathInput.path).split('/')
          basename.setValue(parts.pop())
          dirname.setValue(parts.join('/'))
        }
      } else {
        dirname.setValue(cleanDirname(pathInput.path))
        if (fileSelection.selected()) {
          basename.setValue(fileSelection.selected().filename)
        }
      }
    }
    pathInput.on('change:path', updateNames)
    pathInput.on('change:is_manual_path', updateNames)

    this.advancedFields = [
      'description','os_username','os_groupname',
      'permissions','tags','failure_severity',
      'acl','dirname','basename'
    ]

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: resource.name
      }),
      hostsSelection,
      new LooptimeSelectView({
        invalidClass: 'text-danger',
        required: true,
        value: monitor.looptime || 60000
      }),
      fileSelection,
      pathInput,
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event, toggle) => {
          this.advancedFields.forEach(name => {
            this._fieldViews[name].visible = toggle.folded
          })
        }
      }),
      dirname,
      basename,
      new InputView({
        label: 'File Username',
        name: 'os_username',
        required: false,
        visible: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.os_username
      }),
      new InputView({
        label: 'File Groupname',
        name: 'os_groupname',
        required: false,
        visible: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.os_groupname
      }),
      new InputView({
        label: 'File Permissions',
        name: 'permissions',
        placeholder: '0755',
        required: false,
        visible: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.permissions
      }),
      new TextareaView({
        label: 'Description',
        name: 'description',
        required: false,
        visible: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: resource.description
      }),
      new TagsSelectView({
        required: false,
        visible: false,
        name: 'tags',
        value: resource.tags
      }),
      new MembersSelectView({
        required: false,
        visible: false,
        name: 'acl',
        label: 'ACL\'s',
        value: resource.acl
      }),
      new SeveritySelectView({
        required: false,
        visible: false,
        value: resource.failure_severity
      })
    ]

    if (isNewMonitor) {
      this.advancedFields.push('copy')
      const copySelect = new CopyMonitorSelect({
        type: MonitorConstants.TYPE_FILE,
        visible: false
      })

      this.fields.splice(8, 0, copySelect)
      this.listenTo(copySelect,'change:value',() => {
        if (copySelect.value) {
          let monitor = App.state.resources.get(copySelect.value)
          this.setWithMonitor(monitor)
        }
      })
    }

    MonitorFormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    MonitorFormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    if (this.model.isNew()) {
      this.addHelpIcon('hosts')
      this.addHelpIcon('copy')
    } else {
      this.addHelpIcon('host_id')
    }
    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('looptime')
    this.addHelpIcon('file')
    this.addHelpIcon('path_input')
    this.addHelpIcon('dirname')
    this.addHelpIcon('basename')
    this.addHelpIcon('os_username')
    this.addHelpIcon('os_groupname')
    this.addHelpIcon('permissions')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('failure_severity')

    const buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.monitor.form[field]
      }),
      view.query('label')
    )
  },
  prepareData (data) {
    data.type = MonitorConstants.TYPE_FILE
    data.looptime = this._fieldViews.looptime.selected().id
    //let file = App.state.files.get(data.file)
    data.path = data.dirname + '/' + data.basename
    data.is_manual_path = data.path_input.is_manual_path
    //Object.assign(data, data.path_input)
    return data
  },
  setWithMonitor (resource) {
    let monitor = resource.monitor
    this.setValues({
      name: resource.name,
      description: resource.description,
      tags: resource.tags,
      acl: resource.acl,
      failure_severity: resource.failure_severity,
      file: monitor.file, // file id
      path_input: preparePath(monitor),
      basename: monitor.basename,
      dirname: monitor.dirname,
      looptime: monitor.looptime,
      os_username: monitor.os_username,
      os_groupname: monitor.os_groupname,
      permissions: monitor.permissions
    })
  }
})

const cleanDirname = (value) => {
  if (!value) { return '' }
  return value.replace(new RegExp('/+','g'),'/').replace(/\/*$/,'')
}

const preparePath = ({ path, is_manual_path }) => {
  if (path) {
    if (is_manual_path !== true) {
      let parts = path.split('/') // remove last part
      parts.pop()
      path = parts.join('/')
    }
  }
  return { path, is_manual_path }
}
