const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

let blogs = [{
  id: 5,
  title: 'test title',
  content: 'test content',
}];

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Emit all blogs to the newly connected client
  socket.emit('initialBlogs', blogs);

  // Add a user to a room
  socket.on('join_room', (data) => {
    const { username, room } = data;
    socket.join(room);
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Express API routes
app.use(cors());
app.use(express.json());

// Get all blogs
app.get('/blogs', (req, res) => {
  res.json(blogs);
});

// Get a specific blog by ID
app.get('/blogs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const blog = blogs.find(blog => blog.id === id);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  res.json(blog);
});

// Create a new blog
app.post('/blogs', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  const newBlog = { id: blogs.length + 1, title, content };
  blogs.push(newBlog);
  io.emit('newBlog', newBlog);
  res.status(201).json(newBlog);
});

// Update an existing blog
app.put('/blogs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const blogIndex = blogs.findIndex(blog => blog.id === id);
  if (blogIndex === -1) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  blogs[blogIndex] = { id, title, content };
  res.json(blogs[blogIndex]);
});

// Delete a blog
app.delete('/blogs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const blogIndex = blogs.findIndex(blog => blog.id === id);
  if (blogIndex === -1) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  const deletedBlog = blogs.splice(blogIndex, 1)[0];
  res.json(deletedBlog);
  io.emit('deletedBlog', deletedBlog.id); // Emit event after successful deletion
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});