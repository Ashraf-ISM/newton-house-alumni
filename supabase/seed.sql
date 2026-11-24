-- =====================================================================
--  Seed data — DEMONSTRATION ONLY. Every row is flagged is_sample / is_demo
--  and is clearly labelled in the UI. Delete via the admin dashboard once
--  real content is available:  delete from alumni where is_sample;
-- =====================================================================

insert into public.gallery_categories (slug, name, description, sort_order) values
  ('hostel-life', 'Hostel Life', 'Everyday life within the red-brick walls', 0),
  ('cultural-events', 'Cultural Events', 'Performances, festivals and evenings together', 1),
  ('freshers', 'Freshers', 'First days and first friendships', 2),
  ('farewell', 'Farewell', 'The last evenings of each batch', 3),
  ('alumni-meets', 'Alumni Meets', 'Generations returning home', 4),
  ('celebrations', 'Celebrations', 'Illuminations and festive nights', 5),
  ('campus-memories', 'Campus Memories', 'The building, the gateway, the grounds', 6)
on conflict (slug) do nothing;

insert into public.gallery (category_slug, title, caption, image_url, width, height, alt, published, sort_order) values
  ('hostel-life', 'The Red-Brick Facade', 'Three storeys of green shutters behind the iron railings.', '/images/hero/newton-house-exterior.webp', 1388, 1020, 'The red-brick facade of Newton House with rows of green-shuttered windows behind its iron railings, Patna Science College', true, 0),
  ('celebrations', 'Lit for Celebration', 'Strings of light cascade down the facade on a festive night.', '/images/memories/illuminated-facade.webp', 582, 408, 'Newton House illuminated with strings of decorative lights during a celebration', true, 1),
  ('campus-memories', 'The Arched Gateway', 'The entrance every resident remembers walking through for the first time.', '/images/hostel/main-entrance.webp', 492, 468, 'The arched main entrance of Newton House framed by trees', true, 2),
  ('alumni-meets', 'Together Again', 'Residents and alumni gathered before the house.', '/images/memories/alumni-gathering.webp', 678, 300, 'A large group of Newton House residents and alumni gathered in front of the building', true, 3),
  ('hostel-life', 'Corner Light', 'Afternoon sun on the brick pilasters.', '/images/hostel/facade-corner.webp', 848, 780, 'Corner of the Newton House building showing its brick pilasters and green windows against a blue sky', true, 4),
  ('campus-memories', 'From the Archive: The Gateway', 'A sepia print of the arched entrance.', '/images/hostel/archive-entrance-sepia.webp', 444, 516, 'Archival sepia photograph of the arched entrance of Newton House', true, 5),
  ('campus-memories', 'From the Archive: The House', 'The building and its fenced grounds in an older print.', '/images/hostel/archive-exterior-sepia.webp', 636, 348, 'Archival sepia photograph of the Newton House building and its fenced grounds', true, 6),
  ('hostel-life', 'The Long Wing', 'Window after window — each one somebody''s room, somebody''s years.', '/images/hostel/facade-west-wing.webp', 860, 540, 'The long wing of Newton House with three storeys of green-shuttered windows', true, 7);

