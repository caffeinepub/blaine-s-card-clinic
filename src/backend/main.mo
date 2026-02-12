import Set "mo:core/Set";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration"; // separate migration module

(with migration = Migration.run)
actor {
  var initialized = false; // Persistent initialization flag
  let adminIds = Set.empty<Principal>();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize access control - first non-anonymous caller becomes admin
  // Idempotent: safe to call multiple times, never revokes existing admin
  public shared ({ caller }) func initializeAccessControl() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Cannot initialize with anonymous principal");
    };
    if (initialized) {
      return; // Already initialized, safe to call again
    };
    // Provide two empty text arguments to match new four-parameter signature
    AccessControl.initialize(accessControlState, caller, "adminToken", "userProvidedToken");
    initialized := true;
    adminIds.add(caller); // First admin becomes only initial admin
  };

  // Admin only - list all admin principals
  public query ({ caller }) func getAdminIds() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list admin principals");
    };
    adminIds.toArray();
  };

  // Admin only - add a new admin principal
  public shared ({ caller }) func addAdminId(newAdmin : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add new admin ids");
    };
    adminIds.add(newAdmin);
    // Grant admin role in the access control system
    AccessControl.assignRole(accessControlState, caller, newAdmin, #admin);
  };

  // Diagnostics endpoint - returns initialization status
  public query ({ caller }) func getInitializationStatus() : async {
    isInitialized : Bool;
    callerIsAdmin : Bool;
    callerRole : Text;
  } {
    let role = AccessControl.getUserRole(accessControlState, caller);
    let roleText = switch (role) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };
    {
      isInitialized = initialized;
      callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
      callerRole = roleText;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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

  // Public - anyone can submit a contact form
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

  // Admin only - updating ticket status is internal operation
  public shared ({ caller }) func updateTicketStatus(email : Text, completed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ticket status");
    };
    switch (tickets.get(email)) {
      case (?ticket) {
        tickets.add(email, { ticket with completed });
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };

  // Public query - anyone can check ticket status
  public query ({ caller }) func isTicketCompleted(email : Text) : async Bool {
    switch (tickets.get(email)) {
      case (?ticket) {
        ticket.completed;
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };

  // Admin only - categorization is internal operation
  public shared ({ caller }) func addCategory(email : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };
    switch (tickets.get(email)) {
      case (?ticket) {
        tickets.add(email, { ticket with category });
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };

  // Admin only - categorization is internal operation
  public shared ({ caller }) func addCategories(email : Text, catArray : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };
    switch (tickets.get(email)) {
      case (?ticket) {
        let categories = Set.fromArray([ticket.category]);
        let allCategories = categories;
        for (category in catArray.values()) {
          allCategories.add(category);
        };
        tickets.add(email, { ticket with category = allCategories.toText() });
      };
      case (null) {
        Runtime.trap("Ticket not found");
      };
    };
  };

  // Admin only: New backend endpoint for listing tickets
  public query ({ caller }) func listAllTickets() : async [(Text, Ticket)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list tickets");
    };
    tickets.toArray();
  };

  // Tracking RESTORATION process -----------
  type RestorationStep = {
    description : Text;
    timestamp : Time.Time; // marks when step was completed
    completed : Bool;
  };

  // Type for public API (immutable) - used for return
  public type TrackingStateView = {
    trackingCode : Text;
    arrived : Bool;
    restorationLevel : Text;
    steps : [RestorationStep]; // immutable array for public API
    shipped : Bool;
    shippingTimestamp : ?Time.Time;
  };

  // Type for private backend state (mutable)
  type TrackingState = {
    trackingCode : Text;
    arrived : Bool;
    restorationLevel : Text;
    steps : List.List<RestorationStep>; // mutable list for internal use
    shipped : Bool;
    shippingTimestamp : ?Time.Time;
  };

  let trackingStore = Map.empty<Text, TrackingState>(); //track by code.

  // Convert mutable TrackingState to immutable TrackingStateView
  func toTrackingStateView(state : TrackingState) : TrackingStateView {
    {
      state with
      steps = state.steps.toArray();
    };
  };

  // Admin only - creating tracking entries is internal operation
  public shared ({ caller }) func createTrackingState(trackingCode : Text, restorationLevel : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tracking states");
    };
    let newState : TrackingState = {
      trackingCode;
      arrived = false;
      restorationLevel;
      steps = List.empty<RestorationStep>();
      shipped = false;
      shippingTimestamp = null;
    };
    trackingStore.add(trackingCode, newState);
  };

  // Admin only - marking arrival is internal operation
  public shared ({ caller }) func markPackageArrived(trackingCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark packages as arrived");
    };
    switch (trackingStore.get(trackingCode)) {
      case (?state) {
        trackingStore.add(trackingCode, { state with arrived = true });
      };
      case (null) {
        Runtime.trap("Tracking not found");
      };
    };
  };

  // Admin only - adding restoration steps is internal operation
  public shared ({ caller }) func addRestorationStep(trackingCode : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add restoration steps");
    };
    switch (trackingStore.get(trackingCode)) {
      case (?state) {
        let newStep : RestorationStep = {
          description;
          timestamp = Time.now();
          completed = false;
        };
        state.steps.add(newStep);
        trackingStore.add(trackingCode, state);
      };
      case (null) {
        Runtime.trap("Tracking not found");
      };
    };
  };

  // Admin only - completing restoration steps is internal operation
  public shared ({ caller }) func completeRestorationStep(trackingCode : Text, index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can complete restoration steps");
    };
    switch (trackingStore.get(trackingCode)) {
      case (?state) {
        let stepCount = state.steps.size();
        if (index >= stepCount) {
          Runtime.trap("Step index out of bounds");
        };

        let mutableSteps = List.empty<RestorationStep>();
        var currentIndex : Nat = 0;
        for (step in state.steps.values()) {
          if (currentIndex == index) {
            let updatedStep : RestorationStep = {
              step with completed = true;
              timestamp = Time.now();
            };
            mutableSteps.add(updatedStep);
          } else {
            mutableSteps.add(step);
          };
          currentIndex += 1;
        };

        trackingStore.add(trackingCode, { state with steps = mutableSteps });

      };
      case (null) {
        Runtime.trap("Tracking not found");
      };
    };
  };

  // Admin only - marking shipped is internal operation
  public shared ({ caller }) func markShipped(trackingCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark packages as shipped");
    };
    switch (trackingStore.get(trackingCode)) {
      case (?state) {
        trackingStore.add(
          trackingCode,
          {
            state with
            shipped = true;
            shippingTimestamp = ?Time.now();
          },
        );
      };
      case (null) {
        Runtime.trap("Tracking not found");
      };
    };
  };

  // Public query - anyone with tracking code can view status
  public query ({ caller }) func getTrackingState(trackingCode : Text) : async ?TrackingStateView {
    switch (trackingStore.get(trackingCode)) {
      case (?state) { ?toTrackingStateView(state) };
      case (null) { null };
    };
  };

  //--------------------- Orders Backend ----------------------------//
  public type OrderStatus = {
    #processing;
    #shipped;
    #delivered;
    #packageReceived; // New - for when package arrives at facility
    #inspectionComplete; // New - after initial inspection
    #cleaningComplete; // New - after cleaning phase
    #inPress; // New - card is being pressed
    #finalTouches; // New - final adjustments before shipping
  };

  public type Order = {
    trackingNumber : Text;
    status : OrderStatus;
    timestamp : Time.Time;
  };

  let orders = Map.empty<Text, Order>();

  // Public - anyone can create an order with a tracking number
  public shared ({ caller }) func createOrder(trackingNumber : Text) : async OrderStatus {
    let order : Order = {
      trackingNumber;
      status = #processing;
      timestamp = Time.now();
    };
    orders.add(trackingNumber, order);
    #processing;
  };

  // Public - anyone can check a specific order status by tracking number
  public query ({ caller }) func checkTrackingNumberStatus(trackingNumber : Text) : async OrderStatus {
    switch (orders.get(trackingNumber)) {
      case (?order) {
        order.status;
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  // Admin only - listing all orders is an admin dashboard feature
  public query ({ caller }) func getTrackingNumbers() : async [(Text, OrderStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all orders");
    };
    let entries = orders.toArray();
    let results = List.empty<(Text, OrderStatus)>();

    for ((trackingNumber, order) in entries.values()) {
      results.add((trackingNumber, order.status));
    };

    results.toArray();
  };

  // Admin only - update order status
  public shared ({ caller }) func updateTrackingNumberStatus(trackingNumber : Text, newStatus : OrderStatus) : async OrderStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(trackingNumber)) {
      case (null) {
        Runtime.trap("Tracking number not found");
      };
      case (?order) {
        let updatedOrder : Order = {
          order with status = newStatus;
        };
        orders.add(trackingNumber, updatedOrder);
        newStatus;
      };
    };
  };

  // Admin only - get all orders for admin dashboard
  public query ({ caller }) func examineTrackingNumbers() : async [(Text, OrderStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can examine all orders");
    };
    let ordersArray = orders.toArray();
    let results = List.empty<(Text, OrderStatus)>();

    for ((trackingNumber, order) in ordersArray.values()) {
      results.add((trackingNumber, order.status));
    };

    results.toArray();
  };
};
