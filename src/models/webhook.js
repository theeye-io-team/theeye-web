import BaseModel from 'lib/app-model'
import BaseCollection from 'lib/app-collection'
import Cookies from 'js-cookie'
import { Model as Customer } from './customer'

export const Model = BaseModel.extend({
  urlRoot: '/api/webhook',
  props: {
    id:'string',
    name:'string',
    secret:'string',
    enable:'boolean',
    customer_id:'string',
    _type:'string',
    creation_date:'date',
  },
  children: {
    customer: Customer
  },
  parse: function(response){
    response.hosts = [ response.host_id ];
    return response;
  },
  initialize: function(){
    Object.defineProperty(this,'triggerUrl',{
      get: function() {
        var cookie = Cookies.getJSON('theeye');
        var url = cookie.supervisor_url;
        var customer = cookie.customer;

        return url + '/' + customer + '/webhook/' +
          this.id + '/trigger/secret/' + this.attributes.secret ;
      }
    });
  }
})

export const Collection = BaseCollection.extend({
  model: Model,
  url:'/api/webhook'
})
