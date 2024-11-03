const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLIC_ANON_KEY
);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// CSV file path
const csvFilePath = path.join(__dirname, 'public', 'submissions.csv');

// Initialize CSV file if it doesn't exist
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Name,Phone,Email,Message\n');
}

// Function to append data to CSV
function appendToCSV(data) {
  const { name, phone, email, message } = data;
  // Escape commas and new lines in fields
  const escapedData = [
    name.replace(/,/g, ';'),
    phone.replace(/,/g, ';'),
    email.replace(/,/g, ';'),
    message.replace(/,/g, ';').replace(/\n/g, ' ')
  ];
  const csvLine = `${escapedData.join(',')}\n`;
  fs.appendFileSync(csvFilePath, csvLine);
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit-form', async (req, res) => {
  const { name, number, email, message } = req.body;
  
  try {
    // Save to Supabase
    const { data, error } = await supabase
      .from('data')
      .insert([{ name, phone: number, email, message }]);

    if (error) throw error;
    
    // Save to CSV
    appendToCSV({ name, phone: number, email, message });
    
    res.json({ success: true, message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error submitting form: ' + error.message });
  }
});

// Route to download CSV
app.get('/download-submissions', (req, res) => {
  res.download(csvFilePath, 'submissions.csv');
});

// Password-protected route for viewing submissions
app.get('/submissions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'password.html'));  // Password prompt HTML page
});

app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.ADMIN_PASSWORD;  // Store your admin password in .env file

  if (password === correctPassword) {
    res.json({ success: true, redirectUrl: '/view-submissions' });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized access: Incorrect password' });
  }
});

app.get('/view-submissions', (req, res) => {
  // Serve the CSV data or an HTML page that displays the submissions
  res.sendFile(path.join(__dirname, 'public', 'submissions.html'));  // Display the submissions HTML
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
