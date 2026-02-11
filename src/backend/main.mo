import Set "mo:core/Set";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

actor {
  type FormData = {
    name : Text;
    email : Text;
    message : Text;
  };

  type Ticket = {
    formData : FormData;
    category : Text;
    completed : Bool;
  };

  let tickets = Map.empty<Text, Ticket>();

  public shared ({ caller }) func submitContactForm(name : Text, email : Text, message : Text) : async () {
    let ticket : Ticket = {
      formData = {
        name;
        email;
        message;
      };
      category = "quote-repair";
      completed = false;
    };
    tickets.add(email, ticket);
  };

  public shared ({ caller }) func updateTicketStatus(email : Text, completed : Bool) : async () {
    let ticket = tickets.get(email);
    switch (ticket) {
      case (?ticket) {
        tickets.add(email, { ticket with completed });
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };

  public query ({ caller }) func isTicketCompleted(email : Text) : async Bool {
    let ticket = tickets.get(email);
    switch (ticket) {
      case (?ticket) {
        ticket.completed;
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };

  public shared ({ caller }) func addCategory(email : Text, category : Text) : async () {
    switch (tickets.get(email)) {
      case (?ticket) {
        let updatedTicket : Ticket = {
          ticket with
          category;
        };
        tickets.add(email, updatedTicket);
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };

  public shared ({ caller }) func addCategories(email : Text, catArray : [Text]) : async () {
    switch (tickets.get(email)) {
      case (?ticket) {
        let categories = Set.fromArray([ticket.category]);
        let allCategories = categories;
        for (category in catArray.values()) {
          allCategories.add(category);
        };
        let category = allCategories.toText();
        let updatedTicket : Ticket = {
          ticket with category;
        };
        tickets.add(email, updatedTicket);
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };
};
