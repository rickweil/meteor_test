Tasks = new Mongo.Collection("tasks");
 
if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}


if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tasks");


  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {checked: 1, createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      console.log(event);
      // Get value from form element
      var text = event.target.text.value;
      Meteor.call("addTask", text);

      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });


  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });


  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
     Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });  
}

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    var username = Meteor.user().username || (Meteor.user().profile && Meteor.user().profile.name);

    Tasks.insert({
      text: text,
      checked: false,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: username
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if ( Meteor.userId() == task.owner || !task.private) {
      Tasks.remove(taskId);
    }
    return;
    //throw new Meteor.Error("not-authorized");
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
 
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }

});

