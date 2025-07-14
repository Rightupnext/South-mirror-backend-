// routes/subscriber.js
import express from 'express';
import Subscriber from '../models/Subscriber.js';

const router= express.Router()

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(400).json({ message: "Already subscribed" });

    const subscriber = new Subscriber({ email });
    await subscriber.save();
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error subscribing", error: err.message });
  }
});

export default Subscriber;
