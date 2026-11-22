# Gym Rats

People who train each have an account and a profile. They keep a private catalog of foods and lifts, log what they ate and what they lifted, publish posts, and see each other when they share a group.

## Language

**User**:
A person with an account. A User has exactly one Profile.
_Avoid_: account, member, person

**Profile**:
The single face of a User. It shows a display name, which is required, and a photo, which is optional. User A can see User B's Profile only when A and B share at least one Group. Seeing B this way does not show A the Users who share a Group with B but not with A. Other Users do not see B's other Groups.
_Avoid_: account, settings

**Group**:
A named set of Users. The Creator chooses the name when the Group is created. A User can be in more than one Group.
_Avoid_: club, room, team, circle

**Member**:
A User who currently belongs to a Group.
_Avoid_: participant

**Creator**:
The one Member who manages a Group. They can rename it, replace its Invite code, and remove another Member. When the Creator leaves and other Members remain, the Member who joined earliest becomes Creator. If several joined at the same moment, the one who became a User earliest becomes Creator. If the last Member leaves, the Group is gone.
_Avoid_: admin, owner, host

**Invite code**:
The one short code the system issues for a Group. No two Groups share a code at the same time. Every Member can see the current code. A User who enters it becomes a Member. A User who is already a Member stays one. The Creator can replace the code. Replacing it does not remove Members. An old code joins nobody.
_Avoid_: password, link, pin

**Day**:
The calendar date where the User is. An Intake or a Set belongs to one Day.
_Avoid_: workout, timestamp

**Nutrient**:
A named kind of nutrition on one global list every User shares. It has a unit, such as kcal, g, or mg. The list is maintained outside the app; a User cannot add one. A User may pick it when creating a Food. A Nutrient cannot be removed while a Food still uses it.
_Avoid_: nutrition type, macro, column

**Food**:
A nutritional definition created by one User. It has a name, one measure (grams or millilitres), and a base of 100 of that measure, or of 1 kilogram when the measure is grams. The creator may pick any subset of Nutrients, including none, and sets one amount of each, in that Nutrient's unit, for the base. The name, measure, base, and amounts cannot be changed after the Food is created. The same Nutrient appears at most once on a Food. A User cannot log an Intake of a Food they have not created. Another User can see a Food only by seeing an Intake of it. The User may delete a Food only when no Intake uses it; the nutrient amounts on it are removed with the Food.
_Avoid_: diet entry, ingredient, item, product

**Intake**:
One recorded consumption by a User of one of their Foods on a Day: which Food, and how much, as a number greater than zero in the Food's measure. A User may have many Intakes on the same Day, and may change or delete their own. Any User who shares a Group with them can see the Intake.
_Avoid_: diet entry, meal, serving

**Lift**:
An exercise a User defines before logging it. The name cannot be changed after the Lift is created. A User cannot log a Set of a Lift they have not defined. Another User can see a Lift only by seeing a Set of it. The User may delete a Lift only when no Set uses it.
_Avoid_: lift entry, weight, exercise

**Set**:
One log line for a Lift on a Day: an attempt (an integer of 1 or greater), reps (an integer of 1 or greater), and a load in kilograms (zero or greater). The attempt does not have to be unique. The author may change or delete their own Set. Any User who shares a Group with them can see the Set.
_Avoid_: workout, set number, weight entry

**Post**:
Text, one photo, or both, published by a User. At least one of text or photo is present. The author may change the text and the photo, and may delete the Post. It has an Audience the author can change later.
_Avoid_: update, status

**Audience**:
The visibility choices on a Post, which the author can change or clear later: their Profile, any number of Groups, or neither. Profile shows the Post to any User who shares a Group with the author; a Group shows it to that Group's Members only while the author is a Member of it, including again if the author rejoins; if no choice still qualifies, only the author can see the Post. When a Group is deleted, it drops out of every Audience and the Posts remain.
_Avoid_: privacy, share setting
