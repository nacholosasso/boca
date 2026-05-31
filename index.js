const express = require('express');
const { Storage } = require('@google-cloud/storage');

const app = express();
const storage = new Storage();

const bucketName = 'api-data-boca-497814'; 
const fileName = 'api_data.json';
// Leemos la clave desde las variables de entorno inyectadas por Google Cloud
const API_KEY = process.env.API_KEY;

// Endpoint que será llamado por el reloj de Cloud Scheduler
app.post('/actualizar-datos', async (req, res) => {
    try {
        const headers = { 'x-apisports-key': API_KEY };
        
        // 1. Consultamos la API de Football
        const [coachRes, squadRes] = await Promise.all([
            fetch('https://v3.football.api-sports.io/coachs?team=451', { headers }),
            fetch('https://v3.football.api-sports.io/players/squads?team=451', { headers })
        ]);

        const data = {
            coach: await coachRes.json(),
            squad: await squadRes.json(),
            ultimaActualizacion: new Date().toISOString()
        };

        // 2. Guardamos el archivo en Cloud Storage
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        
        await file.save(JSON.stringify(data), { contentType: 'application/json' });

        res.status(200).send('¡Datos actualizados y guardados en el Bucket! 💙💛');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error interno actualizando los datos');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor de Boca corriendo en el puerto ${PORT}`);
});