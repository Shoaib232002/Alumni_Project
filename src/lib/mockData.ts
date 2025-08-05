import { 
  Alumni,
  Feedback, 
  FundraisingCampaign,
  Donation,
  User,
  Notification,
  CollegeInfo
} from '@/types';

// Mock college information
export const collegeInfo: CollegeInfo = {
  name: "Tech University",
  location: "New York, USA",
  established: "1980",
  website: "https://www.techuniversity.edu",
  logo: "/images/Logo.jpg"
};

// Mock alumni data
export const alumniData: Alumni[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    batch: "2020",
    degree: "B.Tech Computer Science",
    currentCompany: "Google",
    designation: "Software Engineer",
    linkedInProfile: "https://linkedin.com/in/johndoe",
    naukriProfile: "https://naukri.com/johndoe",
    otherProfiles: { "github": "https://github.com/johndoe" },
    bio: "Full-stack developer with expertise in React and Node.js",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    isVerified: true,
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-05-20T14:15:00Z"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "234-567-8901",
    batch: "2020",
    degree: "B.Tech Electronics",
    currentCompany: "Amazon",
    designation: "Product Manager",
    linkedInProfile: "https://linkedin.com/in/janesmith",
    naukriProfile: "https://naukri.com/janesmith",
    bio: "Product enthusiast with a passion for user experience",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    isVerified: true,
    createdAt: "2023-02-10T09:45:00Z",
    updatedAt: "2023-06-15T11:20:00Z"
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    batch: "2019",
    degree: "M.Tech Artificial Intelligence",
    currentCompany: "Microsoft",
    designation: "AI Researcher",
    linkedInProfile: "https://linkedin.com/in/robertjohnson",
    bio: "Researching the future of AI and machine learning",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    isVerified: true,
    createdAt: "2023-03-05T14:20:00Z",
    updatedAt: "2023-07-10T16:45:00Z"
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "345-678-9012",
    batch: "2019",
    degree: "B.Tech Information Technology",
    currentCompany: "Facebook",
    designation: "UX Designer",
    linkedInProfile: "https://linkedin.com/in/emilydavis",
    naukriProfile: "https://naukri.com/emilydavis",
    bio: "Creating beautiful and intuitive user experiences",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    isVerified: false,
    createdAt: "2023-04-20T08:15:00Z",
    updatedAt: "2023-08-25T13:10:00Z"
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    batch: "2018",
    degree: "B.Tech Mechanical Engineering",
    currentCompany: "Tesla",
    designation: "Design Engineer",
    linkedInProfile: "https://linkedin.com/in/michaelwilson",
    bio: "Designing the future of electric vehicles",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    isVerified: true,
    createdAt: "2023-05-12T11:50:00Z",
    updatedAt: "2023-09-18T15:30:00Z"
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    phone: "456-789-0123",
    batch: "2018",
    degree: "B.Tech Civil Engineering",
    currentCompany: "AECOM",
    designation: "Project Manager",
    linkedInProfile: "https://linkedin.com/in/sarahbrown",
    bio: "Managing large-scale infrastructure projects",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    isVerified: true,
    createdAt: "2023-06-28T15:40:00Z",
    updatedAt: "2023-10-05T10:25:00Z"
  },
  {
    id: "7",
    name: "David Lee",
    email: "david.lee@example.com",
    batch: "2021",
    degree: "B.Tech Data Science",
    currentCompany: "IBM",
    designation: "Data Scientist",
    linkedInProfile: "https://linkedin.com/in/davidlee",
    naukriProfile: "https://naukri.com/davidlee",
    bio: "Extracting insights from data to drive business decisions",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    isVerified: false,
    createdAt: "2023-07-15T09:30:00Z",
    updatedAt: "2023-11-20T14:15:00Z"
  },
  {
    id: "8",
    name: "Jennifer Clark",
    email: "jennifer.clark@example.com",
    phone: "567-890-1234",
    batch: "2021",
    degree: "M.Tech Computer Science",
    currentCompany: "Apple",
    designation: "iOS Developer",
    linkedInProfile: "https://linkedin.com/in/jenniferclark",
    bio: "Building innovative mobile applications",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    isVerified: true,
    createdAt: "2023-08-08T13:20:00Z",
    updatedAt: "2023-12-12T16:45:00Z"
  }
];

