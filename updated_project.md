5-role system

1. Student

Main marketplace user.

What they do
register/login
browse tutors
search and filter tutors
view tutor details
book sessions
cancel bookings
review tutors
manage profile 2. Tutor

Service provider.

What they do
create tutor profile
update tutor profile
manage availability
view bookings/sessions
complete sessions
view reviews and ratings
manage public teaching information 3. Admin

System controller.

What they do
manage all users
manage categories
manage all bookings
see platform stats
activate/block users
supervise whole system 4. Moderator

Content and quality control role.

What they do
review reported reviews/comments/profiles
hide or flag inappropriate content
monitor tutor profile quality
monitor spam/fake reviews
assist admin with moderation tasks

This is very realistic and makes the project look advanced.

5. Support Manager

Operational support role.

What they do
handle support tickets
resolve booking disputes
respond to contact/help requests
monitor cancellation issues
help students and tutors with account problems

This role is easier to implement than a vendor/manager role and fits SkillBridge naturally.

Full project requirements with 5 roles

Below is the clean version you can follow for both frontend and backend.

A. Public frontend requirements

1. Global layout

You need:

sticky navbar
footer
responsive design
minimum 6 navigation routes
at least 1 dropdown or advanced menu
same horizontal spacing across pages
all links clickable
Suggested navbar routes
Home
Find Tutors
About
Blog or Resources
Support
Contact

Optional:

Become a Tutor
Login
Register 2. Home page

Your update file requires a richer homepage.

Recommended 10+ sections
Hero section
Search tutors section
Featured categories
How SkillBridge works
Featured tutors
Top-rated tutors
Statistics/counter section
Testimonials
Blog/resources
FAQ
Newsletter
Become a tutor CTA

That will fully satisfy the homepage requirement much better than a simple landing page.

3. Explore/List page

Public page for all tutors.

Must include
search bar
category filter
price filter
rating filter
sorting
pagination or infinite scroll
skeleton loading
responsive grid
Tutor card must show
image
name
subject/category
short bio
rating
hourly rate
verification badge if available
details button 4. Tutor details page

Publicly accessible.

Sections
tutor overview
experience
skills/subjects
availability
reviews
related tutors
booking action

This matches your current frontend direction and should be polished further.

5. Additional public pages

You need 2–3 extra complete pages besides home and tutors list.

Best choices
About
Support
Contact
Privacy Policy
Terms & Conditions
Blog

You already have several of these in the frontend, so just make them complete and polished.

B. Authentication and authorization requirements
Auth pages
Login page
Register page
Verify email page
Social login
Demo credentials button
Demo login options
Demo Student
Demo Tutor
Demo Admin
Demo Moderator
Demo Support

This looks impressive in project demo.

Access control rules

Each role must only access its own dashboard area.

Example
Student → /dashboard
Tutor → /tutor-dashboard
Admin → /admin-dashboard
Moderator → /moderator-dashboard
Support → /support-dashboard

Your project already uses role-aware routing concepts, so extending this is possible.

C. Dashboard requirements by role

This is the most important part of your 5-role design.

1. Student dashboard
   Main goal

Help students manage learning activity.

Sidebar menu
Dashboard
Find Tutors
My Bookings
My Reviews
My Profile
Student dashboard home widgets
total bookings
upcoming sessions
cancelled sessions
completed sessions
Student pages
Dashboard home
overview cards
recent bookings table
booking status chart
My Bookings
all student bookings
status
tutor info
cancel action
join/view details if needed
My Reviews
list of submitted reviews
edit/delete if allowed
My Profile
editable user information
profile image
account status
Find Tutors
search and explore page shortcut 2. Tutor dashboard
Main goal

Help tutors manage tutoring operations.

Sidebar menu
Dashboard
My Profile
Availability
Sessions
Reviews
Public Profile Preview
Tutor dashboard home widgets
total sessions
upcoming sessions
completed sessions
average rating
Tutor pages
Dashboard home
cards
booking trend chart
rating chart
recent sessions table
My Profile
tutor profile create/update
subjects
hourly rate
experience
bio
teaching method
Availability
create slot
delete slot
weekly slot management
Sessions
view assigned sessions
mark session complete
session history
Reviews
all reviews from students
average rating summary
Public Profile Preview
see tutor profile exactly as public users see it

Your frontend review already confirms tutor profile management and availability-related areas exist, so this is very feasible.

3. Admin dashboard
   Main goal

Control the whole platform.

