import { Router } from 'express'
import Transaction from './models/Transaction.js'

const routes = Router()

routes.route('/').get(async (req, res) => {
    const transactions = await Transaction.find({ })
    res.status(200).json({ transactions })
})

routes.route('/add').post(async (req, res) => {

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

routes.route('/updateStatus').post(async (req, res) => {
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

routes.route('/updateStatusBatch').post(async (req, res) => {
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
