import e, { Router } from 'express'
import Transaction from './models/Transaction.js'
import Token from './models/Token.js'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library"
import { readFile } from 'fs/promises'
import sanitizeHtml from 'sanitize-html'
import web3 from 'web3'

const users = JSON.parse(await readFile(new URL('../next/users.json', import.meta.url)));
const routes = Router()

const CLIENT_ID = '418664685673-v4mnqvduk7bi7o23h2l8vjutfsfhpsrj.apps.googleusercontent.com'
const CLIENT_SECRET = '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'

const googleClient = new OAuth2Client({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
});


const verify = async function auth(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ message: 'logout' });


    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audient: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email } = payload;
        let foundUser = users.find((usr) => usr.email == email)

        if(foundUser) {
            console.log(email)
            req.user = payload
            next();
        } else {
            console.log(error.message)
            return res.status(400).json({
                message: 'logout',
                token
            });
        }
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({
            message: 'logout',
            token
        });
    }
}

const onlyAdmin = async function auth(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ message: 'logout'});


    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audient: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email } = payload;
        let foundUser = users.find((usr) => usr.email == email && usr.type == 'admin')

        if(foundUser) {
            console.log(email)
            next();
        } else {
            return res.status(401).json({
                message: 'logout',
                token
            });
        }
    } catch (error) {
        return res.status(401).json({
            message: 'logout',
            token
        });
    }
}


routes.route('/').get(verify, async (req, res) => {
    try {
        const transactions = await Transaction.find({})
        res.status(200).json({ transactions })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

routes.route('/add').post(verify, async (req, res) => {
    const sanitizedTxn = {
        email: sanitizeHtml(req.user.email),
        amount: sanitizeHtml(req.body.transaction.amount),
        memo: sanitizeHtml(req.body.transaction.memo),
        address: sanitizeHtml(req.body.transaction.address),
        coinType: sanitizeHtml(req.body.transaction.coinType),
        status: sanitizeHtml(req.body.transaction.status),
        hash: ''
    }

    if(web3.utils.isAddress(sanitizedTxn.address) == false || sanitizedTxn.amount < 0 || !!sanitizedTxn.email == false || !!sanitizedTxn.status == false) {
        res.status(400).json({ message: 'Invalid input' });
    }


    const transaction = new Transaction({
        ...sanitizedTxn
    });

    transaction.save()
        .then(data => {
            // res.status(200).json(data);
            res.status(200).json({ transaction: data });
        })
        .catch(error => {
            console.log(error.message)
            res.status(500).json({ message: error.message });
        })
})

routes.route('/updateStatus').post(onlyAdmin, async (req, res) => {
    const status = sanitizeHtml(req.body.status)
    const id = sanitizeHtml(req.body.transactionId)
    const hash = sanitizeHtml(req.body.hash)

    Transaction.updateOne(
        { _id: id },
        { $set: { status: status, hash: hash } }
    )
        .then((data) => {
            res.json({ message: "Transaction has been updated successfully", transaction: data });
        })
        .catch((error) => {
            res.status(500).json(error);
        })
})

routes.route('/updateStatusBatch').post(onlyAdmin, async (req, res) => {
    const status = sanitizeHtml(req.body.status)
    const ids = [...req.body.transactionIds].map((txn) => sanitizeHtml(txn))
    const hash = sanitizeHtml(req.body.hash)
    Transaction.updateMany(
        { _id: { $in: ids } },
        { $set: { status: status, hash: hash } },
        { multi: true }
    )
        .then((data) => {
            res.json({ message: "Transaction has been updated successfully", transaction: data });
        })
        .catch((error) => {
            res.status(500).json(error);
        })
})

export default routes
