import { Router } from 'express'
import Transaction from './models/Transaction.js'
import Token from './models/Token.js'
import jwt from 'jsonwebtoken'
// import user from '../next/users.json'

const routes = Router()

const verify = async function auth (req, res, next) {
    const token = req.header('auth-token');
    if(!token) return res.status(401).json({message: "Not Authenticated"});

    try {
        const isFound = await Token.findOne({ token })

        if (!isFound) {
            return res.status(401).json({
                message:'Invalid Token, user not found',
                token
            });
        } 
        
        next();
    } catch(err) {
        console.log(err.message)
        return res.status(400).send(err.message);
    }
}


routes.route('/login').post(async (req, res) => {
    const token = req.body.token;
    const isFound = await Token.findOne({ token })

    if(!isFound) {
        const dbToken = new Token({ token });
        dbToken.save().then(data => {
            res.status(200).json({ message: 'Token saved successfully'})
        })
        .catch(error => {
            console.log(error.message)
            res.status(500).json({ message: error.message});
        })  
    } else {
        res.status(200).json({ message: 'Token already exists'})
    }
})

routes.route('/logout').post(async (req, res) => {
    const token = req.body.token;
    try {
        await Token.findOneAndDelete({ token })
        res.status(200).json({ message: 'Token has been deleted'})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message});
    }
})

routes.route('/').get(verify, async (req, res) => {
    const transactions = await Transaction.find({ })
    res.status(200).json({ transactions })
})

routes.route('/add').post(verify, async (req, res) => {

    const transaction = new Transaction({
        ...req.body.transaction, hash: ''
    });

    transaction.save()
    .then(data => {
        // res.status(200).json(data);
        res.status(200).json({ transaction: data });  
    })
    .catch(error => {
        console.log(error.message)
        res.status(500).json({ message: error.message});
    })   
})

routes.route('/updateStatus').post(verify, async (req, res) => {
    const status = req.body.status
    const id = req.body.transactionId
    const hash = req.body.hash
    Transaction.updateOne(
        {_id: id},
        {$set: { status: status, hash: hash }}
    )
    .then((data) =>{
        res.json({message: "Transaction has been updated successfully", transaction: data});
    })
    .catch((error) => {
        res.status(500).json(error);
    })
})

routes.route('/updateStatusBatch').post(verify, async (req, res) => {
    const status = req.body.status
    const ids = [...req.body.transactionIds]
    const hash = req.body.hash
    Transaction.updateMany(
        {_id: { $in: ids }},
        {$set: { status: status, hash: hash }},
        {multi: true}
    )
    .then((data) =>{
        res.json({message: "Transaction has been updated successfully", transaction: data});
    })
    .catch((error) => {
        res.status(500).json(error);
    })
})

export default routes
