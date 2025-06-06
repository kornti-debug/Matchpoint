const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors());
app.use(express.json());


const homeRoutes = require('./routes/home.routes')
app.use('/api',homeRoutes)

app.get('/', (req,res) => {
    res.json({message: 'Hello World!'})
})

app.get('/test', (req,res) => {
    res.send('test World!')
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})