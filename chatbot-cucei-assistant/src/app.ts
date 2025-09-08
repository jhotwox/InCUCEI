import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Route to fetch academic materials
app.get('/materials/:type', (req: Request, res: Response) => {
    const { type } = req.params;

    // Here you would typically fetch the materials from a database or another service
    // For demonstration purposes, we will return a mock response
    const materials = [
        { id: 1, title: 'Material 1', type: 'pdf', url: 'http://example.com/material1.pdf' },
        { id: 2, title: 'Material 2', type: 'pdf', url: 'http://example.com/material2.pdf' },
    ];

    const filteredMaterials = materials.filter(material => material.type === type);
    
    if (filteredMaterials.length > 0) {
        res.status(200).json(filteredMaterials);
    } else {
        res.status(404).json({ message: 'No materials found for the specified type.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://192.168.100.32:${PORT}`);
});