Sidebar menu
Dashboard
Users
Tutors
Bookings
Categories
Reports
Settings
Admin dashboard home widgets
total users
total tutors
total students
total bookings
active categories
pending issues
Admin pages
Dashboard home
overview cards
user growth chart
booking chart
role distribution pie chart
recent activity table
Users
list all users
search/filter
block/unblock
change status
Tutors
monitor tutor accounts
verify tutor profile if needed
Bookings
list all bookings
search/filter
see disputes/cancellations
Categories
create/update categories
Reports
reported reviews
reported tutor profiles
moderation-related system reports
Settings
optional simple system settings page

Your frontend already has admin bookings, categories, and users direction, so this role is already strongly aligned.

4. Moderator dashboard
   Main goal

Moderate content, not control the whole system.

Sidebar menu
Dashboard
Reported Reviews
Reported Profiles
Content Queue
Activity Log
Moderator dashboard home widgets
pending reports
resolved reports
hidden reviews
flagged tutor profiles
Moderator pages
Dashboard home
moderation stats cards
report trend chart
latest reported items table
Reported Reviews
see flagged reviews
approve/hide/remove
Reported Profiles
see suspicious or incomplete tutor profiles
flag for admin review
Content Queue
centralized moderation queue
Activity Log
moderator actions history
Why this role is good

It looks advanced, but you can implement it with a simple report-and-flag system.

5. Support Manager dashboard
   Main goal

Handle user issues and support operations.

Sidebar menu
Dashboard
Support Tickets
Booking Issues
Contact Requests
User Assistance Log
Support dashboard home widgets
open tickets
resolved tickets
pending booking issues
urgent issues
Support pages
Dashboard home
cards
support ticket chart
recent issue table
Support Tickets
list all submitted tickets
assign status: open, pending, resolved
Booking Issues
disputes, cancellations, refund-related requests if modeled
Contact Requests
messages from contact/support page
User Assistance Log
support interaction history
Why this role is smart

This role is easy to justify academically and is highly practical.

D. Backend requirements for 5 roles

Now the backend side.

1. User model

You need role-based users.

Role enum
STUDENT
TUTOR
ADMIN
MODERATOR
SUPPORT_MANAGER

This should be consistent in:

Prisma schema
auth logic
middleware
seed/demo users 2. Core modules you already have

You already have strong backend direction around:

auth
tutor
booking
availability
review
category
admin

Now extend with:

support ticket module
report module
moderation actions
contact/help requests 3. Required backend modules
Auth module
register
login
social auth
current user
logout
email verification
User module
profile view/update
role-based retrieval
admin status update
Tutor module
create tutor profile
update tutor profile
get tutor list
get tutor details
get tutor own profile
Availability module
create slot
list tutor slots
delete slot
Booking module
create booking
get my bookings
get tutor sessions
admin get all bookings
cancel booking
complete booking
Review module
create review
optionally list own reviews
optionally get tutor reviews
Category module
list categories
create category
update category
Report module

Needed for Moderator role.

Features
report review
report tutor profile
get all reports
change report status
moderation decision
Support module

Needed for Support Manager role.

Features
create support ticket
get my tickets
get all tickets
update ticket status
handle booking issue requests
handle contact submissions 4. Backend permissions by role
STUDENT

Can:

view tutors
create booking
cancel own booking
create review
create support ticket
report content
update own profile

Cannot:

manage all users
moderate content
view all platform data
TUTOR

Can:

manage own tutor profile
manage own availability
view own sessions
complete own sessions
view own reviews
create support ticket
update own profile

Cannot:

manage categories
manage all users
see all bookings
ADMIN

Can:

view/manage all users
manage bookings
manage categories
view reports
see analytics
activate/block accounts
MODERATOR

Can:

view reported content
approve/hide/flag reviews
flag tutor profiles
update report status

Cannot:

manage all platform settings
manage user statuses unless admin allows it
SUPPORT_MANAGER

Can:

view support tickets
resolve contact requests
handle booking complaints
update ticket status

Cannot:

delete platform content
manage admin settings
E. Database design additions

To support 5 roles properly, you will likely need these extra tables besides your existing ones.

Existing likely tables
User
TutorProfile
Booking
Review
Availability
Category
Add these
SupportTicket
ContactRequest
Report
ModerationAction
Example SupportTicket fields
id
userId
subject
message
type
status
priority
createdAt
updatedAt
assignedToId
Example Report fields
id
reporterId
targetType (REVIEW, TUTOR_PROFILE)
targetId
reason
status
moderatorId
createdAt
updatedAt
