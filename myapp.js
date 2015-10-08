Tasks = new Mongo.Collection("tasks");
 
if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({}, {sort: {checked: 1, createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      console.log(event);
      // Get value from form element
      var text = event.target.text.value;

      // Insert a task into the collection
      Tasks.insert({
        text: text,
        checked: true,
        another: false,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.text.value = "";
    }
  });


  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },
    "click .another": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {
        $set: {another: ! this.another}
      });
    },
    "click .delete": function () {
      Tasks.remove(this._id);
    }
  });
}