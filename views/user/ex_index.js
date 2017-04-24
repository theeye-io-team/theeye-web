<% block('scripts', '<script> $(document).ready(function(){ new UsersPageInit(); }); </script>') %>

<!-- Main  -->
<div class="admin-container">
  <div class="js-searchable-box">
    <form>
      <input type="text" placeholder="Find a User">
      <button class="clean"><i class="glyphicon glyphicon-remove"></i></button>
      <button class="search"><i class="glyphicon glyphicon-search"></i></button>
    </form>
  </div>
  <div class="admin-panel users-admin">
    <h3>Users Admin</h3>
    <div>
      <div class="table-header admin">
        <button class="pull-left tableHeaderIconButton massChecker btn btn-primary simple-btn tooltiped"
          style="margin-left:5px;"
          title="Select all"
          aria-label="Center Align">
          <span class="massiveSelector glyphicon glyphicon-unchecked"></span>
        </button>
        <span class="title panel-item name">Users &nbsp; &nbsp; |</span>
        <button class="createUser btn btn-primary simple-btn new-btn tooltiped"
          data-placement="right"
          title="Create new user"
          aria-label="Left Align"
          data-toggle="modal"
          data-target="#create-user">
          <span class="glyphicon glyphicon-plus"></span>
          New User
        </button>

        <button class="pull-right tableHeaderIconButton massDelete btn btn-primary simple-btn tooltiped"
          title="Delete selected users"
          aria-label="Center Align">
          <span class="glyphicon glyphicon-trash"></span>
        </button>
      </div>
      <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
        <% users.forEach( function(user, key) { %>
          <%
          var tags = [
            "user",
            user.username,
            user.email,
            user.credential,
            user.customers,
            "credential="+ user.credential
          ].join(',');
          %>
          <div class="itemRow panel panel-default js-searchable-item"
            data-item-id="<%= user.id %>"
            data-item-name="<%= user.username %>"
            data-tags="<%= tags %>">
            <div class="panel-heading" role="tab" id="heading<%= user.id %>">
              <h4 class="panel-title">
                <span class="collapsed" data-toggle="collapse"  data-parent="#accordion" href="#collapse<%= user.id %>" aria-expanded="false" aria-controls="collapse<%= user.id %>">
                  <div class="panel-title-content">
                    <button class="rowSelector btn btn-primary simple-btn tooltiped"
                      title="Select user"
                      aria-label="Center Align">
                      <span class="selectorIcon glyphicon glyphicon-unchecked"></span>
                    </button>
                    <span class="panel-item name" id="<%= user.id %>"><%= user.username %> <small>> <%= user.credential %></small></span>
                    <div class="panel-item icons">
                      <% if (!user.enabled && user.invitation_token) { %>
                      <button
                        title="activation link"
                        class="btn btn-primary simple-btn tooltiped"
                        aria-label="Center Align"
                        data-hook="activate"
                        data-activation_token="<%= user.invitation_token %>"
                        >
                        <span class="glyphicon glyphicon-info-sign"></span>
                      </button>
                      <% } %>
                      <button
                        title="resend user invitation"
                        class="reSendInvitation btn btn-primary simple-btn tooltiped"
                        aria-label="Center Align"
                        data-user-id="<%= user.id %>">
                        <span class="glyphicon glyphicon-share-alt"></span>
                      </button>
                      <button
                        class="editUser btn btn-primary simple-btn tooltiped"
                        title="Edit user"
                        aria-label="Center Align">
                        <span class="glyphicon glyphicon-edit"></span>
                      </button>
                      <button
                        class="deleteUser btn btn-primary simple-btn tooltiped"
                        title="Delete user"
                        aria-label="Center Align"
                        data-user-id="<%= user.id %>">
                        <span class="glyphicon glyphicon-trash"></span>
                      </button>
                    </div>
                  </div>
                </span>
              </h4>
            </div>
            <div id="collapse<%= user.id %>" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading<%= user.id %>">
              <div class="panel-body">
                <div style="float:left; width:50%;">
                  <h4>Email</h4>
                  <p> <%= user.email %> </p>
                  <h4>Credential</h4>
                  <p> <%= user.credential %> </p>
                  <h4>Organizations</h4>
                  <p> <%= user.customers %> </p>
                </div>
                <% var theeye = protocols.filter(function(proto){ return proto.user == user.id; })[0] || { profile: {} } ; %>
                <div style="float:left; width:50%;">
                  <h4>API Id</h4>
                  <p><%= theeye.profile.client_id || 'no data' %></p>
                  <h4>API Secret</h4>
                  <p><%= theeye.profile.client_secret || 'no data' %></p>
                  <h4>API Token</h4>
                  <p><%= theeye.token || 'no data' %></p>
                </div>
              </div>
            </div>
          </div> <!-- end item -->
        <% }); %>
      </div> <!-- end panel -->
    </div> <!-- Tableresults -->
  </div>
</div> <!-- main -->

<%- include ./partials/create-modal.ejs %>
<%- include ./partials/edit-modal.ejs %>
