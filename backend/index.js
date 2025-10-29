//const http = require('http');
//const fs = require('fs');
//const path = require('path');

//const hostname = '127.0.0.1';
const port = 3000;

const express = require('express');
const path = require('path');

const app = express();


// Serve static files from the 'public' directory
//app.use(express.static('public'));
app.use('/images', express.static(__dirname + '/images'));

app.get('/html/Summary', (req, res) => {
    // Extract parameters from the URL
    const { GuestNum, date, time, bookingSeatsList, total, itemList, foodcost, totalcost} = req.query;

    // Generate HTML dynamically based on parameters
    const htmlContent = `
        <html>
        <head>
            <title>Booking Summary</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .summary {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
            </style>
        </head>
        <body>
            <div class="summary">
                <h1>Booking Summary</h1>
                <p><strong>Guest Number:</strong> ${GuestNum}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Booking Seats:</strong> ${bookingSeatsList}</p>
                <p><strong>Total:</strong> ${total}</p>
                <p><strong>Booking Seats:</strong> ${itemList}</p>
                <p><strong>Total:</strong> ${foodcost}</p>
                <p><strong>Total:</strong> ${totalcost}</p>
            </div>
        </body>
        </html>
    `;

    // Send the dynamically generated HTML as the response
    res.send(htmlContent);
});

//Serve HTML file based on the req
app.get('/html/:page',(req,res) =>{
    let page = req.params.page;
    if(!page.endsWith('.html'))
    {
        page +='.html';
    }
    const pagePath = path.join(__dirname, `html`, `${page}`);
    res.sendFile(pagePath);
})

//index logic for our server
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '/html/index.html');
    res.sendFile(indexPath);
});




app.get('/xml/:file', (req, res) => {
    const xmlFile = req.params.file;
    const xmlPath = path.join(__dirname,'xml',xmlFile); // Assuming XML files are in the "xml" directory
    res.sendFile(xmlPath);
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});