const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');

dotenv.config();

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing
    await User.deleteMany({});
    await Course.deleteMany({});

    // Create users
    const admin = await User.create({ name: 'Admin User', email: 'admin@lms.com', password: 'admin123', role: 'admin' });
    const instructor1 = await User.create({ name: 'Dr. Sarah Johnson', email: 'sarah@lms.com', password: 'password123', role: 'instructor' });
    const instructor2 = await User.create({ name: 'Prof. Alex Chen', email: 'alex@lms.com', password: 'password123', role: 'instructor' });
    const student1 = await User.create({ name: 'Alice Martin', email: 'alice@lms.com', password: 'password123', role: 'student' });
    const student2 = await User.create({ name: 'Bob Wilson', email: 'bob@lms.com', password: 'password123', role: 'student' });

    // Create courses
    await Course.create([
        {
            title: 'Introduction to Web Development',
            description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start building modern websites.',
            instructor: instructor1._id,
            category: 'Programming',
            level: 'Beginner',
            duration: '8 weeks',
            isPublished: true,
            enrolledStudents: [student1._id, student2._id],
            modules: [
                { title: 'Welcome to Web Dev', description: 'Welcome to the course! In this module we cover the basics of how the web works.', videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', documents: [], order: 1 },
                { title: 'HTML Fundamentals', description: 'HTML is the backbone of all web pages.', videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', documents: [{ title: 'HTML Cheatsheet', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }], order: 2 },
                { title: 'CSS Styling', description: 'CSS brings style to your HTML.', videoUrl: '', documents: [], order: 3 },
                { title: 'JavaScript Basics', description: 'JavaScript adds interactivity to web pages.', videoUrl: '', documents: [], order: 4 },
            ]
        },
        {
            title: 'Data Science with Python',
            description: 'Master data analysis, visualization, and machine learning with Python. Covers Pandas, NumPy, Matplotlib, and scikit-learn.',
            instructor: instructor2._id,
            category: 'Data Science',
            level: 'Intermediate',
            duration: '12 weeks',
            isPublished: true,
            enrolledStudents: [student1._id],
            modules: [
                { title: 'Python Refresher', description: 'Quick recap of Python essentials.', videoUrl: '', documents: [], order: 1 },
                { title: 'NumPy & Pandas', description: 'Learn to work with arrays and DataFrames.', videoUrl: '', documents: [], order: 2 },
                { title: 'Data Visualization', description: 'Create stunning charts and graphs.', videoUrl: '', documents: [], order: 3 },
            ]
        },
        {
            title: 'Digital Marketing Fundamentals',
            description: 'Understand the core concepts of digital marketing including SEO, social media, email marketing, and analytics.',
            instructor: instructor1._id,
            category: 'Marketing',
            level: 'Beginner',
            duration: '6 weeks',
            isPublished: true,
            enrolledStudents: [student2._id],
            modules: [
                { title: 'SEO Basics', description: 'Learn how search engines work.', videoUrl: '', documents: [], order: 1 },
                { title: 'Social Media Strategy', description: 'Develop effective social media strategies.', videoUrl: '', documents: [], order: 2 },
            ]
        },
        {
            title: 'Advanced React Development',
            description: 'Deep dive into React ecosystem: hooks, context, Redux, React Query, testing, and performance optimization.',
            instructor: instructor2._id,
            category: 'Programming',
            level: 'Advanced',
            duration: '10 weeks',
            isPublished: false,
            enrolledStudents: [],
            modules: []
        }
    ]);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Accounts:');
    console.log('Admin:      admin@lms.com      / admin123');
    console.log('Instructor: sarah@lms.com       / password123');
    console.log('Instructor: alex@lms.com        / password123');
    console.log('Student:    alice@lms.com       / password123');
    console.log('Student:    bob@lms.com         / password123');

    await mongoose.disconnect();
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
