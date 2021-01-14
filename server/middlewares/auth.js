const { verifyToken } = require('../helpers/jwt')
const { User, Task } = require('../models')

function authentication(req, res, next) {
    try {
        let decoded = verifyToken(req.headers.access_token)

        User.findOne({
            where: { email: decoded.email }
        })
            .then(data => {
                if (!data) {
                    next({
                        message: 'Please login first',
                        code: 401,
                        from: 'middleware: authentication'
                    })
                } else {
                    req.userId = data.id
                    next()
                }
            })
    } catch (error) {
        next({
            message: error.message,
            code: 500,
            from: 'middleware: authentication'
        })
    }
}

function authorization(req, res, next) {
    const task_id = +req.params.id
    const user_id = req.userId

    Task.findOne({
        where: { id: task_id }
    })
        .then(data => {
            if (!data || data.user_id !== user_id) {
                next({
                    message: 'disallowed',
                    code: 401,
                    from: 'middleware: authorization'
                })
            } else {
                next()
            }
        })
        .catch(err => {
            next({
                message: 'Internal server error',
                code: 500,
                from: 'middleware: authorization'
            })
        })
}

module.exports = { authentication, authorization }