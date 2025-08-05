import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import Alumni from '../models/Alumni.js';
import Notification from '../models/Notification.js';
import fetch from 'node-fetch';

const router = express.Router();

// Endpoint to scrape alumni data from LinkedIn and Naukri.com
router.post('/scrape', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { keywords, source, limit = 5 } = req.body;
    
    if (!keywords || !source) {
      return res.status(400).json({ error: 'Keywords and source are required' });
    }
    
    if (!['linkedin', 'naukri'].includes(source.toLowerCase())) {
      return res.status(400).json({ error: 'Source must be either "linkedin" or "naukri"' });
    }
    
    // Process keywords: convert string to array if needed
    let processedKeywords = [];
    if (typeof keywords === 'string') {
      // Split by commas or spaces
      processedKeywords = keywords.split(/[,\s]+/).filter(k => k.trim().length > 0);
    } else if (Array.isArray(keywords)) {
      processedKeywords = keywords.filter(k => k && typeof k === 'string' && k.trim().length > 0);
    } else {
      return res.status(400).json({ error: 'Keywords must be a string or an array of strings.' });
    }
    
    if (processedKeywords.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid keyword.' });
    }
    
    // Validate and process limit
    const processedLimit = Math.min(Math.max(parseInt(limit) || 5, 1), 20); // Between 1 and 20
    
    // This is a mock implementation since actual web scraping would require:
    // 1. Proper authentication/authorization with the target sites
    // 2. Compliance with their Terms of Service
    // 3. Handling of rate limiting, CAPTCHAs, etc.
    // 4. Potentially using a headless browser like Puppeteer
    
    // For a real implementation, you would need to use a service like:
    // - LinkedIn API (requires partnership)
    // - A web scraping service/API
    // - Or implement a more sophisticated scraper with Puppeteer/Playwright
    
    // Mock data based on the source
    let scrapedProfiles = [];
    
    if (source.toLowerCase() === 'linkedin') {
      scrapedProfiles = generateMockLinkedInProfiles(processedKeywords, processedLimit);
      console.log(`Generated ${scrapedProfiles.length} LinkedIn profiles for keywords: ${processedKeywords.join(', ')}`);
    } else {
      scrapedProfiles = generateMockNaukriProfiles(processedKeywords, processedLimit);
      console.log(`Generated ${scrapedProfiles.length} Naukri profiles for keywords: ${processedKeywords.join(', ')}`);
    }
    
    res.status(200).json({ 
      profiles: scrapedProfiles,
      meta: {
        source,
        keywords: processedKeywords,
        limit: processedLimit,
        count: scrapedProfiles.length
      }
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Server error during scraping', message: error.message });
  }
});

