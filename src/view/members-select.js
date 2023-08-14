import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import Collection from 'ampersand-collection'
//import FilteredCollection from 'ampersand-filtered-subcollection'
//import isEmail from 'validator/lib/isEmail'

export default SelectView.extend({
  initialize (specs) {

    //let filters = [ item => true ]
    //if (
    //  Array.isArray(specs.filterOptions) &&
    //  specs.filterOptions.length
    //) {
    //  filters = filters.concat(specs.filterOptions)
    //}
    //this.options = new FilteredCollection(
    //  specs.options || App.state.members,
    //  { filters }
    //)
    //this.options.collection.add( App.state.credentials.models )

    this.options = new Collection([])
    this.options.add( App.state.members.models )
    this.options.add( App.state.credentials.models )

    this.multiple = (typeof specs.multiple === 'boolean') ? specs.multiple : true
    this.tags = specs.tags || true
    this.label = specs.label || 'Members'
    this.name = specs.name || 'members'
    this.styles = specs.styles || 'form-group'
    this.idAttribute = specs.idAttribute || 'key'
    this.textAttribute = specs.textAttribute || 'label'

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
