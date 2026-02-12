import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
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

  public type CleaningType = {
    #superPotion;
    #hyperPotion;
    #maxPotion;
  };

  type OldOrder = {
    trackingNumber : Text;
    status : OrderStatus;
    timestamp : Time.Time;
  };

  type NewOrder = {
    trackingNumber : Text;
    status : OrderStatus;
    timestamp : Time.Time;
    customerName : Text;
    customerEmail : Text;
    numberOfCards : Nat;
    cleaningType : CleaningType;
  };

  type OldActor = {
    orders : Map.Map<Text, OldOrder>;
  };

  type NewActor = {
    orders : Map.Map<Text, NewOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Text, OldOrder, NewOrder>(
      func(_trackingNumber, oldOrder) {
        {
          oldOrder with
          customerName = "";
          customerEmail = "";
          numberOfCards = 0;
          cleaningType = #superPotion;
        };
      }
    );
    { orders = newOrders };
  };
};
