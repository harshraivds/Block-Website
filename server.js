const express = require('express');
const app = express();
const { MongoClient } = require('mongodb'); // Destructuring MongoClient from mongodb
const PORT = process.env.PORT || 8000;

// Initialize middleware
app.use(express.json());

// Define routes

const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017'); // Corrected method name and added connection options
        const db = client.db('mernblog');
        await operations(db);
        client.close();
    } catch (error) {
        res.status(500).json({ message: "Error connecting to database", error });
    }
}

app.get('/api/articles/:name', async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(articleInfo);
    }, res);
});

app.post('/api/articles/:name/add-comments', (req, res) => {
    // Use res.send for sending plain text
    const { username, text } = req.body;
    const articleName = req.params.name;
    withDB(async (db) => {
        await db.collection('articles').updateOne({ name: articleName }, {
            $push: {
                comments: { username, text } // Corrected the update operation for comments
            }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(updatedArticleInfo);
    }, res);
});

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
