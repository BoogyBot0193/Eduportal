const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // To serve uploaded files

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Schema for Assignments
const assignmentSchema = new mongoose.Schema({
    studentName: String,
    filePath: String,
    submissionDate: { type: Date, default: Date.now },
});
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'staff'], required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const JWT_SECRET = 'secret';
// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
    },
});
const upload = multer({ storage: storage });

// Route to handle assignment upload
app.post('/upload', upload.single('assignmentFile'), async (req, res) => {
    try {
        const { studentName } = req.body;
        const assignment = new Assignment({
            studentName,
            filePath: req.file.path,
        });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload assignment' });
    }
});

// Route to fetch all assignments
app.get('/assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Route to delete an assignment by ID
app.delete('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Assignment.findByIdAndDelete(id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};
// Route to create default users (run once to setup)
app.post('/setup-users', async (req, res) => {
    try {
        // Create default staff user
        const staffPassword = await bcrypt.hash('staff123', 10);
        const staff = new User({
            username: 'staff',
            password: staffPassword,
            role: 'staff'
        });

        // Create default student user
        const studentPassword = await bcrypt.hash('student123', 10);
        const student = new User({
            username: 'student',
            password: studentPassword,
            role: 'student'
        });

        await staff.save();
        await student.save();

        res.json({ message: 'Default users created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating users' });
    }
});
// Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});
// Protect existing routes with authentication
app.post('/upload', authenticateToken, upload.single('assignmentFile'), async (req, res) => {
    try {
        // Only students can upload assignments
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can upload assignments' });
        }

        const { studentName } = req.body;
        const assignment = new Assignment({
            studentName: studentName || req.user.username,
            filePath: req.file.path,
        });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload assignment' });
    }
});

app.get('/assignments', authenticateToken, async (req, res) => {
    try {
        // Only staff can view all assignments
        if (req.user.role !== 'staff') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const assignments = await Assignment.find();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

app.delete('/assignments/:id', authenticateToken, async (req, res) => {
    try {
        // Only staff can delete assignments
        if (req.user.role !== 'staff') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { id } = req.params;
        await Assignment.findByIdAndDelete(id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});


// Start server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