-- Sample alumni (fictional; generic organisations)
with s(full_name, graduation_year, department, designation, organisation, city, country, profession, visibility, n) as (values
  ('Aarav Sinha', 2012, 'Physics', 'Research Fellow', 'National Research Institute', 'Bengaluru', 'India', 'Academia & Research', 'public'::public.profile_visibility, 1),
  ('Ishaan Prasad', 2015, 'Chemistry', 'Process Chemist', 'Pharmaceutical Manufacturer', 'Hyderabad', 'India', 'Science & Technology', 'public'::public.profile_visibility, 2),
  ('Rohan Kumar', 2016, 'Mathematics', 'Software Engineer', 'Global Technology Company', 'Pune', 'India', 'Science & Technology', 'public'::public.profile_visibility, 3),
  ('Vivek Ranjan', 2018, 'Physics', 'Scientist', 'Defence Research Laboratory', 'New Delhi', 'India', 'Science & Technology', 'public'::public.profile_visibility, 4),
  ('Kunal Verma', 2009, 'Zoology', 'Assistant Professor', 'State University', 'Patna', 'India', 'Academia & Research', 'public'::public.profile_visibility, 5),
  ('Siddharth Jha', 2011, 'Statistics', 'Data Science Lead', 'Financial Services Firm', 'Mumbai', 'India', 'Corporate', 'public'::public.profile_visibility, 6),
  ('Ankit Choudhary', 2014, 'Botany', 'Conservation Officer', 'State Forest Department', 'Ranchi', 'India', 'Civil Services', 'public'::public.profile_visibility, 7),
  ('Pranav Mishra', 2007, 'Physics', 'Postdoctoral Researcher', 'European Research University', 'Munich', 'Germany', 'Academia & Research', 'public'::public.profile_visibility, 8),
  ('Harsh Vardhan', 2019, 'Computer Science', 'Founder', 'Early-stage Education Startup', 'Patna', 'India', 'Entrepreneurship', 'public'::public.profile_visibility, 9),
  ('Abhinav Raj', 2005, 'Chemistry', 'Senior Manager, R&D', 'Materials Company', 'Singapore', 'Singapore', 'Corporate', 'public'::public.profile_visibility, 10),
  ('Devansh Thakur', 2013, 'Geology', 'Exploration Geologist', 'Public Sector Mining Enterprise', 'Dhanbad', 'India', 'Engineering', 'public'::public.profile_visibility, 11),
  ('Manish Anand', 2010, 'Mathematics', 'Associate Professor', 'Institute of Technology', 'Kharagpur', 'India', 'Academia & Research', 'public'::public.profile_visibility, 12),
  ('Nikhil Shekhar', 2017, 'Physics', 'Instrumentation Engineer', 'Space Applications Centre', 'Ahmedabad', 'India', 'Engineering', 'public'::public.profile_visibility, 13),
  ('Saurabh Pandey', 2008, 'Zoology', 'Physician', 'Multi-speciality Hospital', 'Lucknow', 'India', 'Medicine & Healthcare', 'public'::public.profile_visibility, 14),
  ('Aditya Narayan', 2004, 'Statistics', 'Deputy Director', 'Statistical Services', 'New Delhi', 'India', 'Civil Services', 'members'::public.profile_visibility, 15),
  ('Rahul Deo', 2020, 'Chemistry', 'Doctoral Candidate', 'Institute of Science', 'Bengaluru', 'India', 'Academia & Research', 'public'::public.profile_visibility, 16),
  ('Yash Agrawal', 2021, 'Computer Science', 'Product Analyst', 'E-commerce Company', 'Gurugram', 'India', 'Corporate', 'public'::public.profile_visibility, 17),
  ('Tushar Kant', 2006, 'Physics', 'Higher Secondary Teacher', 'Government School', 'Gaya', 'India', 'Education', 'public'::public.profile_visibility, 18),
  ('Gaurav Bhushan', 2003, 'Botany', 'Agricultural Scientist', 'Agricultural Research Council', 'Pusa', 'India', 'Science & Technology', 'public'::public.profile_visibility, 19),
  ('Kartik Sahay', 2012, 'Mathematics', 'Quantitative Analyst', 'Investment Bank', 'London', 'United Kingdom', 'Corporate', 'public'::public.profile_visibility, 20),
  ('Mayank Srivastava', 2016, 'Geology', 'Hydrogeologist', 'Water Resources Board', 'Bhopal', 'India', 'Science & Technology', 'public'::public.profile_visibility, 21),
  ('Shubham Raj', 2022, 'Physics', 'Graduate Student', 'North American University', 'Toronto', 'Canada', 'Academia & Research', 'public'::public.profile_visibility, 22),
  ('Amitesh Kumar', 2001, 'Chemistry', 'Advocate', 'High Court Bar', 'Patna', 'India', 'Law & Policy', 'public'::public.profile_visibility, 23),
  ('Prateek Sharan', 2015, 'Zoology', 'Co-founder', 'Health-tech Venture', 'Bengaluru', 'India', 'Entrepreneurship', 'public'::public.profile_visibility, 24)
),
ins as (
  insert into public.alumni (slug, full_name, email, graduation_year, department, status, is_sample)
  select public.slugify(full_name || '-' || graduation_year), full_name, 'sample' || n || '@example.invalid', graduation_year, department, 'approved', true from s
  on conflict (slug) do nothing
  returning id, full_name, graduation_year
)
insert into public.alumni_profiles (alumni_id, designation, organisation, city, country, profession, bio, visibility)
select ins.id, s.designation, s.organisation, s.city, s.country, s.profession,
  split_part(s.full_name, ' ', 1) || ' is a sample profile used to demonstrate how Newton House alumni appear in the directory. Real biographies are written by members and published only after admin approval.',
  s.visibility
from ins join s on s.full_name = ins.full_name and s.graduation_year = ins.graduation_year;

