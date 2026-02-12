import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    initialized : Bool;
  };
  type NewActor = {
    initialized : Bool;
    adminIds : Set.Set<Principal>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with adminIds = Set.empty<Principal>();
    };
  };
};
