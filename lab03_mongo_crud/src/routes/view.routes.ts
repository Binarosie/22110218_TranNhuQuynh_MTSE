import { Router } from 'express';
import { User } from '../models/user';

const router = Router();

// Render CRUD form
router.get('/', (req, res) => {
    res.render('crud');
});

// Render user list
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('findAllUser', { users });
    } catch (error) {
        res.render('findAllUser', { users: [] });
    }
});

// Render edit user form
router.get('/users/edit', async (req, res) => {
    try {
        const userId = req.query.id as string;
        if (userId) {
            const user = await User.findById(userId);
            res.render('editUser', { user });
        } else {
            res.redirect('/users');
        }
    } catch (error) {
        res.redirect('/users');
    }
});

export default router;