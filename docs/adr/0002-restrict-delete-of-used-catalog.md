# A used catalog row cannot be deleted

An Intake points at a Food, and a Set points at a Lift, with ON DELETE RESTRICT. A Food's nutrient amount points at a Nutrient the same way. A Food or Lift can be deleted only when no log uses it. A Nutrient can be deleted only when no Food uses it. The nutrient amounts on a Food are part of that Food and are removed when the Food is deleted. When a Group is deleted, it is removed from Post audiences and the Posts stay.

## Considered options

- **ON DELETE CASCADE from a log to its Food or Lift.** Rejected. Deleting Milk would erase glasses already logged, and the author asked for a restrict constraint so only an unused catalog row can be deleted.

## Consequences

- To remove a Food that has been logged, the author deletes those Intakes first, then the Food. The same order applies to a Lift and its Sets.