// Mock feedback data
export const feedbackData: Feedback[] = [
  {
    id: "1",
    alumniId: "1",
    alumniName: "John Doe",
    text: "My time at Tech University helped me develop both technical skills and soft skills that are crucial in the industry.",
    rating: 5,
    createdAt: "2023-06-10T14:30:00Z",
    isApproved: true
  },
  {
    id: "2",
    alumniId: "2",
    alumniName: "Jane Smith",
    text: "The professors were very supportive and the curriculum was industry-relevant.",
    videoUrl: "https://example.com/videos/feedback1.mp4",
    rating: 4,
    createdAt: "2023-07-15T10:45:00Z",
    isApproved: true
  },
  {
    id: "3",
    alumniId: "3",
    alumniName: "Robert Johnson",
    text: "The research opportunities at Tech University are exceptional and prepared me well for my career.",
    rating: 5,
    createdAt: "2023-08-20T09:15:00Z",
    isApproved: false
  }
];

// Mock fundraising campaign data
export const fundraisingData: FundraisingCampaign[] = [
  {
    id: "1",
    title: "New Computer Lab",
    description: "Help us build a state-of-the-art computer lab for the Computer Science department.",
    goal: 50000,
    raised: 35000,
    startDate: "2023-05-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    image: "/assets/campaigns/computer-lab.jpg",
    isActive: true
  },
  {
    id: "2",
    title: "Scholarship Fund",
    description: "Support underprivileged students with full scholarships.",
    goal: 100000,
    raised: 42000,
    startDate: "2023-03-15T00:00:00Z",
    endDate: "2024-03-14T23:59:59Z",
    image: "/assets/campaigns/scholarship.jpg",
    isActive: true
  },
  {
    id: "3",
    title: "Research Center Expansion",
    description: "Expanding our research facilities to accommodate more graduate students.",
    goal: 75000,
    raised: 15000,
    startDate: "2023-08-01T00:00:00Z",
    endDate: "2024-07-31T23:59:59Z",
    image: "/assets/campaigns/research-center.jpg",
    isActive: true
  }
];

// Mock donation data
export const donationData: Donation[] = [
  {
    id: "1",
    campaignId: "1",
    alumniId: "1",
    amount: 5000,
    name: "John Doe",
    email: "john.doe@example.com",
    message: "Happy to contribute to my alma mater!",
    isAnonymous: false,
    createdAt: "2023-06-15T11:30:00Z"
  },
  {
    id: "2",
    campaignId: "1",
    amount: 1000,
    name: "Anonymous",
    email: "anonymous@example.com",
    isAnonymous: true,
    createdAt: "2023-07-20T14:45:00Z"
  },
  {
    id: "3",
    campaignId: "2",
    alumniId: "2",
    amount: 10000,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    message: "Education should be accessible to everyone!",
    isAnonymous: false,
    createdAt: "2023-08-05T09:15:00Z"
  }
];

// Mock users data
export const usersData: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@techuniversity.edu",
    role: "admin",
    isVerified: true
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    isVerified: true
  }
];

// Mock notifications data
export const notificationsData: Notification[] = [
  {
    id: "1",
    message: "New alumni John Doe added",
    type: "info",
    isRead: false,
    createdAt: "2023-09-15T10:30:00Z",
    for: "admin"
  },
  {
    id: "2",
    message: "New feedback submitted by Jane Smith",
    type: "info",
    isRead: false,
    createdAt: "2023-09-16T14:45:00Z",
    for: "admin"
  },
  {
    id: "3",
    message: "Scholarship Fund campaign reached 40% of its goal",
    type: "success",
    isRead: true,
    createdAt: "2023-09-17T09:15:00Z",
    for: "all"
  }
];