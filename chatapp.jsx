/** @jsx React.DOM */

Messages = new Meteor.Collection('messages');
People = new Meteor.Collection('people');

LoginButtons = RouteCore.BlazeComponent('loginButtons');

HomePage = React.createClass({
  findChatRoom: function(e) {
    e.preventDefault();

    RouteCore.go(Routes.chatroom(Random.id(), Random.id()));
  },

  render: function() {
    return (
      <div>
        <LoginButtons />
        {Meteor.user() ? 
         <button onClick={this.findChatRoom}>Find Chat Room</button> : <span /> }
      </div>
    );
  }
});

ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      wipMessage: ''
    };
  },

  sendMessage: function(e) {
    e.preventDefault();
    Messages.insert({
      chatroom: this.props.chatroom,
      user: Meteor.user()._id,
      body: this.state.wipMessage,
      timestamp: new Date()
    });
    
    this.setState({ wipMessage: '' });
  },
  
  updateMessage: function(e) {
    this.setState({
      wipMessage: e.target.value
    });
  },
  
  updateName: function(e) {
    Meteor.users.update({ _id: Meteor.user()._id }, {
      $set: {
        'profile.name': e.target.value
      }
    });
  },

  render: function() {
    if (!Meteor.user()) {
      RouteCore.go(Routes.home());
    }

    var messages = Messages.find({
      chatroom: this.props.chatroom
    });

    return (
      <div>
        <h1>{this.props.chatroom}</h1>
        {messages.map(function(message, i) {
          // Lookup the user
          var user = Meteor.users.findOne({ _id: message.user });
          var name = 'Unnamed';
          if (user && user.profile && user.profile.name) {
            name = user.profile.name;
          }

          return (
            <div className="message" key={i}>
              <span className="name">{name}</span>
              <span className="body">{message.body}</span>
              <span className="timestamp">{message.timestamp.toString()}</span>
            </div>
          );
        })}
        <form onSubmit={this.sendMessage}>
          <input type="text" value={this.state.name} onChange={this.updateName}></input>
          <input type="text" value={this.state.wipMessage} onChange={this.updateMessage}></input>
          <button type="submit">Send Message</button>
        </form>
      </div>
    );
  }
});

ChatRooms = React.createClass({
  render: function() {
    var chatroom1 = this.props.params.chatroom1;
    var chatroom2 = this.props.params.chatroom2;
    
    return (
      <div className="chatrooms">
        <ChatRoom chatroom={chatroom1} />
        <ChatRoom chatroom={chatroom2} />
      </div>
    );
  }
});

Routes = {};
RouteCore.map(function() {
  Routes.home = this.route('/', HomePage);
  Routes.chatroom = this.route('/chat/:chatroom1/:chatroom2', ChatRooms);
});
