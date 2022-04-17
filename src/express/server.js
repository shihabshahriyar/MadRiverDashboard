import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes'
import mongoose from "mongoose"

dotenv.config({ path: "./config.env" })

const port = 8002
const app = express()
app.use(cors())
app.use(express.json())
app.use(routes)


mongoose.connect('mongodb://app:app@mongo:27017/', () => {
  console.log('Connected to Mongo');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
