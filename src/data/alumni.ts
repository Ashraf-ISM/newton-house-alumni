import type { AlumniRecord, Department, Profession } from "@/types";

/**
 * SAMPLE ALUMNI RECORDS — FOR DEMONSTRATION ONLY.
 * These are fictional people created to demonstrate the directory, filters
 * and profile pages. They are flagged `isSample: true` and the UI labels
 * them clearly. Organisations are generic descriptions, not real employers.
 * Replace by approving genuine registrations through the admin dashboard.
 */

type Seed = [
  name: string,
  year: number,
  dept: Department,
  designation: string,
  organisation: string,
  city: string,
  country: string,
  profession: Profession,
  visibility?: "public" | "members",
];

const seeds: Seed[] = [
  ["Syed Md Enam", 2022, "Geology", "Geologist", "Al Tasnim Group (Al Tasnim Enterprises LLC)", "Muscat", "Oman", "Science & Technology"],
  ["Sujeet Pandey", 2022, "Geology", "Geologist", "", "New Delhi", "India", "Engineering"],
  ["Rohan Kumar", 2016, "Mathematics", "Software Engineer", "Global Technology Company", "Pune", "India", "Science & Technology"],
  ["Vivek Ranjan", 2018, "Physics", "Scientist", "Defence Research Laboratory", "New Delhi", "India", "Science & Technology"],
  ["Kunal Verma", 2009, "Zoology", "Assistant Professor", "State University", "Patna", "India", "Academia & Research"],
  ["Siddharth Jha", 2011, "Statistics", "Data Science Lead", "Financial Services Firm", "Mumbai", "India", "Corporate"],
  ["Ankit Choudhary", 2014, "Botany", "Conservation Officer", "State Forest Department", "Ranchi", "India", "Civil Services"],
  ["Pranav Mishra", 2007, "Physics", "Postdoctoral Researcher", "European Research University", "Munich", "Germany", "Academia & Research"],
  ["Harsh Vardhan", 2019, "Computer Science", "Founder", "Early-stage Education Startup", "Patna", "India", "Entrepreneurship"],
  ["Abhinav Raj", 2005, "Chemistry", "Senior Manager, R&D", "Materials Company", "Singapore", "Singapore", "Corporate"],
  ["Devansh Thakur", 2013, "Geology", "Exploration Geologist", "Public Sector Mining Enterprise", "Dhanbad", "India", "Engineering"],
  ["Manish Anand", 2010, "Mathematics", "Associate Professor", "Institute of Technology", "Kharagpur", "India", "Academia & Research"],
  ["Nikhil Shekhar", 2017, "Physics", "Instrumentation Engineer", "Space Applications Centre", "Ahmedabad", "India", "Engineering"],
  ["Saurabh Pandey", 2008, "Zoology", "Physician", "Multi-speciality Hospital", "Lucknow", "India", "Medicine & Healthcare"],
  ["Aditya Narayan", 2004, "Statistics", "Deputy Director", "Statistical Services", "New Delhi", "India", "Civil Services", "members"],
  ["Rahul Deo", 2020, "Chemistry", "Doctoral Candidate", "Institute of Science", "Bengaluru", "India", "Academia & Research"],
  ["Yash Agrawal", 2021, "Computer Science", "Product Analyst", "E-commerce Company", "Gurugram", "India", "Corporate"],
  ["Tushar Kant", 2006, "Physics", "Higher Secondary Teacher", "Government School", "Gaya", "India", "Education"],
  ["Gaurav Bhushan", 2003, "Botany", "Agricultural Scientist", "Agricultural Research Council", "Pusa", "India", "Science & Technology"],
  ["Kartik Sahay", 2012, "Mathematics", "Quantitative Analyst", "Investment Bank", "London", "United Kingdom", "Corporate"],
  ["Mayank Srivastava", 2016, "Geology", "Hydrogeologist", "Water Resources Board", "Bhopal", "India", "Science & Technology"],
  ["Shubham Raj", 2022, "Physics", "Graduate Student", "North American University", "Toronto", "Canada", "Academia & Research"],
  ["Amitesh Kumar", 2001, "Chemistry", "Advocate", "High Court Bar", "Patna", "India", "Law & Policy"],
  ["Prateek Sharan", 2015, "Zoology", "Co-founder", "Health-tech Venture", "Bengaluru", "India", "Entrepreneurship"],
];

function slugFor(name: string, year: number) {
  return `${name.toLowerCase().replace(/[^a-z]+/g, "-")}-${year}`;
}

export const sampleAlumni: AlumniRecord[] = seeds.map((s, i) => {
  const [fullName, graduationYear, department, designation, organisation, city, country, profession, visibility] = s;
  return {
    id: `sample-alumni-${i + 1}`,
    slug: slugFor(fullName, graduationYear),
    fullName,
    graduationYear,
    department,
    designation,
    organisation,
    city,
    country,
    profession,
    linkedinUrl: null,
    photoUrl: null,
    bio: `${fullName.split(" ")[0]} is a sample profile used to demonstrate how Newton House alumni appear in the directory. Real biographies are written by members and published only after admin approval.`,
    visibility: visibility ?? "public",
    publicEmail: null,
    status: "approved",
    isSample: true,
    createdAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
    email: `sample${i + 1}@example.invalid`,
    phone: null,
    showEmail: false,
    userId: null,
  };
});

export const departments: Department[] = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Botany",
  "Zoology",
  "Geology",
  "Statistics",
  "Computer Science",
  "Other",
];

export const professions: Profession[] = [
  "Academia & Research",
  "Civil Services",
  "Science & Technology",
  "Engineering",
  "Medicine & Healthcare",
  "Corporate",
  "Entrepreneurship",
  "Law & Policy",
  "Education",
  "Other",
];