insert into public.events (slug, title, category, starts_at, ends_at, venue, city, summary, body, image_url, registration_open, capacity, is_demo, published) values
  ('newton-house-alumni-meet-2026', 'Newton House Alumni Meet 2026', 'reunion', '2026-12-27T05:30:00Z', '2026-12-27T13:30:00Z', 'Newton House, Patna Science College', 'Patna', 'A day for every generation to return to the house: reunion, walk-through of the hostel and an evening together.', 'This is a demonstration event that shows how a reunion is presented and how registrations work. Details will be replaced by the Association''s confirmed programme.', '/images/hero/newton-house-exterior.webp', true, 300, true, true),
  ('guest-lecture-science-and-society', 'Guest Lecture: Science & Society', 'lecture', '2027-01-23T11:00:00Z', '2027-01-23T13:00:00Z', 'Venue to be confirmed, Patna Science College', 'Patna', 'An alumnus speaker in conversation with current residents about careers built on a science education.', 'This is a demonstration event. The speaker and topic will be announced by the Association.', '/images/hostel/facade-west-wing.webp', true, 120, true, true),
  ('alumni-networking-evening', 'Alumni Networking Evening', 'networking', '2027-02-20T13:00:00Z', '2027-02-20T16:00:00Z', 'Venue to be announced', 'New Delhi', 'An informal evening for alumni in the capital region to meet, mentor and reconnect.', 'This is a demonstration event illustrating city chapter meet-ups.', '/images/hostel/facade-corner.webp', true, 80, true, true),
  ('illumination-night', 'Illumination Night at Newton House', 'cultural', '2027-03-13T13:30:00Z', null, 'Newton House Courtyard', 'Patna', 'The facade lit once more: a cultural evening hosted by current residents, with alumni as guests.', 'This is a demonstration event. The Association will confirm the date with the current residents.', '/images/memories/illuminated-facade.webp', false, null, true, true)
on conflict (slug) do nothing;

insert into public.achievements (slug, name, designation, organisation, category, summary, biography, is_sample, published) values
  ('sample-academics-research', 'Sample Profile — Academics & Research', 'Designation appears here', 'Organisation appears here', 'academics-research', 'A placeholder showing how a verified academics & research achievement will be presented: a concise one-line citation.', 'This is a demonstration profile. It does not describe a real person, award or affiliation.

When a Newton House alumnus is nominated, the Association verifies the details with the member before publishing.', true, true),
  ('sample-government-public-service', 'Sample Profile — Government & Public Service', 'Designation appears here', 'Organisation appears here', 'government-public-service', 'A placeholder showing how a verified government & public service achievement will be presented: a concise one-line citation.', 'This is a demonstration profile. It does not describe a real person, award or affiliation.

When a Newton House alumnus is nominated, the Association verifies the details with the member before publishing.', true, true),
  ('sample-science-technology', 'Sample Profile — Science & Technology', 'Designation appears here', 'Organisation appears here', 'science-technology', 'A placeholder showing how a verified science & technology achievement will be presented: a concise one-line citation.', 'This is a demonstration profile. It does not describe a real person, award or affiliation.

When a Newton House alumnus is nominated, the Association verifies the details with the member before publishing.', true, true),
  ('sample-corporate-leadership', 'Sample Profile — Corporate Leadership', 'Designation appears here', 'Organisation appears here', 'corporate-leadership', 'A placeholder showing how a verified corporate leadership achievement will be presented: a concise one-line citation.', 'This is a demonstration profile. It does not describe a real person, award or affiliation.

When a Newton House alumnus is nominated, the Association verifies the details with the member before publishing.', true, true),
  ('sample-entrepreneurship', 'Sample Profile — Entrepreneurship', 'Designation appears here', 'Organisation appears here', 'entrepreneurship', 'A placeholder showing how a verified entrepreneurship achievement will be presented: a concise one-line citation.', 'This is a demonstration profile. It does not describe a real person, award or affiliation.

When a Newton House alumnus is nominated, the Association verifies the details with the member before publishing.', true, true),
  ('sample-other', 'Sample Profile — Other Professional Achievements', 'Designation appears here', 'Organisation appears here', 'other', 'A placeholder showing how a verified other professional achievements achievement will be presented: a concise one-line citation.', 'This is a demonstration profile. It does not describe a real person, award or affiliation.

When a Newton House alumnus is nominated, the Association verifies the details with the member before publishing.', true, true)
on conflict (slug) do nothing;

insert into public.announcements (title, body, published, published_at) values
  ('The Newton House alumni platform is live', 'Register to join the verified directory. Every profile is reviewed by the Association before it appears publicly.', true, now());

-- ---------------------------------------------------------------------
-- Grant admin access (run once, after the person has signed up):
--   insert into public.admin_users (user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------