// Endpoint to add a scraped profile as an alumni
router.post('/add-scraped-profile', authenticateToken, isAdmin, async (req, res) => {
  try {
    const profileData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'source'];
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if alumni with this email already exists
    const existingAlumni = await Alumni.findOne({ email: profileData.email });
    
    if (existingAlumni) {
      return res.status(409).json({ 
        error: 'Alumni with this email already exists',
        existingAlumni,
        message: `${profileData.name} already exists in the database with ID: ${existingAlumni._id}`
      });
    }
    
    // Transform the scraped profile data to match Alumni model
    const alumniData = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone || '',
      batch: profileData.batch || new Date().getFullYear() - 4, // Estimate graduation year
      degree: profileData.degree || 'Graduate',
      occupation: profileData.designation || '',
      company: profileData.company || '',
      location: profileData.location || '',
      bio: profileData.bio || '',
      profilePicture: profileData.image || '',
      socialLinks: {
        linkedin: profileData.linkedInProfile || '',
        twitter: '',
        facebook: '',
        instagram: '',
        website: ''
      },
      isVerified: false // Require manual verification
    };
    
    // Create new alumni document
    const alumniToAdd = new Alumni(alumniData);
    
    // Save to database
    const savedAlumni = await alumniToAdd.save();
    
    // Add notification
    await Notification.create({
      title: 'New Alumni Added via Scraping',
      message: `New alumni ${savedAlumni.name} added from ${profileData.source} and needs verification`,
      type: 'alumni',
      isRead: false,
      forAdmin: true,
      link: `/admin/alumni/${savedAlumni._id}`
    });
    
    console.log(`Added new alumni from ${profileData.source}: ${profileData.name} (${profileData.email})`);
    
    res.status(201).json({
      success: true,
      alumni: savedAlumni,
      message: `Successfully added ${profileData.name} from ${profileData.source} as a new alumni.`
    });
  } catch (error) {
    console.error('Add scraped profile error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to generate mock LinkedIn profiles
function generateMockLinkedInProfiles(keywords, limit) {
  const profiles = [];
  const keywordStr = keywords.join(' ').toLowerCase();
  const firstNames = ['Alex', 'Jamie', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skyler', 'Rohan', 'Priya', 'Arjun', 'Neha'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Patel', 'Sharma', 'Kumar', 'Singh'];
  
  // Extract college name from keywords if present
  let collegeName = '';
  if (keywordStr.includes('college') || keywordStr.includes('university') || keywordStr.includes('institute')) {
    const collegeKeywords = keywords.filter(k => 
      k.toLowerCase().includes('college') || 
      k.toLowerCase().includes('university') || 
      k.toLowerCase().includes('institute')
    );
    collegeName = collegeKeywords.length > 0 ? collegeKeywords[0] : 'University';
  } else {
    collegeName = 'University';
  }
  
  // Extract department/field if present
  let department = '';
  const departmentKeywords = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Medicine', 'Law'];
  for (const dept of departmentKeywords) {
    if (keywordStr.toLowerCase().includes(dept.toLowerCase())) {
      department = dept;
      break;
    }
  }
  if (!department) {
    department = 'Computer Science';
  }
  
  // Extract batch year if present
  let batchYear = null;
  const yearRegex = /\b(19|20)\d{2}\b/;
  const yearMatch = keywordStr.match(yearRegex);
  if (yearMatch) {
    batchYear = parseInt(yearMatch[0]);
  }
  
  for (let i = 0; i < limit; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const graduationYear = batchYear || (new Date().getFullYear() - Math.floor(Math.random() * 10) - 1);
    const emailDomain = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'][Math.floor(Math.random() * 4)];
    
    // Generate skills based on department
    let skills = [];
    if (department.toLowerCase().includes('computer') || department.toLowerCase().includes('engineering')) {
      skills = ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Machine Learning', 'Data Science'];
    } else if (department.toLowerCase().includes('business')) {
      skills = ['Marketing', 'Finance', 'Project Management', 'Leadership', 'Strategy', 'Sales'];
    } else {
      skills = ['Research', 'Analysis', 'Communication', 'Problem Solving', 'Critical Thinking'];
    }
    
    // Select random skills
    const selectedSkills = [];
    for (let j = 0; j < 3; j++) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      if (!selectedSkills.includes(randomSkill)) {
        selectedSkills.push(randomSkill);
      }
    }
    
    profiles.push({
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${emailDomain}`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      batch: graduationYear,
      degree: department.includes('Computer') ? ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc'][Math.floor(Math.random() * 4)] : ['BBA', 'MBA', 'B.A', 'M.A', 'B.Sc', 'M.Sc'][Math.floor(Math.random() * 6)],
      designation: department.includes('Computer') ? 
        ['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer'][Math.floor(Math.random() * 5)] :
        ['Marketing Specialist', 'Business Analyst', 'Project Manager', 'HR Manager', 'Operations Manager'][Math.floor(Math.random() * 5)],
      company: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'IBM', 'Oracle', 'Salesforce'][Math.floor(Math.random() * 10)],
      location: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Los Angeles', 'London', 'Berlin', 'Toronto'][Math.floor(Math.random() * 10)],
      bio: `${department} graduate from ${collegeName} (Class of ${graduationYear}). Skilled in ${selectedSkills.join(', ')}. Passionate about innovation and problem-solving.`,
      image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=200`,
      linkedInProfile: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 10000)}`,
      source: 'LinkedIn'
    });
  }
  
  return profiles;
}

// Helper function to generate mock Naukri profiles
function generateMockNaukriProfiles(keywords, limit) {
  const profiles = [];
  const keywordStr = keywords.join(' ').toLowerCase();
  const indianFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Ayaan', 'Ananya', 'Diya', 'Aditi', 'Myra', 'Aadhya', 'Avni', 'Riya'];
  const indianLastNames = ['Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Rao', 'Reddy', 'Nair', 'Iyer', 'Mehta', 'Malhotra', 'Agarwal'];
  
  // Extract college name from keywords if present
  let collegeName = '';
  if (keywordStr.includes('college') || keywordStr.includes('university') || keywordStr.includes('institute')) {
    const collegeKeywords = keywords.filter(k => 
      k.toLowerCase().includes('college') || 
      k.toLowerCase().includes('university') || 
      k.toLowerCase().includes('institute')
    );
    collegeName = collegeKeywords.length > 0 ? collegeKeywords[0] : 'Institute of Technology';
  } else {
    collegeName = 'Institute of Technology';
  }
  
  // Extract department/field if present
  let department = '';
  const departmentKeywords = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Medicine', 'Law'];
  for (const dept of departmentKeywords) {
    if (keywordStr.toLowerCase().includes(dept.toLowerCase())) {
      department = dept;
      break;
    }
  }
  if (!department) {
    department = 'Computer Science';
  }
  
  // Extract batch year if present
  let batchYear = null;
  const yearRegex = /\b(19|20)\d{2}\b/;
  const yearMatch = keywordStr.match(yearRegex);
  if (yearMatch) {
    batchYear = parseInt(yearMatch[0]);
  }
  
  for (let i = 0; i < limit; i++) {
    const firstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const graduationYear = batchYear || (new Date().getFullYear() - Math.floor(Math.random() * 10) - 1);
    const emailDomain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'rediffmail.com'][Math.floor(Math.random() * 4)];
    
    // Generate skills based on department
    let skills = [];
    if (department.toLowerCase().includes('computer') || department.toLowerCase().includes('engineering')) {
      skills = ['Java', 'Python', 'Angular', 'React', 'Node.js', 'AWS', 'DevOps', 'Cloud Computing'];
    } else if (department.toLowerCase().includes('business')) {
      skills = ['Marketing', 'Finance', 'Project Management', 'Leadership', 'Strategy', 'Sales', 'Business Analysis'];
    } else {
      skills = ['Research', 'Analysis', 'Communication', 'Problem Solving', 'Critical Thinking', 'Team Management'];
    }
    
    // Select random skills
    const selectedSkills = [];
    for (let j = 0; j < 3; j++) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      if (!selectedSkills.includes(randomSkill)) {
        selectedSkills.push(randomSkill);
      }
    }
    
    // Experience in years
    const experience = Math.floor(Math.random() * 10) + 1;
    
    profiles.push({
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${emailDomain}`,
      phone: `+91-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900) + 100}`,
      batch: graduationYear,
      degree: department.includes('Computer') ? ['B.Tech', 'M.Tech', 'B.E', 'M.E'][Math.floor(Math.random() * 4)] : ['BBA', 'MBA', 'B.Com', 'M.Com', 'B.Sc', 'M.Sc'][Math.floor(Math.random() * 6)],
      designation: department.includes('Computer') ? 
        ['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Technical Lead'][Math.floor(Math.random() * 5)] :
        ['Business Analyst', 'Project Manager', 'HR Manager', 'Operations Manager', 'Marketing Specialist'][Math.floor(Math.random() * 5)],
      company: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Accenture', 'Capgemini', 'IBM India', 'Mindtree'][Math.floor(Math.random() * 10)],
      location: ['Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR', 'Kolkata', 'Noida', 'Gurgaon', 'Ahmedabad'][Math.floor(Math.random() * 10)],
      bio: `${department} graduate from ${collegeName} (${graduationYear}). ${experience}+ years of experience. Skilled in ${selectedSkills.join(', ')}. Looking for challenging opportunities.`,
      image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=200`,
      naukriProfile: `https://naukri.com/profile/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 10000)}`,
      source: 'Naukri'
    });
  }
  
  return profiles;
}

export default router;